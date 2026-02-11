import type { Mesh } from "../types/mesh";

/**
 * 
 * @param mesh Mutated
 * @param stride 
 */
export function assemble_primitives(mesh:Mesh):void{
    const projected = mesh.projected_buffer;
    const indices = mesh.indices;

    const out = mesh.raster_buffer;
    const out_color = mesh.raster_color;
    let out_index = 0;
    let out_color_index = 0;
    for(let i = 0; i < indices.length; ++i){
        const index = indices[i];
        const p_base = index * 4;
        const c_base = index * 3;
        
        out[out_index++] = projected[p_base];
        out[out_index++] = projected[p_base + 1];
        out[out_index++] = projected[p_base + 2];
        out[out_index++] = projected[p_base + 3];

        out_color[out_color_index++] = mesh.color_buffer[c_base];
        out_color[out_color_index++] = mesh.color_buffer[c_base + 1];
        out_color[out_color_index++] = mesh.color_buffer[c_base + 2];
    }
}
