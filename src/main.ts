import { build_color_table, build_color_text } from "./cpu/transformer";
import { generate_trash_data } from "./cpu/image";


export function main(){
    const target = document.getElementById('container');
    const width_el = document.getElementById('width') as HTMLInputElement | null;
    const height_el = document.getElementById('height') as HTMLInputElement | null;
    const cell_size_el = document.getElementById('cell-size') as HTMLInputElement | null;

    const width: number = width_el?.valueAsNumber ?? 1;
    const height: number = height_el?.valueAsNumber ?? 1;
    const cell_size: number = cell_size_el?.valueAsNumber ?? 2;

    const image_data = generate_trash_data(width,height);
    const table_html = build_color_table(image_data,cell_size);
    //const text_html = build_color_text(image_data, "■");
    if(!target){
        return;
    }
    target.innerHTML = table_html;
}

document.getElementById('render')?.addEventListener('click', main);
