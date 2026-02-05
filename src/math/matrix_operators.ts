import { ArrayType, mat2, mat3, mat4, vec2, vec3, vec4 } from "./types";

export function dot(u:ArrayType, v:ArrayType):number{
    let result = 0;
    for(let i = 0; i < u.length; ++i){
        result += u[i] * v[i];
    }
    return result;
}

export function dot_vec2(u:vec2, v:vec2):number{
    return u[0] * v[0] + u[1] * v[1];
}

export function dot_vec3(u:vec3, v:vec3):number{
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

export function cross(u:vec3, v:vec3):vec3{
    return vec3(u[1]*v[2] - u[2]*v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]);
}

export function dot_vec4(u:vec4, v:vec4){
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3];
}

export function mul_mat2(A: mat2, B: mat2): mat2 {
    return mat2(
        A[0] * B[0] + A[2] * B[1],
        A[1] * B[0] + A[3] * B[1],
        A[0] * B[2] + A[2] * B[3], 
        A[1] * B[2] + A[3] * B[3]  
    );
}

export function mul_mat3(A: mat3, B: mat3): mat3 {
    return mat3(
        A[0] * B[0] + A[3] * B[1] + A[6] * B[2],
        A[1] * B[0] + A[4] * B[1] + A[7] * B[2],
        A[2] * B[0] + A[5] * B[1] + A[8] * B[2],

        A[0] * B[3] + A[3] * B[4] + A[6] * B[5],
        A[1] * B[3] + A[4] * B[4] + A[7] * B[5],
        A[2] * B[3] + A[5] * B[4] + A[8] * B[5],

        A[0] * B[6] + A[3] * B[7] + A[6] * B[8],
        A[1] * B[6] + A[4] * B[7] + A[7] * B[8],
        A[2] * B[6] + A[5] * B[7] + A[8] * B[8]
    );
}

export function mul_mat4(A: mat4, B: mat4): mat4 {
    return mat4(
        A[0] * B[0] + A[4] * B[1] + A[8] * B[2] + A[12] * B[3],
        A[1] * B[0] + A[5] * B[1] + A[9] * B[2] + A[13] * B[3],
        A[2] * B[0] + A[6] * B[1] + A[10] * B[2] + A[14] * B[3],
        A[3] * B[0] + A[7] * B[1] + A[11] * B[2] + A[15] * B[3],

        A[0] * B[4] + A[4] * B[5] + A[8] * B[6] + A[12] * B[7],
        A[1] * B[4] + A[5] * B[5] + A[9] * B[6] + A[13] * B[7],
        A[2] * B[4] + A[6] * B[5] + A[10] * B[6] + A[14] * B[7],
        A[3] * B[4] + A[7] * B[5] + A[11] * B[6] + A[15] * B[7],

        A[0] * B[8] + A[4] * B[9] + A[8] * B[10] + A[12] * B[11],
        A[1] * B[8] + A[5] * B[9] + A[9] * B[10] + A[13] * B[11],
        A[2] * B[8] + A[6] * B[9] + A[10] * B[10] + A[14] * B[11],
        A[3] * B[8] + A[7] * B[9] + A[11] * B[10] + A[15] * B[11],

        A[0] * B[12] + A[4] * B[13] + A[8] * B[14] + A[12] * B[15],
        A[1] * B[12] + A[5] * B[13] + A[9] * B[14] + A[13] * B[15],
        A[2] * B[12] + A[6] * B[13] + A[10] * B[14] + A[14] * B[15],
        A[3] * B[12] + A[7] * B[13] + A[11] * B[14] + A[15] * B[15]
    );
}

export function mul_mat2_vec2(A: mat2, u: vec2): vec2 {
    return vec2(
        A[0] * u[0] + A[2] * u[1], 
        A[1] * u[0] + A[3] * u[1]  
    );
}

