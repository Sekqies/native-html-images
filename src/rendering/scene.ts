import { ArrayType, type IndexingType } from "../math/types";
import { Mesh } from "./mesh";

export class Scene{
    scene_buffer:ArrayType;
    meshes:Mesh[];

    constructor(vertices:ArrayType[], indices:IndexingType[]){
        if(indices.length !== vertices.length){
            console.warn("Scene built incorrectly: number of vertices is not equal to number of indices");
        }
        let vert_size = 0;
        let index_size = 0;
        for(let i = 0; i < vertices.length; ++i){
            vert_size += vertices[i].length;
            index_size += indices[i].length;
        }
        this.scene_buffer = new ArrayType(index_size * 4);
        this.meshes = new Array(vertices.length);
        let prev_length = 0;
        for(let i = 0; i < vertices.length; ++i){
            this.meshes[i] = new Mesh(vertices[i],indices[i],this.scene_buffer.subarray(prev_length,indices[i].length*4));
        }
    }
    resize(size:number){
        const prev = this.scene_buffer;
        this.scene_buffer = new ArrayType(size);
        this.scene_buffer.set(prev,0);
    }

}