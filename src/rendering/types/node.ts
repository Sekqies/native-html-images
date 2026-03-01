import type { mat4 } from "../../math/types";
import type { Mesh } from "./mesh";

class Node{
    mesh:Mesh;
    model:mat4;
    mvp:mat4;

    constructor(mesh:Mesh, model:mat4, mvp:mat4){
        this.mesh = mesh;
        this.model = model;
        this.mvp = mvp;
    }
}