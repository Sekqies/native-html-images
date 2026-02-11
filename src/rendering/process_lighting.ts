import { length_vec3, mul_mat4_vec4, mul_mat4_vec4_mut, sub_vec3 } from "../math/matrix_operators";
import { ArrayType, mat4, vec3, vec4 } from "../math/types";
import type { Light } from "./types/light";
import type { Mesh } from "./types/mesh";
import type { Scene } from "./types/scene";


export function process_lighting(mesh:Mesh, scene:Scene){
    const world_coordinates = mesh.projected_buffer;
    const lights = scene.lights;
    let vertex:vec3 = vec3(0,0,0);
    const k = 0.01;
    for(let i = 0; i < world_coordinates.length; i+=4){
        vertex[0] = world_coordinates[i];
        vertex[1] = world_coordinates[i+1];
        vertex[2] = world_coordinates[i+2];
        let color = vec3(0,0,0);
        for(const light of lights){
            const L = sub_vec3(vertex,light.position);
            const dist = length_vec3(L);
            if (dist > light.radius) continue;
            
        }
    }
}

export function process_world_coordinates(scene:Scene, model:mat4[]){
    let v:vec4 = vec4(0,0,0,0);
    let mesh_index = 0;
    for(const mesh of scene.meshes){
        const mesh_model = model[mesh_index++];
        const vertices = mesh.vertices;
        for(let i = 0; i < vertices.length; i+=4){
            v[0] = vertices[i];
            v[1] = vertices[i+1];
            v[2] = vertices[i+2];
            v[3] = vertices[i+3];
            mul_mat4_vec4_mut(mesh_model,v);
            mesh.projected_buffer[i] = v[0];
            mesh.projected_buffer[i+1] = v[1];
            mesh.projected_buffer[i+2] = v[2];
            mesh.projected_buffer[i+3] = v[3];
        }
        process_lighting(mesh,scene);
    }
}