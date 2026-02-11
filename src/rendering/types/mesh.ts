import { ArrayType, IndexingType, vec3 } from "../../math/types";
import type { Geometry } from "./geometry";


export class Mesh{
    vertices: ArrayType
    indices: IndexingType
    projected_buffer: ArrayType
    raster_buffer: ArrayType
    color_buffer: ArrayType
    albedo: vec3;
    raster_end:number
    visible_triangles_count:number

    constructor(geometry:Geometry, albedo:vec3 = vec3(0,0,0), raster_buffer:ArrayType | null = null, projected_buffer:ArrayType | null = null, color_buffer:ArrayType | null = null){
        this.vertices = geometry.vertices;
        this.indices = geometry.indices;
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

}