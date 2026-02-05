import { ArrayType } from "../math/types";

export function create_sphere(radius: number, rings: number, slices: number) {
    const vertices: number[] = [];
    const indices: number[] = [];
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

            vertices.push(x * radius, y * radius, z * radius);
        }
    }
    for (let lat = 0; lat < rings; lat++) {
        for (let lon = 0; lon < slices; lon++) {
            const first = (lat * (slices + 1)) + lon;
            const second = first + slices + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    return {
        vertices: new ArrayType(vertices),
        indices: new Uint16Array(indices)
    };
}