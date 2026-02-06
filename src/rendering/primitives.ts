import { ArrayType, IndexingType } from "../math/types";
import { Mesh } from "./mesh";

export function create_sphere(radius: number, rings: number, slices: number):Mesh {
    const vertice_count = (rings + 1) * (slices + 1) * 3;
    const vertices = new ArrayType(vertice_count);
    const indices = new IndexingType(rings * slices * 6);
    let vert_i = 0;
    let ind_i = 0;
    for (let lat = 0; lat <= rings; lat++) {
        const theta = (lat * Math.PI) / rings;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= slices; lon++) {
            const phi = (lon * 2 * Math.PI) / slices;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            vertices[vert_i++] = x * radius;
            vertices[vert_i++] = y * radius; 
            vertices[vert_i++] = z * radius;
        }
    }
    for (let lat = 0; lat < rings; lat++) {
        for (let lon = 0; lon < slices; lon++) {
            const first = (lat * (slices + 1)) + lon;
            const second = first + slices + 1;

            indices[ind_i++] = first; 
            indices[ind_i++] = second;
            indices[ind_i++] =  first + 1;
            
            indices[ind_i++] = second; 
            indices[ind_i++] = second + 1; 
            indices[ind_i++] = first + 1
        }
    }
    return new Mesh(vertices,indices);
}