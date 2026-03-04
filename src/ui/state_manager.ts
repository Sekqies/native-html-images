import { Node } from "../rendering/types/node";
import { vec3, vec4 } from "../math/types";
import type { Line, mat4 } from "../math/types";
import { Inspector } from "./inspector";
import { create_arrow } from "../rendering/utils/primitives";
import type { Scene } from "../rendering/types/scene";
import { scale } from "../math/transformations";
import { mul_mat4_vec4, scalar_mult_vec3 } from "../math/matrix_operators";

export type EditorMode = "IDLE" | "TRANSLATE_X" | "TRANSLATE_Y" | "TRANSLATE_Z";

export class EditorState {
    public mode: EditorMode = "IDLE";
    public selected_node: Node | null = null;
    
    public gizmo_x!: Node;
    public gizmo_y!: Node;
    public gizmo_z!: Node;

    private is_dragging = false;
    private last_x = 0;
    private last_y = 0;

    private inspector: Inspector;

    constructor(inspector: Inspector, scene: Scene) {
        this.inspector = inspector;
        this.setup_gizmos(scene);
        this.select(null);
    }

    private setup_gizmos(scene: Scene) {
        const arrow_geo = create_arrow(); 
        
        const mesh_z = scene.add_mesh(arrow_geo, vec3(0, 0, 1), 0);
        this.gizmo_z = new Node(mesh_z);
        
        const mesh_x = scene.add_mesh(arrow_geo, vec3(1, 0, 0), 0);
        this.gizmo_x = new Node(mesh_x);
        this.gizmo_x.rotation[1] = Math.PI / 2; 
        
        const mesh_y = scene.add_mesh(arrow_geo, vec3(0, 1, 0), 0);
        this.gizmo_y = new Node(mesh_y);
        this.gizmo_y.rotation[0] = -Math.PI / 2;

        this.gizmo_x.update_matrix();
        this.gizmo_y.update_matrix();
        this.gizmo_z.update_matrix();
    }

    public select(node: Node | null) {
        this.selected_node = node;
        this.inspector.inspect(node);

        if (node) {
            let extent = 0
            for(let i = 0; i < 3; ++i){
                extent = Math.max(node.radius[i] * Math.abs(node.scale_vec[i]),extent);
            }
            const gizmo_size = extent + 0.2;

            
            this.gizmo_x.scale_vec = vec3(gizmo_size, gizmo_size, gizmo_size);
            this.gizmo_y.scale_vec = vec3(gizmo_size, gizmo_size, gizmo_size);
            this.gizmo_z.scale_vec = vec3(gizmo_size, gizmo_size, gizmo_size);
            this.update_gizmo_transforms();
        } else {
            this.gizmo_x.scale_vec = vec3(0, 0, 0);
            this.gizmo_y.scale_vec = vec3(0, 0, 0);
            this.gizmo_z.scale_vec = vec3(0, 0, 0);
            this.update_gizmo_transforms();
        }
    }

    public update_gizmo_transforms() {
        if (!this.selected_node) {
            this.gizmo_x.update_matrix();
            this.gizmo_y.update_matrix();
            this.gizmo_z.update_matrix();
            return;
        }

        const pos = this.selected_node.position;
        
        this.gizmo_x.position = vec3(pos[0], pos[1], pos[2]);
        this.gizmo_y.position = vec3(pos[0], pos[1], pos[2]);
        this.gizmo_z.position = vec3(pos[0], pos[1], pos[2]);
        
        this.gizmo_x.update_matrix();
        this.gizmo_y.update_matrix();
        this.gizmo_z.update_matrix();
    }

    public handle_mouse_down(ray: Line, mouse_x: number, mouse_y: number, scene_nodes: Node[]) {
        this.is_dragging = true;
        this.last_x = mouse_x;
        this.last_y = mouse_y;

        if (this.selected_node) {
            if (this.gizmo_x.intersects_with(ray)) {
                this.mode = "TRANSLATE_X";
                return;
            }
            if (this.gizmo_y.intersects_with(ray)) {
                this.mode = "TRANSLATE_Y";
                return;
            }
            if (this.gizmo_z.intersects_with(ray)) {
                this.mode = "TRANSLATE_Z";
                return;
            }
        }
        for (const node of scene_nodes) {
            if (node.intersects_with(ray)) {
                this.select(node);
                return;
            }
        }
        this.select(null);
    }

public handle_mouse_move(mouse_x: number, mouse_y: number, vp: mat4, width: number, height: number) {
        if (!this.is_dragging) return;

        const dx = mouse_x - this.last_x;
        const dy = mouse_y - this.last_y;
        this.last_x = mouse_x;
        this.last_y = mouse_y;

        if (!this.selected_node || this.mode === "IDLE") return;

        const pos = this.selected_node.position;
        
        let axis_3d = vec3(0, 0, 0);
        if (this.mode === "TRANSLATE_X") axis_3d = vec3(1, 0, 0);
        else if (this.mode === "TRANSLATE_Y") axis_3d = vec3(0, 1, 0);
        else if (this.mode === "TRANSLATE_Z") axis_3d = vec3(0, 0, 1);

        const origin_screen = this.project_to_screen(pos, vp, width, height);
        
        const point_on_axis = vec3(pos[0] + axis_3d[0], pos[1] + axis_3d[1], pos[2] + axis_3d[2]);
        const axis_screen = this.project_to_screen(point_on_axis, vp, width, height);

        let dir_x = axis_screen[0] - origin_screen[0];
        let dir_y = axis_screen[1] - origin_screen[1];

        const len = Math.sqrt(dir_x * dir_x + dir_y * dir_y);
        if (len > 0.0001) {
            dir_x /= len;
            dir_y /= len;
        }
        const move_amount = (dx * dir_x) + (dy * dir_y);

        const sensitivity = 1 / len;    
        const total_move = move_amount * sensitivity;


        this.selected_node.position[0] += axis_3d[0] * total_move;
        this.selected_node.position[1] += axis_3d[1] * total_move;
        this.selected_node.position[2] += axis_3d[2] * total_move;

        this.selected_node.update_matrix();
        this.update_gizmo_transforms();
        
        this.inspector.inspect(this.selected_node); 
    }

    public handle_mouse_up() {
        this.is_dragging = false;
        this.mode = "IDLE";
    }

    public get_active_gizmos(): Node[] {
        if (!this.selected_node) return [];
        return [this.gizmo_x, this.gizmo_y, this.gizmo_z];
    }

    private project_to_screen(p:vec3, vp:mat4, width:number, height:number): [number,number]{
        const p_clip = mul_mat4_vec4(vp,vec4(p[0],p[1],p[2],1.0));

        const ndc_x = p_clip[0] / p_clip[3];
        const ndc_y = p_clip[1] / p_clip[3];


        const screen_x = (ndc_x + 1.0) * width / 2; 
        const screen_y = (1.0 - ndc_y) * height / 2;
        
        return [screen_x, screen_y];

    }
}