import { ArrayType, IndexingType } from "../../math/types";


export class Geometry{
    vertices:ArrayType;
    indices:IndexingType;
    normals:ArrayType;
    constructor(vertices:ArrayType, indices:IndexingType){
        this.vertices = vertices;
        this.indices = indices; 
        this.normals = new ArrayType(this.vertices.length);
        this.compute_normals();
    }
    private compute_normals() {
        const inds = this.indices;
        const verts = this.vertices;
        const norms = this.normals;

        norms.fill(0);

        for (let i = 0; i < inds.length; i += 3) {
            const i1 = inds[i] * 3;
            const i2 = inds[i+1] * 3;
            const i3 = inds[i+2] * 3;

            const ux = verts[i2] - verts[i1];
            const uy = verts[i2+1] - verts[i1+1];
            const uz = verts[i2+2] - verts[i1+2];

            const vx = verts[i3] - verts[i1];
            const vy = verts[i3+1] - verts[i1+1];
            const vz = verts[i3+2] - verts[i1+2];

            const nx = vy * uz - vz * uy;
            const ny = vz * ux - vx * uz;
            const nz = vx * uy - vy * ux;

            norms[i1] += nx; norms[i1+1] += ny; norms[i1+2] += nz;
            norms[i2] += nx; norms[i2+1] += ny; norms[i2+2] += nz;
            norms[i3] += nx; norms[i3+1] += ny; norms[i3+2] += nz;
        }
        for (let i = 0; i < norms.length; i += 3) {
            const len = Math.sqrt(norms[i]**2 + norms[i+1]**2 + norms[i+2]**2);
            if (len > 0.0001) {
                norms[i] /= len; norms[i+1] /= len; norms[i+2] /= len;
            }
        }
    }
}