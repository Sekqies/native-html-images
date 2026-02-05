import { ArrayType, vec4 } from "../math/types";
import { process_perspective, to_viewport_space } from "./vertex";


export function rasterize(vertices:ArrayType, invert_y:boolean = true, stride:number = 4):ArrayType {
    const num_verts = vertices.length/stride;
    const num_triangles = num_verts/3;
    const out = new ArrayType(num_triangles * 6);
    let out_index = 0;
    for(let i = 0; i < num_triangles; ++i){
        const base = 3 * i * stride;
        const c1 = vec4(vertices[base + 0], vertices[base + 1], vertices[base + 2], vertices[base + 3]);
        const c2 = vec4(vertices[base + stride + 0], vertices[base + stride + 1], vertices[base + stride + 2], vertices[base + stride + 3]);
        const c3 = vec4(vertices[base + stride * 2 + 0], vertices[base + stride * 2 + 1], vertices[base + stride * 2 + 2], vertices[base + stride * 2 + 3]);

        const n1 = process_perspective(c1);
        const n2 = process_perspective(c2);
        const n3 = process_perspective(c3);

        if(!n1 || !n2 || !n3){
            continue;
        }

        const sign = invert_y? -1 : 1;

        out[out_index++] = n1[0];
        out[out_index++] = sign * n1[1];
        
        out[out_index++] = n2[0];
        out[out_index++] = sign * n2[1];

        out[out_index++] = n3[0];
        out[out_index++] = sign * n3[1];
    }
    return out.subarray(0,out_index);
}