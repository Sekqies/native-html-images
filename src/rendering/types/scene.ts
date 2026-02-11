import { ArrayType, IndexingType, vec3 } from "../../math/types";
import type { Geometry } from "./geometry";
import type { Light } from "./light";
import { Mesh } from "./mesh";

export class Scene{
    projected_buffer!:ArrayType;
    scene_buffer!:ArrayType;
    color_buffer!:ArrayType
    draw_order!: IndexingType;
    draw_end!:number;
    meshes!:Mesh[];
    lights!:Light[];

    private scene_cursor = 0;
    private projected_cursor = 0;
    private color_cursor = 0;

    /**
     * Initialize a Scene instance
     * @param geometry If you want a static scene, provide a list of Geometries of all present meshes. If you want a scene that grows to a dynamically large value, provide the maximum number of triangles Scene will store.
     * @returns Nothing
     */
    constructor(geometry: Geometry[] | number) {
        if (typeof geometry === "number") {
            this.reserve(geometry);
            return;
        }
        let total_tris = 0;
        let total_verts = 0;

        for (let g of geometry) {
            total_tris += g.indices.length / 3;
            total_verts += g.vertices.length / 3;
        }
        this.reserve(total_tris);
        for (let g of geometry) {
            this.add_mesh(g);
        }
    }
    /**
     * Reserves memory for buffers in scene.
     * @param max_triangles The maximum number of triangles this Scene object can store. 
     */
    reserve(max_triangles:number){
        this.scene_buffer = new ArrayType(max_triangles * 12);
        this.projected_buffer = new ArrayType(max_triangles * 12);
        this.draw_order = new IndexingType(max_triangles);
        this.color_buffer = new ArrayType(max_triangles*3);
        this.draw_end = 0;
        this.meshes = [];
        this.lights = [];
    }

    clear(){
        this.scene_cursor = 0;
        this.projected_cursor = 0;
        this.color_cursor = 0;
        this.meshes = [];
        this.lights = [];
    }

    add_mesh(geometry:Geometry, color:vec3 = vec3(0,0,0)):Mesh{
        const scene_size = geometry.indices.length * 4;
        const proj_size = geometry.vertices.length/3*4;
        const color_size = geometry.vertices.length;

        const scene_view = this.scene_buffer.subarray(this.scene_cursor, this.scene_cursor + scene_size);
        const proj_view = this.projected_buffer.subarray(this.projected_cursor,this.projected_cursor + proj_size);
        const color_view = this.color_buffer.subarray(this.color_cursor,this.color_cursor + color_size);


        this.scene_cursor += scene_size;
        this.projected_cursor += proj_size;
        this.color_cursor += color_size;

        const mesh = new Mesh(geometry,color,scene_view,proj_view,color_view);
        this.meshes.push(mesh);
        return mesh;
    }
    add_light(light:Light){
        this.lights.push(light);
    }


}