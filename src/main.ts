import { mat4, vec3 } from "./math/types";
import { perspective, identity, look_at, rotate, translate } from "./math/transformations";
import { create_sphere } from "./rendering/primitives";
import { build_mesh, render_scene } from "./rendering/render";
import { StringBuffer } from "./utils/string_buffer";
import { Mesh } from "./rendering/mesh";
import { Scene } from "./rendering/scene";
import { mul_mat4 } from "./math/matrix_operators";
import { build_scene } from "./to_html";


export function main_3d() {
    const target = document.getElementById('container');
    if (!target) return;
    const wireframe_el = document.getElementById('wireframe-mode') as HTMLInputElement;
    const do_wireframe:boolean = wireframe_el?.checked; 
    const sun_mesh = create_sphere(1.5, 10, 10); 
    const planet_mesh = create_sphere(0.5, 10, 10);

    const scene:Scene = new Scene([sun_mesh.vertices,planet_mesh.vertices],[sun_mesh.indices,planet_mesh.indices]);



    const y = vec3(0,1,0);
    const view:mat4 = look_at(vec3(0,2,6.5),vec3(0,0,0),y);
    const projection = perspective(60 * Math.PI / 180, 400/300, 0.1, 100);
    let time = 0;
    const string_buffer = new StringBuffer(1024*1024);
    const vp = mul_mat4(projection,view);
    const loop = () => {
        time += 0.01;

        let frame_html = "";
        let sun_model = identity();
        sun_model = rotate(sun_model, time * 0.5, y);
        let planet_model = identity();
        planet_model = rotate(planet_model, time, vec3(0, 1, 0));
        planet_model = translate(planet_model, vec3(3.5, 0, 0));
        planet_model = rotate(planet_model, time * 3, vec3(1, 0, 1));

        const planet_mvp = mul_mat4(vp,planet_model);
        const sun_mvp = mul_mat4(vp,sun_model);

        render_scene(scene,[sun_mvp,planet_mvp],true);
        frame_html = build_scene(scene,do_wireframe,string_buffer);

        target!.innerHTML = frame_html;
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

document.getElementById('render')?.addEventListener('click', main_3d);