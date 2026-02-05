import { mat4, vec3 } from "./types";
import { normalize_vec3, length_vec3, cross, dot_vec3 } from "./matrix_operators";

export function identity(): mat4 {
    return mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
}

export function translate(m: mat4, v: vec3): mat4 {
    const x = v[0], y = v[1], z = v[2];
    const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
    const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

    return mat4(
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        a00 * x + a10 * y + a20 * z + a30,
        a01 * x + a11 * y + a21 * z + a31,
        a02 * x + a12 * y + a22 * z + a32,
        a03 * x + a13 * y + a23 * z + a33
    );
}

export function scale(m: mat4, v: vec3): mat4 {
    const x = v[0], y = v[1], z = v[2];
    return mat4(
        m[0] * x, m[1] * x, m[2] * x, m[3] * x,
        m[4] * y, m[5] * y, m[6] * y, m[7] * y,
        m[8] * z, m[9] * z, m[10] * z, m[11] * z,
        m[12], m[13], m[14], m[15]
    );
}

export function rotate(m: mat4, angle: number, axis: vec3): mat4 {
    if (length_vec3(axis) < 0.000001) { return null as any; }

    const n = vec3(axis[0], axis[1], axis[2]);
    normalize_vec3(n);
    
    const x = n[0], y = n[1], z = n[2];
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const t = 1 - c;

    const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];

    const b00 = x * x * t + c;
    const b01 = y * x * t + z * s;
    const b02 = z * x * t - y * s;
    const b10 = x * y * t - z * s;
    const b11 = y * y * t + c;
    const b12 = z * y * t + x * s;
    const b20 = x * z * t + y * s;
    const b21 = y * z * t - x * s;
    const b22 = z * z * t + c;

    return mat4(
        a00 * b00 + a10 * b01 + a20 * b02,
        a01 * b00 + a11 * b01 + a21 * b02,
        a02 * b00 + a12 * b01 + a22 * b02,
        a03 * b00 + a13 * b01 + a23 * b02,

        a00 * b10 + a10 * b11 + a20 * b12,
        a01 * b10 + a11 * b11 + a21 * b12,
        a02 * b10 + a12 * b11 + a22 * b12,
        a03 * b10 + a13 * b11 + a23 * b12,

        a00 * b20 + a10 * b21 + a20 * b22,
        a01 * b20 + a11 * b21 + a21 * b22,
        a02 * b20 + a12 * b21 + a22 * b22,
        a03 * b20 + a13 * b21 + a23 * b22,

        m[12], m[13], m[14], m[15]
    );
}

export function look_at(eye: vec3, center: vec3, up: vec3): mat4 {
    if (Math.abs(eye[0] - center[0]) < 0.000001 &&
        Math.abs(eye[1] - center[1]) < 0.000001 &&
        Math.abs(eye[2] - center[2]) < 0.000001) {
        return identity();
    }

    const z = vec3(eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]);
    normalize_vec3(z);

    const x = cross(up, z);
    normalize_vec3(x);    
    if (length_vec3(x) === 0) {
        x[0] = 0; x[1] = 0; x[2] = 0; 
    }

    const y = cross(z, x);
    normalize_vec3(y); 
    
    if (length_vec3(y) === 0) {
        y[0] = 0; y[1] = 0; y[2] = 0;
    }

    return mat4(
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -dot_vec3(x, eye),
        -dot_vec3(y, eye),
        -dot_vec3(z, eye),
        1
    );
}

export function perspective(fovy: number, aspect: number, near: number, far: number): mat4 {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    
    return mat4(
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0
    );
}

export function ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): mat4 {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    
    return mat4(
        -2 * lr, 0, 0, 0,
        0, -2 * bt, 0, 0,
        0, 0, 2 * nf, 0,
        (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    );
}