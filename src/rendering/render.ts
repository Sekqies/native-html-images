import { ArrayType } from "../math/types";
import { rasterize } from "./rasterizer";
import { build_3d_svg } from "../to_html";

export function render(target: HTMLElement, vertices: ArrayType, use_rect: boolean = true, invert_y:boolean = true, stride: number = 4):void {
    const screen_verts = rasterize(vertices, invert_y, stride);
    const svg_content = build_3d_svg(screen_verts, use_rect);
    target.innerHTML = svg_content;
}