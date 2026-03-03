import { Node } from "../rendering/types/node";
import { vec3 } from "../math/types";
import type { Line } from "../math/types";
import { Inspector } from "./inspector";
import { create_arrow } from "../rendering/utils/primitives";
import { Mesh } from "../rendering/types/mesh";
import type { Scene } from "../rendering/types/scene";

export enum EditorMode {
    IDLE,
    TRANSLATE_X,
    TRANSLATE_Y,
    TRANSLATE_Z
}

export class EditorState {
    public mode: EditorMode = EditorMode.IDLE;
    public selected_node: Node | null = null;
    
    public gizmo_x!: Node;
    public gizmo_y!: Node;
    public gizmo_z!: Node;

    private inspector: Inspector;

    constructor(inspector: Inspector, scene:Scene) {
        this.inspector = inspector;
        this.setup_gizmos(scene);
    }

    private setup_gizmos(scene:Scene) {
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
        this.update_gizmo_transforms();
    }

    public update_gizmo_transforms() {
        if (!this.selected_node) return;
        const pos = this.selected_node.position;
        
        this.gizmo_x.position = vec3(pos[0], pos[1], pos[2]);
        this.gizmo_y.position = vec3(pos[0], pos[1], pos[2]);
        this.gizmo_z.position = vec3(pos[0], pos[1], pos[2]);
        
        this.gizmo_x.update_matrix();
        this.gizmo_y.update_matrix();
        this.gizmo_z.update_matrix();
    }

    public process_raycast(ray: Line, scene_nodes: Node[]) {
        if (this.selected_node) {
            if (this.gizmo_x.intersects_with(ray)) {
                this.mode = EditorMode.TRANSLATE_X;
                return;
            }
            if (this.gizmo_y.intersects_with(ray)) {
                this.mode = EditorMode.TRANSLATE_Y;
                return;
            }
            if (this.gizmo_z.intersects_with(ray)) {
                this.mode = EditorMode.TRANSLATE_Z;
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

    public process_drag(dx: number, dy: number) {
        if (!this.selected_node || this.mode === EditorMode.IDLE) return;

        console.log(`Dragging mode: ${this.mode}, Delta: ${dx}, ${dy}`);
        
        this.update_gizmo_transforms();
    }

    public release_drag() {
        this.mode = EditorMode.IDLE;
    }

    public get_active_gizmos(): Node[] {
        if (!this.selected_node) return [];
        return [this.gizmo_x, this.gizmo_y, this.gizmo_z];
    }
}