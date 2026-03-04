import { mat4, vec3 } from "../math/types";
import { look_at, perspective } from "../math/transformations";

export class Viewport {
    public camera_pos: vec3 = vec3(0, 0, 0);
    public target: vec3 = vec3(0, 0, 0);
    
    public radius: number = 10.0;
    public theta: number = Math.PI / 4;
    public phi: number = Math.PI / 6;  

    public projection:mat4 = perspective(60 * Math.PI / 180, 400 / 300, 0.1, 100);

    private last_mouse_x = 0;
    private last_mouse_y = 0;
    private is_dragging = false;

    private changed_projection = false;

    public container: HTMLElement;
    

    constructor(container_id: string) {
        const el = document.getElementById(container_id);
        if (!el) throw new Error(`Viewport container '${container_id}' not found.`);
        this.container = el;

        this.update_camera_position();
        this.attach_event_listeners();
    }

    private update_camera_position() {
        const epsilon = 0.001;
        const half_pi = Math.PI / 2;
        this.phi = Math.max(-half_pi + epsilon, Math.min(half_pi - epsilon, this.phi));

        this.camera_pos[0] = this.target[0] + this.radius * Math.sin(this.theta) * Math.cos(this.phi);
        this.camera_pos[1] = this.target[1] + this.radius * Math.sin(this.phi);
        this.camera_pos[2] = this.target[2] + this.radius * Math.cos(this.theta) * Math.cos(this.phi);
    }

    public get_view_matrix(): mat4 {
        return look_at(this.camera_pos, this.target, vec3(0, 1, 0));
    }

    public get_dimensions() : {width:number, height:number}{
        this.changed_projection = true;
        return {
            width: this.container.clientWidth || 400,
            height:this.container.clientHeight || 300
        }
    }

    public get_projection() : mat4 {
        if(this.changed_projection){
            const {width, height} = this.get_dimensions();
            const ratio = width / height;
            this.projection = perspective(60 * Math.PI / 180, ratio, 0.1,100);
            this.changed_projection = false;
        }   
        return this.projection;
    }

    public orbit(delta_x: number, delta_y: number) {
        const rotation_speed = 0.01;
        this.theta -= delta_x * rotation_speed;
        this.phi += delta_y * rotation_speed;
        this.update_camera_position();
    }

    private attach_event_listeners() {
        this.container.addEventListener("mousedown", (e: MouseEvent) => {
            this.is_dragging = true;
            this.last_mouse_x = e.clientX;
            this.last_mouse_y = e.clientY;
            this.container.style.cursor = "grabbing";
        });

        window.addEventListener("mouseup", () => {
            this.is_dragging = false;
            this.container.style.cursor = "default";
        });

        this.container.addEventListener("wheel", (e: WheelEvent) => {
            e.preventDefault();

            const zoom_speed = 0.01;
            this.radius += e.deltaY * zoom_speed;
            
            this.radius = Math.max(0.5, Math.min(this.radius, 100.0)); 
            
            this.update_camera_position();
        }, { passive: false });
    }
}