import { rasterize } from "./rasterizer";
import { build_3d_svg } from "../to_html";
import type { Mesh } from "./mesh";
import { mul_mat4 } from "../math/matrix_operators";
import { ArrayType, type mat4 } from "../math/types";
import { transform_vertices } from "./vertex";
import { assemble_primitives } from "./primitive_assembler";
import type { StringBuffer } from "../utils/string_buffer";
import type { Scene } from "./scene";

export function render(mesh: Mesh, model:mat4, view:mat4, projection:mat4, invert_y:boolean = true, stride:number = 4):void {
    const mvp = mul_mat4(mul_mat4(projection,view),model);
    transform_vertices(mesh,mvp);
    assemble_primitives(mesh);
    rasterize(mesh, invert_y, stride);
}

function get_z_value(array:ArrayType, offset:number, z_offset:number = 2, stride:number = 3){
    return (array[offset + z_offset] + array[offset + z_offset + stride] + array[offset + z_offset + stride*2]);
}

export function render_scene(scene:Scene, mvp:mat4[], invert_y:boolean = true){
    for(let i = 0; i < scene.meshes.length; ++i){
        const mesh = scene.meshes[i];
        transform_vertices(mesh,mvp[i]);
        assemble_primitives(mesh);
        rasterize(mesh,invert_y);
    }
    let index = 0;
    let offset = 0;
    for(const mesh of scene.meshes){
        for(let i = 0; i < mesh.raster_end; i+=9){
            scene.draw_order[index] = i + offset;
            index++;
        }
        offset += mesh.raster_buffer.length;
    }
    scene.draw_order.subarray(0,index).sort((a,b)=>get_z_value(scene.scene_buffer,b) - get_z_value(scene.scene_buffer,a));
    scene.draw_end = index;
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
export function build_mesh(mesh:Mesh,model:mat4,view:mat4,projection:mat4, string_buffer:StringBuffer, use_rect:boolean = true, invert_y: boolean = true, stride:number = 4):string{
    render(mesh,model,view,projection,invert_y,stride);
    const svg_content = build_3d_svg(mesh.raster_buffer, mesh.raster_end, use_rect,string_buffer);
    return svg_content;
}

