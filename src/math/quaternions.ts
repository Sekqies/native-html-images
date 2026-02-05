import { add_vec3, cross, normalize, scalar_mult_vec3 } from "./matrix_operators";
import { mat4, vec3, vec4 } from "./types";


const EPSILON:number = 1e-7;

export function identity_quat():vec4{
    return vec4(0,0,0,1);
}

export function quat_from_axis_angle(axis:vec3, angle:number):vec4{
    const half_angle = angle * 0.5;
    const prod:vec3 = scalar_mult_vec3(axis,Math.sin(half_angle));

    return vec4(prod[0],prod[1],prod[2],Math.cos(half_angle));
}

export function mul_quat(a:vec4, b:vec4):vec4{
    const ax = a[0], ay = a[1], az = a[2], aw = a[3];
    const bx = b[0], by = b[1], bz = b[2], bw = b[3];

    return vec4(
        ax * bw + aw * bx + ay * bz - az * by,
        ay * bw + aw * by + az * bx - ax * bz,
        az * bw + aw * bz + ax * by - ay * bx,
        aw * bw - ax * bx - ay * by - az * bz
    );
}


/**
 * Rotates a vec3 with a quaternion
 * @param v 
 * @param q A rotation quaternion
 */
export function rotate_vec3(v:vec3, q:vec4):vec3 {
    const quat_components = vec3(q[0],q[1],q[2]);

    const t = scalar_mult_vec3(cross(quat_components,v),2.0);
    const prod_term = scalar_mult_vec3(t,q[3]);
    const first_term = add_vec3(v,prod_term);

    return add_vec3(first_term,cross(quat_components,t));
}

export function mat4_from_quat(q: vec4): mat4 {
    const x = q[0], y = q[1], z = q[2], w = q[3];
    
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    return mat4(
        1 - (yy + zz), xy + wz, xz - wy, 0,
        xy - wz, 1 - (xx + zz), yz + wx, 0,
        xz + wy, yz - wx, 1 - (xx + yy), 0,
        0, 0, 0, 1
    );
}


export function slerp(start: vec4, end: vec4, t: number): vec4 {
    let x1 = start[0], y1 = start[1], z1 = start[2], w1 = start[3];
    let x2 = end[0],   y2 = end[1],   z2 = end[2],   w2 = end[3];

    let omega, cosom, sinom, scale0, scale1;
    cosom = x1 * x2 + y1 * y2 + z1 * z2 + w1 * w2;
    if (cosom < 0.0) {
        cosom = -cosom;
        x2 = -x2;
        y2 = -y2;
        z2 = -z2;
        w2 = -w2;
    }
    if ((1.0 - cosom) > EPSILON) {
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        scale0 = 1.0 - t;
        scale1 = t;
    }
    const res = vec4(
        scale0 * x1 + scale1 * x2,
        scale0 * y1 + scale1 * y2,
        scale0 * z1 + scale1 * z2,
        scale0 * w1 + scale1 * w2
    );
    
    normalize(res);
    return res;
}