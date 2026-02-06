import { vec3, vec4 } from "../math/types";
import type { Mesh } from "./mesh";
import { process_perspective_mutate} from "./vertex";


/**
 * 
 * @param mesh (Mutated)
 * @param invert_y 
 * @param stride 
 */
export function rasterize(mesh:Mesh, invert_y:boolean = true, stride:number = 4):void {
    const num_verts = mesh.raster_buffer.length/stride;
    const num_triangles = num_verts/3;
    const vertices = mesh.raster_buffer;
    const out = mesh.raster_buffer;
    let out_index = 0;
    let c1:vec4, c2:vec4, c3:vec4;
    c1 = vec4(0,0,0,0);
    c2 = vec4(0,0,0,0);
    c3 = vec4(0,0,0,0);

    const sign = invert_y? -1 : 1;

    let n1 = vec3(0,0,0);
    let n2 = vec3(0,0,0);
    let n3 = vec3(0,0,0);

    for(let i = 0; i < num_triangles; ++i){
        const base = 3 * i * stride;
        c1[0] = vertices[base + 0]; c1[1] = vertices[base + 1]; c1[2] = vertices[base + 2]; c1[3] = vertices[base + 3];
        c2[0] = vertices[base + stride + 0]; c2[1] = vertices[base + stride + 1]; c2[2] = vertices[base + stride + 2]; c2[3] = vertices[base + stride + 3];
        c3[0] = vertices[base + stride * 2 + 0]; c3[1] = vertices[base + stride * 2 + 1]; c3[2] = vertices[base + stride * 2 + 2]; c3[3] = vertices[base + stride * 2 + 3];

        const v1 = process_perspective_mutate(c1, n1);
        const v2 = process_perspective_mutate(c2, n2);
        const v3 = process_perspective_mutate(c3, n3);

        if(!v1 || !v2 || !v3){
            continue;
        }

        out[out_index++] = n1[0];
        out[out_index++] = sign * n1[1];
        
        out[out_index++] = n2[0];
        out[out_index++] = sign * n2[1];

        out[out_index++] = n3[0];
        out[out_index++] = sign * n3[1];
    }
    mesh.raster_end = out_index;
}