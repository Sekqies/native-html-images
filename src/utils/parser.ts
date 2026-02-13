import { ArrayType, IndexingType } from "../math/types";
import { Geometry } from "../rendering/types/geometry";

function center_geometry(geo: Geometry): void {
    const v = geo.vertices;
    if (v.length === 0) return;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < v.length; i += 3) {
        const x = v[i];
        const y = v[i + 1];
        const z = v[i + 2];

        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    for (let i = 0; i < v.length; i += 3) {
        v[i]     -= centerX;
        v[i + 1] -= centerY;
        v[i + 2] -= centerZ;
    }
}



export function parse_obj(file:string):Geometry{
    const lines = file.split('\n');
    let v_count = 0;
    let f_indices_count = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('v ')) { 
            v_count++;
        } else if (line.startsWith('f ')) {
            const parts = line.split(/\s+/).filter(p => p.length > 0);
            const face_vert_count = parts.length - 1;
            if (face_vert_count === 3) {
                f_indices_count += 3;
            } else if (face_vert_count > 3) {
                f_indices_count += (face_vert_count - 2) * 3;
            }
        }
    }
    const vertices = new ArrayType(v_count * 3);
    const indices = new IndexingType(f_indices_count);

    let vert_curs = 0;
    let ind_curs = 0;

    for(let line of lines){
        line = line.trim();
        if(line.startsWith('v ')){
            const nums:number[] = line.split(/\s+/).map((value) => {return parseFloat(value);});
            vertices[vert_curs++] = nums[1];
            vertices[vert_curs++] = nums[2];
            vertices[vert_curs++] = nums[3];
        }
        else if (line.startsWith('f ')) {
            const parts = line.split(/\s+/).slice(1);
            
            const faceIndices = parts.map(p => {
                return parseInt(p.split('/')[0]) - 1; 
            });

            for (let i = 1; i < faceIndices.length - 1; i++) {
                indices[ind_curs++] = faceIndices[0];
                indices[ind_curs++] = faceIndices[i + 1];
                indices[ind_curs++] = faceIndices[i];
            }
        }
    }
    const geo = new Geometry(vertices,indices);
    center_geometry(geo);
    return geo;
}