export function mul_mat3_vec3(A: mat3, u: vec3): vec3 {
    return vec3(
        A[0] * u[0] + A[3] * u[1] + A[6] * u[2],
        A[1] * u[0] + A[4] * u[1] + A[7] * u[2],
        A[2] * u[0] + A[5] * u[1] + A[8] * u[2]
    );
}

export function mul_mat4_vec4(A: mat4, u: vec4): vec4 {
    return vec4(
        A[0] * u[0] + A[4] * u[1] + A[8] * u[2] + A[12] * u[3],

        A[1] * u[0] + A[5] * u[1] + A[9] * u[2] + A[13] * u[3],

        A[2] * u[0] + A[6] * u[1] + A[10] * u[2] + A[14] * u[3],

        A[3] * u[0] + A[7] * u[1] + A[11] * u[2] + A[15] * u[3]
    );
}

export function invert_mat2(A: mat2): mat2 | null {
    const a0 = A[0], a1 = A[1], a2 = A[2], a3 = A[3];
    let det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }

    det = 1.0 / det;

    return mat2(
        a3 * det,
        -a1 * det,
        -a2 * det,
        a0 * det
    );
}

export function invert_mat3(A: mat3): mat3 | null {
    const a00 = A[0], a01 = A[1], a02 = A[2];
    const a10 = A[3], a11 = A[4], a12 = A[5];
    const a20 = A[6], a21 = A[7], a22 = A[8];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
        return null;
    }

    det = 1.0 / det;

    return mat3(
        b01 * det,
        (-a22 * a01 + a02 * a21) * det,
        (a12 * a01 - a02 * a11) * det,
        b11 * det,
        (a22 * a00 - a02 * a20) * det,
        (-a12 * a00 + a02 * a10) * det,
        b21 * det,
        (-a21 * a00 + a01 * a20) * det,
        (a11 * a00 - a01 * a10) * det
    );
}

export function invert_mat4(A: mat4): mat4 | null {
    const a00 = A[0], a01 = A[1], a02 = A[2], a03 = A[3];
    const a10 = A[4], a11 = A[5], a12 = A[6], a13 = A[7];
    const a20 = A[8], a21 = A[9], a22 = A[10], a23 = A[11];
    const a30 = A[12], a31 = A[13], a32 = A[14], a33 = A[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }

    det = 1.0 / det;

    return mat4(
        (a11 * b11 - a12 * b10 + a13 * b09) * det,
        (a02 * b10 - a01 * b11 - a03 * b09) * det,
        (a31 * b05 - a32 * b04 + a33 * b03) * det,
        (a22 * b04 - a21 * b05 - a23 * b03) * det,
        (a12 * b08 - a10 * b11 - a13 * b07) * det,
        (a00 * b11 - a02 * b08 + a03 * b07) * det,
        (a32 * b02 - a30 * b05 - a33 * b01) * det,
        (a20 * b05 - a22 * b02 + a23 * b01) * det,
        (a10 * b10 - a11 * b08 + a13 * b06) * det,
        (a01 * b08 - a00 * b10 - a03 * b06) * det,
        (a30 * b04 - a31 * b02 + a33 * b00) * det,
        (a21 * b02 - a20 * b04 - a23 * b00) * det,
        (a11 * b07 - a10 * b09 - a12 * b06) * det,
        (a00 * b09 - a01 * b07 + a02 * b06) * det,
        (a31 * b01 - a30 * b03 - a32 * b00) * det,
        (a20 * b03 - a21 * b01 + a22 * b00) * det
    );
}


export function length(v: ArrayType): number {
    return Math.sqrt(dot(v,v));
}

export function length_vec3(v:vec3):number{
    return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
}

export function normalize(v: ArrayType): void {
    const len = length(v);
    if (len === 0) return;
    const inv_len = 1.0 / len;
    for(let i = 0; i < v.length; ++i){
        v[i] = v[i] * inv_len;
    }
}

export function normalize_vec3(v:vec3):void{
    const inv_len = 1.0 / length_vec3(v);
    v[0] *= inv_len;
    v[1] *= inv_len;
    v[2] *= inv_len;
}
