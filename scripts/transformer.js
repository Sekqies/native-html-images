// @ts-check

/**
 * @typedef {[number,number,number]} vec3
 * 
 */

/**
 * @type {vec3}
 */
const red = [255,0,0];

/**
 * @type {vec3[][]}
 */
const color_grid = [[red]];


/**
 * 
 * @param {vec3} color 
 * @returns {string}
 */
function to_hexcode(color){
    let output = "";
    for(const component of color){
        output += component.toString(16);
    }
    return output;
}

/**
 * 
 * @param {vec3[][]} grid 
 * 
 */
function normalize_grid_size(grid){
    let line_size = 0;
    for(const line of grid){
        line_size = Math.max(line.length);
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
 * @param {vec3[][]} color_grid 
 * @returns {string}
 */
export function build_color_grid(color_grid){
    normalize_grid_size(color_grid);
    let html = '<table border="0" cellpadding="0" cellspacing="0" spacing="0" padding="0">';
    for(const row of color_grid){
        html+="<tr>";
        for(const color of row){
            html+= '<td bgcolor="' + to_hexcode(color) +  '"width="1" height="1"></td>';
        }
        html+="</tr>";
    }
    return html;
}

