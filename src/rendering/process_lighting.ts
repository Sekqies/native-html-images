import { dot_vec3, length_vec3, mul_mat4_vec4, mul_mat4_vec4_mut, sub_vec3 } from "../math/matrix_operators";
import { ArrayType, mat4, vec3, vec4 } from "../math/types";
import type { Light } from "./types/light";
import type { Mesh } from "./types/mesh";
import type { Scene } from "./types/scene";


export function process_lighting(mesh:Mesh, scene:Scene){
    const world_coordinates = mesh.projected_buffer;
    const lights = scene.lights;
    let vertex:vec3 = vec3(0,0,0);
    const k = 0.01;
    let index = 0;
    for(let i = 0; i < world_coordinates.length; i+=4){
        vertex[0] = world_coordinates[i];
        vertex[1] = world_coordinates[i+1];
        vertex[2] = world_coordinates[i+2];
        const start = i/4*3;
        const nx = mesh.normals[start];
        const ny = mesh.normals[start+1];
        const nz = mesh.normals[start+2];


        let color = vec3(mesh.albedo[0],mesh.albedo[1],mesh.albedo[2]);
        for(const light of lights){
            const L = sub_vec3(light.position,vertex);
            const dist = length_vec3(L) || k;
            L[0]/=dist;
            L[1]/=dist;
            L[2]/=dist;
            if (dist > light.radius){
                continue;
            }
            const dot = L[0] * nx + L[1] * ny + L[2] * nz;
            const diffuse = Math.max(0,dot);
            const window = 1//*Math.pow(Math.max(0, 1 - Math.pow(dist / light.radius, 4)), 2)
            const attenuation = light.intensity/(1.0 + k*(dist*dist)) * window;
            const strength = diffuse * attenuation;
            color[0] += light.color[0] * strength;
            color[1] += light.color[1] * strength;
            color[2] += light.color[2] * strength;
        }
        mesh.color_buffer[index++] = Math.min(1.0, color[0]);
        mesh.color_buffer[index++] = Math.min(1.0, color[1]);
        mesh.color_buffer[index++] = Math.min(1.0, color[2]);
    }
}

export function process_world_coordinates(scene:Scene, model:mat4[]){
    let v:vec4 = vec4(0,0,0,0);
    let mesh_index = 0;
    for(const mesh of scene.meshes){
        let out_index = 0 ;
        const mesh_model = model[mesh_index++];
        const vertices = mesh.vertices;
        for(let i = 0; i < vertices.length; i+=3){
            v[0] = vertices[i];
            v[1] = vertices[i+1];
            v[2] = vertices[i+2];
            v[3] = 1.0;
            mul_mat4_vec4_mut(mesh_model,v);
            mesh.projected_buffer[out_index++] = v[0];
            mesh.projected_buffer[out_index++] = v[1];
            mesh.projected_buffer[out_index++] = v[2];
            mesh.projected_buffer[out_index++] = v[3];
        }
        process_lighting(mesh,scene);
    }
}