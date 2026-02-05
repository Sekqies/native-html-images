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


