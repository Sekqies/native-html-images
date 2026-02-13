import { ArrayType, IndexingType, vec3 } from "../math/types";
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

function normalize_geometry(geo:Geometry): void {
    let max = -Infinity;
    for(let i = 0; i < geo.vertices.length; i+=3){
        max = Math.max(max,geo.vertices[i])
        max = Math.max(max,geo.vertices[i+1])
        max = Math.max(max,geo.vertices[i+2])
    }   
    if(max===0){
        max = 1;
    }
    for(let i = 0; i < geo.vertices.length; i+=3){
        geo.vertices[i] /= max;
        geo.vertices[i+1] /= max;
        geo.vertices[i+2] /= max;
    }
}




export function parse_obj(file:string):Geometry{
    const lines = file.split('\n');
    let v_count = 0;
    let vn_count = 0;
    let f_indices_count = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('f ')) {
            const parts = line.split(/\s+/).filter(p => p.length > 0);
            const face_vert_count = parts.length - 1;
            if (face_vert_count === 3) {
                f_indices_count += 3;
            } else if (face_vert_count > 3) {
                f_indices_count += (face_vert_count - 2) * 3;
            }
            continue;
        }
        if (line.startsWith('v ')) { 
            v_count++;
            continue;
        }
        if(line.startsWith('vn ')){
            vn_count++;
        }
    }
    const vertices = new ArrayType(v_count * 3);
    const indices = new IndexingType(f_indices_count);
    const normals:ArrayType | null = (vn_count > 0)? new ArrayType(v_count * 3) : null;

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

    for (let i = 0; i < indices.length; i += 3) {
        const i1 = indices[i] * 3;
        const i2 = indices[i + 1] * 3;
        const i3 = indices[i + 2] * 3;

        const v1x = vertices[i1], v1y = vertices[i1 + 1], v1z = vertices[i1 + 2];
        const v2x = vertices[i2], v2y = vertices[i2 + 1], v2z = vertices[i2 + 2];
        const v3x = vertices[i3], v3y = vertices[i3 + 1], v3z = vertices[i3 + 2];

        if(!normals) continue;

        const ax = v2x - v1x, ay = v2y - v1y, az = v2z - v1z;
        const bx = v3x - v1x, by = v3y - v1y, bz = v3z - v1z;

        const nx = az * by - ay * bz;
        const ny = ax * bz - az * bx;
        const nz = ay * bx - ax * by;
        normals[i1] += nx; normals[i1 + 1] += ny; normals[i1 + 2] += nz;
        normals[i2] += nx; normals[i2 + 1] += ny; normals[i2 + 2] += nz;
        normals[i3] += nx; normals[i3 + 1] += ny; normals[i3 + 2] += nz;
    }
    if(normals)
        for (let i = 0; i < normals.length; i += 3) {
            const x = normals[i];
            const y = normals[i + 1];
            const z = normals[i + 2];
            let len = Math.sqrt(x * x + y * y + z * z);
            if (len > 0) {
                len = 1.0 / len;
                normals[i] *= len;
                normals[i + 1] *= len;
                normals[i + 2] *= len;
            }
        }

    const geo = new Geometry(vertices,indices,normals);
    center_geometry(geo);
    normalize_geometry(geo);
    return geo;
}