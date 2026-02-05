import { ArrayType } from "../math/types";

export class PrimitiveAssembler{
    out:ArrayType;

    constructor(size:number){
        this.out = new ArrayType(size);
    }

    assemble_primitives(vertices:ArrayType, indices:Uint16Array, stride:number = 4):ArrayType{
        const required_space = indices.length * stride;
        if (this.out.length < required_space){
            console.warn("Resizing this.out - this generally shouldn't happen");
            this.out = new ArrayType(required_space);
        }
        let out_index = 0;
        for(let i = 0; i < indices.length; ++i){
            const index = indices[i];
            const start = index * stride;
            
            for(let k = 0; k < stride; ++k){
                this.out[out_index++] = vertices[start + k];
            }
        }
        return this.out.subarray(0, out_index);
    }
}