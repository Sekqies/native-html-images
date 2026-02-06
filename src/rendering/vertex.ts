import { mul_mat4_vec4, scalar_mult_vec3 } from "../math/matrix_operators";
import { mat4, vec4, vec3, EPSILON, vec2 } from "../math/types";
import type { Mesh } from "./mesh";

export function transform_vertex(mvp:mat4, vertex:vec3):vec4{
    return mul_mat4_vec4(mvp,vertex);
}

export function transform_vertex_mutate(mvp:mat4, vertex:vec3, out:vec4):void{
    const m = mvp;
    const x = vertex[0];
    const y = vertex[1];
    const z = vertex[2];
    /*
        "Wait, but I thought we have a function, mult_mat4_vec4 that did just that!"
        "Why aren't we using it?"
        As it turns out, javascript passes objects as references. Are these references mutable? Kind of.
        We can very much alter its "member variables" (no problem in doing out[i] = thing), but we cannot reassign it. So, out = mult_mat4_vec4(out,vertex) won't work, but just manually doing this ourselves will.
        
        "Why don't we write a function, assign(a:ArrayType,b:ArrayType):void that assigns them with a loop?"
        Because we're using the _mutate version specifically for performance and memory.

        Fuck. Javascript.
    */
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15];
}

export function process_perspective(clip_pos:vec4):vec3|null {
    const w = clip_pos[3];
    if (w <= EPSILON){
        return null;
    }
    return scalar_mult_vec3(vec3(clip_pos[0],clip_pos[1],clip_pos[2]),1/w);
}

export function process_perspective_mutate(clip_pos:vec4, out:vec3):boolean{
    const w = clip_pos[3];
    if (w <= EPSILON){
        return false;
    }
    const prod = 1/w;
    out[0] = clip_pos[0] * prod;
    out[1] = clip_pos[1] * prod;
    out[2] = clip_pos[2] * prod;
    return true;
}



export function transform_vertices(mesh:Mesh, mvp:mat4):void {
    let vert:vec3 = vec3(0,0,0);
    let out:vec4 = vec4(0,0,0,0);
    const vertices = mesh.vertices;
    const projected = mesh.projected_buffer;
    let out_index = 0;
    for(let i = 0; i < vertices.length; i+=3){
        vert[0] = vertices[i]; vert[1] = vertices[i+1]; vert[2] = vertices[i+2];
        transform_vertex_mutate(mvp,vert,out);
        projected[out_index++] = out[0]; projected[out_index++] = out[1]; projected[out_index++] = out[2]; projected[out_index++] = out[3];
    }
}

export function to_viewport_space(ndc:vec3, width:number, height:number):vec2 {
    const x = (ndc[0] + 1) * 0.5 * width;
    const y = (1 - ndc[1]) * 0.5 * height;
    return vec2(x,y);
}

