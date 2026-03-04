import { vec3, vec4, type Line } from "../math/types";
import { perspective } from "../math/transformations";
import { inverse_mat4, mul_mat4, mul_mat4_vec4, normalize_vec3 } from "../math/matrix_operators";
import { Scene } from "../rendering/types/scene";
import { Light } from "../rendering/types/light";
import { Geometry } from "../rendering/types/geometry";
import { build_scene } from "../to_html";
import { render_scene } from "../rendering/render";
import { process_world_coordinates } from "../rendering/process_lighting";
import { StringBuffer } from "../utils/string_buffer";

import { Viewport } from "./viewport";
import { Inspector } from "./inspector";
import { initialize_toolbar } from "./toolbar";
import { Node } from "../rendering/types/node";
import type { EditorMode } from "./state_manager";
import { EditorState } from "./state_manager";

import { parse_obj } from "../utils/parser";

export class SceneManager {
    public scene: Scene;
    public nodes: Node[] = [];
    
    private viewport: Viewport;
    private inspector: Inspector;
    private editor_state:EditorState
    
    private target_element: HTMLElement;
    private wireframe_checkbox: HTMLInputElement;
    private string_buffer: StringBuffer;
    private stats_element: HTMLElement | null;
    
    private animation_id: number | null = null;
    public selected_node: Node | null = null;

    private last_mx:number = 0;
    private last_my:number = 0;

    private is_dragging = false;

    public current_triangles: number = 0;
    public current_capacity: number = 50000;
    public readonly MAX_TRIANGLES: number = 100000;

    constructor(
        svg_container_id: string,
        toolbar_id: string,
        options_id: string,
        inspector_id: string,
        wireframe_id: string,
        stats_id: string
    ) {
        const target = document.getElementById(svg_container_id);
        if (!target) throw new Error(`SVG container '${svg_container_id}' not found.`);
        this.target_element = target;

        this.wireframe_checkbox = document.getElementById(wireframe_id) as HTMLInputElement;
        this.stats_element = document.getElementById(stats_id);
        
        this.scene = new Scene(this.current_capacity); 
        this.string_buffer = new StringBuffer(this.current_capacity * 60);
        
        this.viewport = new Viewport(svg_container_id);
        this.inspector = new Inspector(inspector_id);
        this.editor_state = new EditorState(this.inspector,this.scene);

        this.setup_lights();
        this.update_stats_ui();
        this.setup_raycasting();

        initialize_toolbar(toolbar_id, options_id, (geo: Geometry) => {
            this.add_node(geo);
        });
    }

    private setup_lights() {
        const sun_light = new Light(vec3(10, 10, 10), vec3(1.0, 0.95, 0.9), 3.0, 200.0);
        const leskow_light = new Light(vec3(5,0,0),vec3(0.8,0.2,0.0), 2.0, 100.0);
        this.scene.add_light(sun_light);
        this.scene.add_light(leskow_light);
    }

    public add_node(geo: Geometry) {
        const new_triangles = geo.indices.length / 3;

        if (this.current_triangles + new_triangles > this.MAX_TRIANGLES) {
            alert(`Cannot add object! This would exceed the engine limit of ${this.MAX_TRIANGLES} triangles.`);
            return;
        }

        if (this.current_triangles + new_triangles > this.current_capacity) {
            this.expand_capacity(this.current_triangles + new_triangles);
        }

        const mesh = this.scene.add_mesh(geo, vec3(0.7, 0.7, 0.7), 0.5); 
        
        const node = new Node(mesh);
        this.nodes.push(node);
        
        this.current_triangles += new_triangles;
        this.update_stats_ui();
        
        this.select_node(node);
    }

    private expand_capacity(required_triangles: number) {
        let new_capacity = this.current_capacity * 2;
        if (new_capacity < required_triangles) new_capacity = required_triangles;
        if (new_capacity > this.MAX_TRIANGLES) new_capacity = this.MAX_TRIANGLES;

        
        this.scene.resize_buffers(new_capacity);

        if (typeof this.string_buffer.resize === 'function') {
            this.string_buffer.resize(new_capacity * 60); 
        } else {
            console.warn("StringBuffer.resize() is not implemented yet!");
        }
        
        this.current_capacity = new_capacity;
    }

    private update_stats_ui() {
        if (!this.stats_element) return;
        
        this.stats_element.innerText = `${Math.floor(this.current_triangles)} / ${this.MAX_TRIANGLES}`;
        
        if (this.current_triangles > this.MAX_TRIANGLES * 0.9) {
            this.stats_element.style.color = "red";
        } else {
            this.stats_element.style.color = "white";
        }
    }

