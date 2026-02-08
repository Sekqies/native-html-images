import type { ArrayType } from "./math/types";
import { character_to_uint, SB_TOKENS, string_to_uint, type StringBuffer } from "./utils/string_buffer";

export type vec3 = [number,number,number];


function to_hexcode(color:vec3) {
    return color
        .map(c => Math.round(c).toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Makes it so every row of the grid has the same number of elements (autofills to black)
 * @param grid (Mutated) The grid to be normalized
 */
function normalize_grid_size(grid:vec3[][]):void {
    let line_size = 0;
    for(const line of grid){
        line_size = Math.max(line.length,line_size);
    }
    for(let line of grid){
        if(line.length == line_size) continue;
        const dif = line_size - line.length;
        for(let i=0;i<dif;++i){
            line.push([0,0,0]);
        }
    }
}

/**
 * 
 * @param color_grid A grid of colors representing the image
 * @param cell_size The dimensions of each cell in the resulting table, in pixels
 * @returns The HTML text of those colors represented as a table
 */
export function build_color_table(color_grid:vec3[][], cell_size:number):string{
    normalize_grid_size(color_grid);
    const cell_str:string = String(cell_size);
    let html = '<table border="0" cellpadding="0" cellspacing="0" spacing="0" padding="0">';
    for(const row of color_grid){
        html+="<tr>";
        for(const color of row){
            html+= '<td bgcolor="#' + to_hexcode(color) +  `"width="${cell_str}" height="${cell_str}"></td>`;
        }
        html+="</tr>";
    }
    return html;
}

export function build_color_text(color_grid:vec3[][], base_text:string){
    let html:string = '<pre>';
    let i:number = 0;
    for(const row of color_grid){
        for(const color of row){
            const c = base_text[i];
            html += `<font size="1" color="#${to_hexcode(color)}">${c}</font>`;
            i++ 
            i = i % base_text.length;
        }
        html += "\n";
    }
    html+= "</pre>"
    return html;
}

function get_rect_edge(x1:number, y1:number,x2:number,y2:number,thickness:number) : string{
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);
    return `<rect x="0" y="${-thickness / 2}" width="${len}" height="${thickness}" transform="translate(${x1} ${y1}) rotate(${ang})"/>`;
}

const RECT_TOKENS = {
    HEAD: string_to_uint('<rect x="0" y="'),
    WIDTH: string_to_uint('" width="'),
    HEIGHT: string_to_uint('" height="'),
    TRANSFORM: string_to_uint('" transform="translate('),
    ROTATE: string_to_uint(') rotate('),
    TAIL: string_to_uint(')"/>')
};

function get_rect_edge_buffer(x1:number, y1:number,x2:number,y2:number,thickness:number, buffer:StringBuffer){
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);
    const y_offset = -thickness / 2;
    buffer.write_chunk(RECT_TOKENS.HEAD);
    buffer.write_float(y_offset);
    
    buffer.write_chunk(RECT_TOKENS.WIDTH);
    buffer.write_float(len);

    buffer.write_chunk(RECT_TOKENS.HEIGHT);
    buffer.write_float(thickness);

    buffer.write_chunk(RECT_TOKENS.TRANSFORM);
    buffer.write_float(x1);
    buffer.push(32);
    buffer.write_float(y1);

    buffer.write_chunk(RECT_TOKENS.ROTATE);
    buffer.write_float(ang);

    buffer.write_chunk(RECT_TOKENS.TAIL);
}

const POLYGON_TOKENS = {
    HEAD: string_to_uint('<polygon points = "'),
    TAIL: string_to_uint('"/>')
}

function push_pair(x:number,y:number,buffer:StringBuffer){
    buffer.write_float(x);
    buffer.push(SB_TOKENS.COMMA);
    buffer.write_float(y);
    buffer.push(SB_TOKENS.SPACE);
}


const decoder = new TextDecoder('ascii');

export function build_3d_svg(vertices:ArrayType, end:number, use_rect:boolean, buffer:StringBuffer):string{
    const n = end;
    buffer.reset();


    const thickness = 0.005;


    for(let i = 0; i < n ; i+=6){
        const x1 = vertices[i];
        const y1 = vertices[i+1];

        const x2 = vertices[i+2];
        const y2 = vertices[i+3];

        const x3 = vertices[i+4];
        const y3 = vertices[i+5];

        
        if(use_rect){
            get_rect_edge_buffer(x1,y1,x2,y2,thickness,buffer);
            get_rect_edge_buffer(x2,y2,x3,y3,thickness,buffer);
            get_rect_edge_buffer(x3,y3,x1,y1,thickness,buffer);
            continue;
        }
        buffer.write_chunk(POLYGON_TOKENS.HEAD);
        push_pair(x1,y1,buffer);
        push_pair(x2,y2,buffer);
        push_pair(x3,y3,buffer);
        buffer.write_chunk(POLYGON_TOKENS.TAIL);
    }
    return decoder.decode(buffer.buffer.subarray(0,buffer.cursor));
}


