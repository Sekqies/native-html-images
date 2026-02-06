export const ArrayType = Float32Array;
export const IndexingType = Int16Array;
export type ArrayType = InstanceType<typeof ArrayType>
export type IndexingType = InstanceType<typeof IndexingType>

export type vec2 = ArrayType;
export type vec3 = ArrayType;
export type vec4 = ArrayType;

export type mat2 = ArrayType;
export type mat3 = ArrayType;
export type mat4 = ArrayType;


export function vec2(x:number,y:number):vec2{
    const v = new ArrayType(2);
    v[0] = x;
    v[1] = y;
    return v as vec2;
}

export function vec3(x:number,y:number,z:number):vec3{
    const v = new ArrayType(3);
    v[0] = x;
    v[1] = y;
    v[2] = z;
    return v as vec3;
}

export function vec4(x:number, y:number, z:number, w:number):vec4{
    const v = new ArrayType(4);
    v[0] = x;
    v[1] = y;
    v[2] = z;
    v[3] = w;
    return v as vec4;
}

/**
 * This is written column-wise.
 * @param m00 
 * @param m01 
 * @param m10 
 * @param m11 
 * @returns 
 */
export function mat2(
    m00: number = 1, m01: number = 0,
    m10: number = 0, m11: number = 1
): mat2 {
    const m = new ArrayType(4);
    m[0] = m00; m[1] = m01;
    m[2] = m10; m[3] = m11;
    return m as mat2;
}
/**
 * This is written column-wise.
 * @param m00 
 * @param m01 
 * @param m02 
 * @param m10 
 * @param m11 
 * @param m12 
 * @param m20 
 * @param m21 
 * @param m22 
 * @returns 
 */
export function mat3(
    m00: number = 1, m01: number = 0, m02: number = 0,
    m10: number = 0, m11: number = 1, m12: number = 0,
    m20: number = 0, m21: number = 0, m22: number = 1
): mat3 {
    const m = new ArrayType(9);
    m[0] = m00; m[1] = m01; m[2] = m02;
    m[3] = m10; m[4] = m11; m[5] = m12;
    m[6] = m20; m[7] = m21; m[8] = m22;
    return m as mat3;
}

/**
 * This is written column-wise.
 * @param m00 
 * @param m01 
 * @param m02 
 * @param m03 
 * @param m10 
 * @param m11 
 * @param m12 
 * @param m13 
 * @param m20 
 * @param m21 
 * @param m22 
 * @param m23 
 * @param m30 
 * @param m31 
 * @param m32 
 * @param m33 
 * @returns 
 */
export function mat4(
    m00: number = 1, m01: number = 0, m02: number = 0, m03: number = 0,
    m10: number = 0, m11: number = 1, m12: number = 0, m13: number = 0,
    m20: number = 0, m21: number = 0, m22: number = 1, m23: number = 0,
    m30: number = 0, m31: number = 0, m32: number = 0, m33: number = 1
): mat4 {
    const m = new ArrayType(16);
    m[0] = m00;  m[1] = m01;  m[2] = m02;  m[3] = m03;
    m[4] = m10;  m[5] = m11;  m[6] = m12;  m[7] = m13;
    m[8] = m20;  m[9] = m21;  m[10] = m22; m[11] = m23;
    m[12] = m30; m[13] = m31; m[14] = m32; m[15] = m33;
    return m as mat4;
}

export const EPSILON = 1e-6;