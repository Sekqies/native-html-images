import { ArrayType, IndexingType } from "../math/types";


export class Mesh{
    vertices: ArrayType
    indices: IndexingType
    projected_buffer: ArrayType
    raster_buffer: ArrayType
    draw_order:IndexingType
    raster_end:number
    visible_triangles_count:number

    constructor(vertices:ArrayType, indices:IndexingType){
        this.vertices = vertices;
        this.indices = indices;
        this.projected_buffer = new ArrayType(vertices.length * 4 / 3);
        this.raster_buffer = new ArrayType(indices.length * 4);
        this.draw_order = new IndexingType(indices.length);
        this.raster_end = indices.length * 4;
        this.visible_triangles_count = 0;
    }

}