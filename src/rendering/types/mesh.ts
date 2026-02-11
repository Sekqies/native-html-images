import { mul_mat4_vec4 } from "../../math/matrix_operators";
import { ArrayType, IndexingType, mat4, vec3, vec4 } from "../../math/types";
import type { Geometry } from "./geometry";


export class Mesh{
    vertices: ArrayType
    indices: IndexingType
    local_normals: ArrayType
    projected_buffer: ArrayType
    raster_buffer: ArrayType
    color_buffer: ArrayType
    normals: ArrayType;
    albedo: vec3;
    raster_end:number
    visible_triangles_count:number

    constructor(geometry:Geometry, albedo:vec3 = vec3(0,0,0), raster_buffer:ArrayType | null = null, projected_buffer:ArrayType | null = null, color_buffer:ArrayType | null = null){
        this.vertices = geometry.vertices;
        this.indices = geometry.indices;
        this.local_normals = geometry.normals;
        this.normals = new ArrayType(geometry.normals.length);
        if(projected_buffer === null)
            this.projected_buffer = new ArrayType(this.vertices.length * 4 / 3);
        else
            this.projected_buffer = projected_buffer;
        if(raster_buffer === null)
            this.raster_buffer = new ArrayType(this.indices.length * 4);
        else
            this.raster_buffer = raster_buffer; 

        if(color_buffer === null)
            this.color_buffer = new ArrayType(this.vertices.length);
        else 
            this.color_buffer = color_buffer;

        this.albedo = albedo;
        this.raster_end = this.indices.length * 4;
        this.visible_triangles_count = 0;
    }
    update_normals(model: mat4) {
        let temp_n = vec4(0,0,0,0);
        for (let i = 0; i < this.normals.length; i += 3) {
            temp_n[0] = this.local_normals[i];
            temp_n[1] = this.local_normals[i+1];
            temp_n[2] = this.local_normals[i+2];
            temp_n[3] = 0;
            const world_n = mul_mat4_vec4(model, temp_n);
            this.normals[i]   = world_n[0];
            this.normals[i+1] = world_n[1];
            this.normals[i+2] = world_n[2];
        }
    }
}