    public select_node(node: Node) {
        this.selected_node = node;
        this.editor_state.select(this.selected_node);
    }

    public start() {
        if (this.animation_id !== null) {
            cancelAnimationFrame(this.animation_id);
        }
        this.loop();
    }

    private loop = () => {
        const camera_pos = this.viewport.camera_pos;
        const view = this.viewport.get_view_matrix();
        const projection = this.viewport.get_projection();
        const vp = mul_mat4(projection, view);

        this.editor_state.update_gizmo_transforms();

        const all_nodes = [
           this.editor_state.gizmo_z,
           this.editor_state.gizmo_y,
           this.editor_state.gizmo_x,
            ...this.nodes
        ]

        const models = all_nodes.map(n => n.model);
        const mvps = models.map(m => mul_mat4(vp, m));

        for (let i = 0; i < this.scene.meshes.length; ++i) {
            this.scene.meshes[i].update_normals(models[i]);
        }

        process_world_coordinates(this.scene, models, camera_pos);

        const do_wireframe = this.wireframe_checkbox?.checked || false;
        render_scene(this.scene, mvps, true);

        this.target_element.innerHTML = build_scene(this.scene, do_wireframe, this.string_buffer);

        this.animation_id = requestAnimationFrame(this.loop);
    }

    private get_mouse_ray(e: MouseEvent): Line | null {
        const rect = this.target_element.getBoundingClientRect();
        const mouse_x = e.clientX - rect.left;
        const mouse_y = e.clientY - rect.top;

        const x_ndc = (2.0 * mouse_x) / rect.width - 1.0;
        const y_ndc = 1.0 - (2.0 * mouse_y) / rect.height; 

        const view = this.viewport.get_view_matrix();
        const projection = this.viewport.get_projection();
        const vp = mul_mat4(projection, view);
        const inv_vp = inverse_mat4(vp);

        if (!inv_vp) return null;

        const near_vec = vec4(x_ndc, y_ndc, -1.0, 1.0);
        const near_unproj = mul_mat4_vec4(inv_vp, near_vec);
        const near_point = vec3(
            near_unproj[0] / near_unproj[3],
            near_unproj[1] / near_unproj[3],
            near_unproj[2] / near_unproj[3]
        );

        const far_vec = vec4(x_ndc, y_ndc, 1.0, 1.0);
        const far_unproj = mul_mat4_vec4(inv_vp, far_vec);
        const far_point = vec3(
            far_unproj[0] / far_unproj[3],
            far_unproj[1] / far_unproj[3],
            far_unproj[2] / far_unproj[3]
        );

        const direction = vec3(
            far_point[0] - near_point[0],
            far_point[1] - near_point[1],
            far_point[2] - near_point[2]
        );
        normalize_vec3(direction);

        return {
            point: this.viewport.camera_pos,
            directional_vector: direction
        };
    }
    private setup_raycasting() {
        this.target_element.addEventListener("mousedown", (e: MouseEvent) => {
            if (e.button !== 0) return;

            this.is_dragging = true;
            this.last_mx = e.clientX;
            this.last_my = e.clientY;

            const ray = this.get_mouse_ray(e);
            if(!ray) return;

            this.editor_state.handle_mouse_down(ray, e.clientX, e.clientY, this.nodes);
            this.selected_node = this.editor_state.selected_node;
        });
        window.addEventListener("mousemove", (e: MouseEvent) => {
            if (!this.is_dragging && this.editor_state.selected_node){
                const ray = this.get_mouse_ray(e);
                if(!ray) return;
                const is_hovering = 
                this.editor_state.gizmo_x.intersects_with(ray) ||
                this.editor_state.gizmo_y.intersects_with(ray) ||
                this.editor_state.gizmo_z.intersects_with(ray);
                this.target_element.style.cursor = is_hovering ? "pointer" : "default";
                return;
            }

            if(!this.is_dragging) return;
            
            const dx = e.clientX - this.last_mx;
            const dy = e.clientY - this.last_my;
            
            this.last_mx = e.clientX;
            this.last_my = e.clientY;

            if (this.editor_state.mode !== "IDLE") {
                const view = this.viewport.get_view_matrix();
                const projection = this.viewport.get_projection();
                const vp = mul_mat4(projection,view);

                const {width,height} = this.viewport.get_dimensions();
                this.editor_state.handle_mouse_move(e.clientX, e.clientY,vp,width,height);
            } else {
                this.viewport.orbit(dx, dy);
            }
        });
        window.addEventListener("mouseup", () => {
            this.is_dragging = false; 
            this.editor_state.handle_mouse_up();
        });
    }
}