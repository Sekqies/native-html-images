import { mul_mat4, mul_mat4_vec4, scalar_mult_vec3 } from "../math/matrix_operators";
import { mat4, vec4, vec3, EPSILON, vec2 } from "../math/types";

export function transform_vertex(projection:mat4, view:mat4, model:mat4, vertex:vec3):vec4{
    const left:mat4 = mul_mat4(projection,view);
    const right:vec4 = mul_mat4_vec4(model,vec4(vertex[0],vertex[1],vertex[2],1.0));
    return mul_mat4_vec4(left,right);
}

export function process_perspective(clip_pos:vec4):vec3|null {
    const w = clip_pos[3];
    if (w <= EPSILON){
        return null;
    }
    return scalar_mult_vec3(vec3(clip_pos[0],clip_pos[1],clip_pos[2]),1/w);
}

export function to_viewport_space(ndc:vec3, width:number, height:number):vec2 {
    const x = (ndc[0] + 1) * 0.5 * width;
    const y = (1 - ndc[1]) * 0.5 * height;
    return vec2(x,y);
}

