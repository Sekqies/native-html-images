import { ArrayType, IndexingType } from "../../math/types";


export class Geometry{
    vertices:ArrayType;
    indices:IndexingType;

    constructor(vertices:ArrayType, indices:IndexingType){
        this.vertices = vertices;
        this.indices = indices;
    }
}