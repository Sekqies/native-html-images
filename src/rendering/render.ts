import { rasterize } from "./rasterizer";
import { build_3d_svg } from "../to_html";
import type { Mesh } from "./mesh";
import { mul_mat4 } from "../math/matrix_operators";
import type { mat4 } from "../math/types";
import { transform_vertices } from "./vertex";
import { assemble_primitives } from "./primitive_assembler";

export function render(mesh: Mesh, model:mat4, view:mat4, projection:mat4, invert_y:boolean = true, stride:number = 4):void {
    const mvp = mul_mat4(mul_mat4(projection,view),model);
    transform_vertices(mesh,mvp);
    assemble_primitives(mesh,stride);
    rasterize(mesh, invert_y, stride);
}

/**
 * 
 * @param mesh The mesh to be rendered. Vertices and Indices must be filled.
 * @param model 
 * @param view 
 * @param perspective 
 * @param use_rect Decides whether it will draw the object with <path> or <rect>. <path> will result in a black outline, <rect> will be "wireframe-like"
 * @param invert_y 
 * @param stride 
 * @returns An html string for the rendered mesh. This is to be included inside an <svg> tag, with a ViewBox attribute.
 */
export function build_mesh(mesh:Mesh,model:mat4,view:mat4,projection:mat4, use_rect:boolean = true, invert_y: boolean = true, stride:number = 4):string{
    render(mesh,model,view,projection,invert_y,stride);
    const svg_content = build_3d_svg(mesh.raster_buffer, mesh.raster_end, use_rect);
    return svg_content;
}

