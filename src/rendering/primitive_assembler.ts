import { ArrayType } from "../math/types";
import type { Mesh } from "./mesh";

/**
 * 
 * @param mesh Mutated
 * @param stride 
 */
export function assemble_primitives(mesh:Mesh, stride:number = 4):void{
    const vertices = mesh.projected_buffer;
    const indices = mesh.indices;
    const required_space = indices.length * stride;
    if (mesh.raster_buffer.length < required_space){
        console.warn("Resizing the raster buffer's out - this generally shouldn't happen");
        mesh.raster_buffer = new ArrayType(required_space);
    }
    const out = mesh.raster_buffer
    let out_index = 0;
    for(let i = 0; i < indices.length; ++i){
        const index = indices[i];
        const start = index * stride;
        
        for(let k = 0; k < stride; ++k){
            out[out_index++] = vertices[start + k];
        }
    }
}
