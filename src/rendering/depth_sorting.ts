import type { Mesh } from "./mesh";


export function depth_sort(mesh: Mesh, stride: number = 4): number {
    const projected = mesh.projected_buffer;
    const raster = mesh.raster_buffer;
    const indices = mesh.indices;
    const num_triangles = indices.length / 3;
    let visible_count = 0;

    for (let i = 0; i < num_triangles; i++) {
        const i0 = indices[i * 3] * stride;
        const i1 = indices[i * 3 + 1] * stride;
        const i2 = indices[i * 3 + 2] * stride;
        
        const z_avg = (projected[i0 + 2] + projected[i1 + 2] + projected[i2 + 2]) / 3;
    
        raster[i] = z_avg; 
        mesh.draw_order[visible_count] = i; 
        visible_count++;
    }

    const active_order = mesh.draw_order.subarray(0, visible_count);
    active_order.sort((a, b) => raster[b] - raster[a]);

    return visible_count;
}