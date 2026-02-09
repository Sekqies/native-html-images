import type { Mesh } from "./mesh";

/**
 * 
 * @param mesh Mutated
 * @param stride 
 */
export function assemble_primitives(mesh:Mesh):void{
    const projected = mesh.projected_buffer;
    const indices = mesh.indices;

    const out = mesh.raster_buffer
    let out_index = 0;
    for(let i = 0; i < indices.length; ++i){
        const index = indices[i];
const p_base = index * 4;
        
        out[out_index++] = projected[p_base];
        out[out_index++] = projected[p_base + 1];
        out[out_index++] = projected[p_base + 2];
        out[out_index++] = projected[p_base + 3];
    }
}
