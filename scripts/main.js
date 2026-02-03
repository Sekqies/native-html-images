import { generate_trash_data } from "./cpu/image.js";
import { build_color_grid } from "./cpu/transformer.js";


export function main(){
    const target = document.getElementById('container');
    const width = document.getElementById('width').valueAsNumber;
    const height = document.getElementById('height').valueAsNumber;

    const image_data = generate_trash_data(width,height);
    const table_text = build_color_grid(image_data);
    target.innerHTML = table_text;
}

document.getElementById('render').addEventListener('click', main);