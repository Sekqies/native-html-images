import { ArrayType, IndexingType } from "../math/types";


export class Mesh{
    vertices: ArrayType
    indices: IndexingType
    projected_buffer: ArrayType
    raster_buffer: ArrayType
    raster_end:number
    visible_triangles_count:number

    constructor(vertices:ArrayType, indices:IndexingType, raster_buffer:ArrayType | null = null){
        this.vertices = vertices;
        this.indices = indices;
        this.projected_buffer = new ArrayType(vertices.length * 4 / 3);
        if(raster_buffer === null)
            this.raster_buffer = new ArrayType(indices.length * 4);
        else
            this.raster_buffer = raster_buffer; 
        this.raster_end = indices.length * 4;
        this.visible_triangles_count = 0;
    }

}