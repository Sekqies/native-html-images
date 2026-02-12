import { mat4, vec3 } from "./math/types";
import { perspective, identity, look_at, rotate, translate } from "./math/transformations";
import { create_sphere } from "./rendering/utils/primitives";
import { build_mesh, render_scene } from "./rendering/render";
import { StringBuffer } from "./utils/string_buffer";
import { Mesh } from "./rendering/types/mesh";
import { Scene } from "./rendering/types/scene";
import { mul_mat4 } from "./math/matrix_operators";
import { build_scene } from "./to_html";
import { process_world_coordinates } from "./rendering/process_lighting";
import { Light } from "./rendering/types/light";


function generate_random_lights(LIGHT_COUNT:number, scene:Scene){
    const lights = [];
    for (let i = 0; i < LIGHT_COUNT; i++) {
        const color = vec3(Math.random(), Math.random(), Math.random());
        const l = new Light(vec3(0,0,0), color, 4.0, 12.0);
        scene.add_light(l);

        const mesh = create_sphere(0.15, 8, 8);
        const mesh_idx = scene.meshes.length; 
        scene.add_mesh(mesh);
        lights.push({
            light: l,
            mesh_idx: mesh_idx,
            orbit: {
                speed: 0.4 + Math.random() * 0.8,
                radius: 2.5 + Math.random() * 2.0,
                phase: Math.random() * Math.PI * 2,
                y_offset: (Math.random() - 0.5) * 4
            }
        });
    }
    return lights;
}

let animation_id:number|null = null;


export function main_3d() {
    if(animation_id !== null){
        cancelAnimationFrame(animation_id);
    }
    const target = document.getElementById('container');
    if (!target) return;
    const wireframe_el = document.getElementById('wireframe-mode') as HTMLInputElement;

    const sun_geo = create_sphere(1.5, 32, 32); 
    const planet_geo = create_sphere(0.5, 16, 16);
    const bulb_geo = create_sphere(0.15, 8, 8); 

    const scene: Scene = new Scene(40000);
    scene.add_mesh(sun_geo,vec3(0.4,0.3,0.6),0.7);
    scene.add_mesh(planet_geo,vec3(0.7,0.6,0.8));
    scene.add_mesh(bulb_geo,vec3(1,1,0.8));

    const camera_pos:vec3 = vec3(0,2,6.5);

    const y = vec3(0, 1, 0);
    const view: mat4 = look_at(camera_pos, vec3(0, 0, 0), y);
    const projection = perspective(60 * Math.PI / 180, 400 / 300, 0.1, 100);
    const vp = mul_mat4(projection, view);
    let time = 0;
    const string_buffer = new StringBuffer(scene.scene_buffer.length * 50);

    const sun_light = new Light(vec3(10, 10, 10), vec3(1.0, 0.95, 0.9), 3.0, 200.0);
    
    const point_light = new Light(
        vec3(0, 0, 0),      
        vec3(1.0, 1.0, 0.5), 
        5.0,                
        15.0               
    );

    const lights = generate_random_lights(0,scene);

    scene.add_light(sun_light);
    scene.add_light(point_light);
    const do_wireframe: boolean = wireframe_el?.checked;

    const loop = () => {
        time += 0.01;

        const lx = Math.cos(time * 2) * 2.5;
        const ly = Math.sin(time * 2) * 2.5;
        const lz = Math.sin(time) * 1.5; 

        let rotate_matrix = rotate(identity(),time,y);
        rotate_matrix = rotate(identity(),time*2,vec3(1,0,0));
        
        let sun_model = rotate(identity(), time * 0.5, y);
        
        let planet_model = rotate(identity(), time, y);
        planet_model = translate(planet_model, vec3(3.5, 0, 0));
        planet_model = rotate(planet_model, time * 3, vec3(1, 0, 1));

        let bulb_model = translate(identity(), vec3(lx, ly, lz));

        const models = [sun_model, planet_model, bulb_model];
        
        point_light.position[0] = lx;
        point_light.position[1] = ly;
        point_light.position[2] = lz;

        lights.forEach(entity => {
            const { light, orbit } = entity;
            
            const x = Math.cos(time * orbit.speed + orbit.phase) * orbit.radius;
            const z = Math.sin(time * orbit.speed + orbit.phase) * orbit.radius;
            const y_pos = orbit.y_offset;

            light.position[0] = x;
            light.position[1] = y_pos;
            light.position[2] = z;
            const bulb_model = mul_mat4(translate(identity(), vec3(x, y_pos, z)),rotate_matrix);
            models.push(bulb_model);
        });
        const mvps = models.map(m => mul_mat4(vp, m));

        for (let i = 0; i < scene.meshes.length; ++i) {
            scene.meshes[i].update_normals(models[i]);
        }
        
        process_world_coordinates(scene, models);
        render_scene(scene, mvps, true);
        
        const frame_html = build_scene(scene, do_wireframe, string_buffer);
        target!.innerHTML = frame_html;
        animation_id = requestAnimationFrame(loop);
    }
    animation_id = requestAnimationFrame(loop);
}

document.getElementById('render')?.addEventListener('click', main_3d);