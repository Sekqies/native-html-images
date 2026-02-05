import { build_3d_svg} from "./to_html";
import { mat4, vec3 } from "./math/types";
import { PrimitiveAssembler } from "./rendering/primitive_assembler";
import { identity, look_at, perspective, rotate, translate } from "./math/transformations";
import { transform_vertex } from "./rendering/vertex";
import { rasterize } from "./rendering/rasterizer";
import { create_sphere } from "./rendering/primitives";



export function main_3d() {
    const target = document.getElementById('container');
    if (!target) return;
    const wireframe_el = document.getElementById('wireframe-mode') as HTMLInputElement;
    const do_wireframe:boolean = wireframe_el?.checked; 
    const sun_mesh = create_sphere(1.5, 16, 16); 
    const planet_mesh = create_sphere(0.5, 12, 12);

    const assembler = new PrimitiveAssembler(12000); 

    const aspect = 400 / 300;
    const proj_mat = perspective(60 * Math.PI / 180, aspect, 0.1, 100);
    const view_mat = look_at(
        vec3(0, 2, 6.5),  
        vec3(0, 0, 0), 
        vec3(0, 1, 0)   
    );
    let time = 0;
    const loop = () => {
        time += 0.01;

        let frame_html = "";
        let sun_model = identity();
        sun_model = rotate(sun_model, time * 0.5, vec3(0, 1, 0));
        frame_html += process_object(sun_mesh, sun_model);
        let planet_model = identity();
        planet_model = rotate(planet_model, time, vec3(0, 1, 0));
        planet_model = translate(planet_model, vec3(3.5, 0, 0));
        planet_model = rotate(planet_model, time * 3, vec3(1, 0, 1));
        frame_html += process_object(planet_mesh, planet_model);

        target!.innerHTML = frame_html;
        requestAnimationFrame(loop);
    }

    const process_object = (mesh: { vertices: Float32Array, indices: Uint16Array }, model: mat4) => {
        const vertex_count = mesh.vertices.length / 3;
        const projected_buffer = new Float32Array(vertex_count * 4);

        for (let i = 0; i < vertex_count; i++) {
            const x = mesh.vertices[i * 3 + 0];
            const y = mesh.vertices[i * 3 + 1];
            const z = mesh.vertices[i * 3 + 2];

            const v_clip = transform_vertex(proj_mat, view_mat, model, vec3(x, y, z));

            projected_buffer[i * 4 + 0] = v_clip[0];
            projected_buffer[i * 4 + 1] = v_clip[1];
            projected_buffer[i * 4 + 2] = v_clip[2];
            projected_buffer[i * 4 + 3] = v_clip[3];
        }

        const assembled = assembler.assemble_primitives(projected_buffer, mesh.indices);

        const screen_verts = rasterize(assembled,true);
        return build_3d_svg(screen_verts, do_wireframe);
    }
    requestAnimationFrame(loop);
}

document.getElementById('render')?.addEventListener('click', main_3d);