import { identity, rotate, translate } from "../../math/transformations";
import { ArrayType, IndexingType, mat4, vec3, vec4 } from "../../math/types";
import { transform_vertex_mutate } from "../clip_space/vertex";
import { Geometry } from "../types/geometry";

export function create_sphere(radius: number, rings: number, slices: number):Geometry {
    const vertice_count = (rings + 1) * (slices + 1) * 3;
    const vertices = new ArrayType(vertice_count);
    const indices = new IndexingType(rings * slices * 6);
    let vert_i = 0;
    let ind_i = 0;
    for (let lat = 0; lat <= rings; lat++) {
        const theta = (lat * Math.PI) / rings;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= slices; lon++) {
            const phi = (lon * 2 * Math.PI) / slices;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            vertices[vert_i++] = x * radius;
            vertices[vert_i++] = y * radius; 
            vertices[vert_i++] = z * radius;
        }
    }
    for (let lat = 0; lat < rings; lat++) {
        for (let lon = 0; lon < slices; lon++) {
            const first = (lat * (slices + 1)) + lon;
            const second = first + slices + 1;

            indices[ind_i++] = first; 
            indices[ind_i++] = second;
            indices[ind_i++] =  first + 1;
            
            indices[ind_i++] = second; 
            indices[ind_i++] = second + 1; 
            indices[ind_i++] = first + 1
        }
    }
    return new Geometry(vertices,indices);
}


export function create_flat_ngon(n:number, side_length:number, axis:vec3 | null = null, angle:number | null = null, translate_vec:vec3 | null =null) : Geometry{
    if(n<=2){
        console.warn("Invalid n - There are no polygons of dimension 2 or less.");
        throw new Error("Cannot create a polygon with less than 3 sides.");
    }

    const vertice_count = n + 1;
    const triangle_count = n * 3;

    const vertices = new ArrayType(vertice_count * 3);
    const indices = new IndexingType(triangle_count);

    vertices[0] = 0;
    vertices[1] = 0;
    vertices[2] = 0;

    const radius = side_length / (2 * Math.sin(Math.PI / n));
    const theta_step = (Math.PI * 2) / n

    let vert_i = 3;

    for(let i = 0; i < n; ++i){
        const theta = theta_step * i;
        vertices[vert_i++] = Math.cos(theta) * radius;
        vertices[vert_i++] = Math.sin(theta) * radius;
        vertices[vert_i++] = 0;
    }

    let ind_i = 0;

    for(let i = 1; i <= n; ++i){
        indices[ind_i++] = 0;
        indices[ind_i++] = i;
        indices[ind_i++] = (i === n) ? 1 : i + 1;
    }
    let transform:mat4 = identity();

    if(angle && axis)
        transform = rotate(transform,angle,axis);
    if(translate_vec)
        transform = translate(transform,translate_vec);

    let vert = vec3(0,0,0);
    let out = vec4(0,0,0,0);
    for(let i = 0; i < vertices.length; i+=3){
        vert[0] = vertices[i]; vert[1] = vertices[i+1]; vert[2] = vertices[i+2];
        transform_vertex_mutate(transform,vert,out);
        vertices[i] = out[0]; vertices[i + 1] = out[1]; vertices[i + 2] = out[2];
    }
    return new Geometry(vertices,indices);
}

export function create_3d_ngon(
    n: number, 
    side_length: number, 
    depth_length: number | null,
    axis: vec3 | null = null, 
    angle: number | null = null, 
    translate_vec: vec3 | null = null
): Geometry {
    if (n <= 2) {
        console.warn("Invalid n - There are no polygons of dimension 2 or less.");
        throw new Error("Cannot create a polygon with less than 3 sides.");
    }
    let depth = side_length;
    if(depth_length) 
        depth = depth_length;

    const vertice_count = 2 + (2 * n); 
    
    const triangle_count = n * 4; 

    const vertices = new ArrayType(vertice_count * 3);
    const indices = new IndexingType(triangle_count * 3);

    const radius = side_length / (2 * Math.sin(Math.PI / n));
    const theta_step = (Math.PI * 2) / n;

    vertices[0] = 0; vertices[1] = 0; vertices[2] = -depth / 2;
    vertices[3] = 0; vertices[4] = 0; vertices[5] = depth / 2;

    let vert_i = 6;

    for (let i = 0; i < n; i++) {
        const theta = theta_step * i;
        vertices[vert_i++] = Math.cos(theta) * radius;
        vertices[vert_i++] = Math.sin(theta) * radius;
        vertices[vert_i++] = -depth / 2;
    }

    for (let i = 0; i < n; i++) {
        const theta = theta_step * i;
        vertices[vert_i++] = Math.cos(theta) * radius;
        vertices[vert_i++] = Math.sin(theta) * radius;
        vertices[vert_i++] = depth / 2;
    }

    let ind_i = 0;

    for (let i = 0; i < n; i++) {
        const bottom_current = 2 + i;
        const bottom_next = 2 + ((i + 1) % n);
        const top_current = 2 + n + i;
        const top_next = 2 + n + ((i + 1) % n);

        indices[ind_i++] = 0;
        indices[ind_i++] = bottom_next;
        indices[ind_i++] = bottom_current;

        indices[ind_i++] = 1;
        indices[ind_i++] = top_current;
        indices[ind_i++] = top_next;

        indices[ind_i++] = bottom_current;
        indices[ind_i++] = bottom_next;
        indices[ind_i++] = top_current;

        indices[ind_i++] = bottom_next;
        indices[ind_i++] = top_next;
        indices[ind_i++] = top_current;
    }

    let transform: mat4 = identity();

    if (angle && axis) transform = rotate(transform, angle, axis);
    if (translate_vec) transform = translate(transform, translate_vec);

    let vert = vec3(0, 0, 0);
    let out = vec4(0, 0, 0, 0); 
    for (let i = 0; i < vertices.length; i += 3) {
        vert[0] = vertices[i]; vert[1] = vertices[i + 1]; vert[2] = vertices[i + 2];
        transform_vertex_mutate(transform, vert, out);
        vertices[i] = out[0]; vertices[i + 1] = out[1]; vertices[i + 2] = out[2];
    }

    return new Geometry(vertices, indices);
}



export function create_torus(
    inner_radius: number, 
    outer_radius: number, 
    rings: number, 
    slices: number,
): Geometry {
    const vertice_count = (rings + 1) * (slices + 1) * 3;
    const vertices = new ArrayType(vertice_count);
    
    const indices = new IndexingType(rings * slices * 6); 

    let vert_i = 0;
    let ind_i = 0;

    for (let ring = 0; ring <= rings; ring++) {
        const phi = (ring * 2 * Math.PI) / rings; 
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        for (let slice = 0; slice <= slices; slice++) {
            const theta = (slice * 2 * Math.PI) / slices; 
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            const x = (outer_radius + inner_radius * cosPhi) * cosTheta;
            const y = inner_radius * sinPhi;
            const z = (outer_radius + inner_radius * cosPhi) * sinTheta;

            vertices[vert_i++] = x;
            vertices[vert_i++] = y;
            vertices[vert_i++] = z;
        }
    }

    for (let ring = 0; ring < rings; ring++) {
        for (let slice = 0; slice < slices; slice++) {
            const first = (ring * (slices + 1)) + slice;
            const second = first + slices + 1;

            indices[ind_i++] = first;
            indices[ind_i++] = second;
            indices[ind_i++] = first + 1;

            indices[ind_i++] = second;
            indices[ind_i++] = second + 1;
            indices[ind_i++] = first + 1;
        }
    }


    return new Geometry(vertices, indices);
}