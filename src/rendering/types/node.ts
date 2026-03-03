import { mat4, vec3, vec4, type Line } from "../../math/types";
import { identity, translate, rotate, scale } from "../../math/transformations";
import type { Mesh } from "./mesh";
import { inverse_mat4, mul_mat4_vec4 } from "../../math/matrix_operators";

export class Node {
    mesh: Mesh;
    position: vec3 = vec3(0,0,0);
    rotation: vec3 = vec3(0, 0, 0); 
    scale_vec: vec3 = vec3(1, 1, 1);
    radius:vec3 = vec3(1,1,1);
    radius_reciprocal:vec3 = vec3(1,1,1);
    
    model: mat4 = identity();
    inverse_model: mat4 = identity();

    constructor(mesh: Mesh) {
        this.mesh = mesh;
        this.update_matrix();
        this.determine_radius();
    }

    private determine_radius(){
        const EPSILON = 0.0001;
        const biggest:vec3 = vec3(EPSILON,EPSILON,EPSILON);
        const vertices = this.mesh.vertices;
        for(let i = 0 ; i < vertices.length; i+=3){
            for(let j = 0; j < 3; j++){
                biggest[j] = Math.max(biggest[j],Math.abs(vertices[i+j]));
            }
        }
        this.radius = biggest;
        for(let j = 0; j < 3; ++j){
            this.radius_reciprocal[j] = 1/(this.radius[j] ** 2);
        }
    }


    intersects_with(line:Line){
        const local_origin = mul_mat4_vec4(this.inverse_model,vec4(line.point[0],line.point[1],line.point[2],1.0));
        const local_dir = mul_mat4_vec4(this.inverse_model,vec4(line.directional_vector[0],line.directional_vector[1],line.directional_vector[2],0.0));

        
        const [ux,uy,uz,uu] = local_dir;
        const px = local_origin[0];
        const py = local_origin[1]
        const pz = local_origin[2]

        const [recip_a,recip_b,recip_c] = this.radius_reciprocal;
        const A = ux * ux * recip_a + uy * uy * recip_b + uz * uz * recip_c;
        const B = 2 * (px * ux * recip_a + py * uy * recip_b + pz * uz * recip_c);
        const C = px * px * recip_a + py * py * recip_b + pz * pz * recip_c - 1;

        if(C<=0) return true;

        if(B>0) return false;

        const delta = B*B - 4 * A * C;
        return delta >= 0;
    }


    



    update_matrix() {
        let m = identity();
        
        m = translate(m, this.position);
        
        if (this.rotation[2] !== 0) m = rotate(m, this.rotation[2], vec3(0, 0, 1));
        if (this.rotation[1] !== 0) m = rotate(m, this.rotation[1], vec3(0, 1, 0));
        if (this.rotation[0] !== 0) m = rotate(m, this.rotation[0], vec3(1, 0, 0));
        
        m = scale(m, this.scale_vec);

        this.model = m;
        this.inverse_model = inverse_mat4(this.model);
    }
}