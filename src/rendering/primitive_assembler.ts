import { depth_sort } from "./depth_sorting";
import type { Mesh } from "./mesh";

/**
 * 
 * @param mesh Mutated
 * @param stride 
 */
export function assemble_primitives(mesh:Mesh):void{
    const visible_count = depth_sort(mesh);
    const projected = mesh.projected_buffer;
    const indices = mesh.indices;
    const order = mesh.draw_order;

    const out = mesh.raster_buffer
    let out_index = 0;
    for(let i = 0; i < visible_count; ++i){
        const index = order[i];

        const v1 = indices[index * 3] * 4;
        const v2 = indices[index * 3 + 1] * 4;
        const v3 = indices[index * 3 + 2] * 4;
        
        out[out_index++] = projected[v1];
        out[out_index++] = projected[v1 + 1];
        out[out_index++] = projected[v1 + 2];
        out[out_index++] = projected[v1 + 3];

        out[out_index++] = projected[v2];
        out[out_index++] = projected[v2 + 1];
        out[out_index++] = projected[v2 + 2];
        out[out_index++] = projected[v2 + 3];

        out[out_index++] = projected[v3];
        out[out_index++] = projected[v3 + 1];
        out[out_index++] = projected[v3 + 2];
        out[out_index++] = projected[v3 + 3];
    }
    mesh.visible_triangles_count = visible_count;
}
