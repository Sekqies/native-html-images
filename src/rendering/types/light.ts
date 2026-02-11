import type { vec3 } from "../../math/types";

export class Light{
    position:vec3;
    color:vec3;
    intensity:number;
    radius:number;

    direction?: vec3;
    cutoff?: number;

    constructor(position:vec3, color:vec3, intensity:number, radius:number, direction?:vec3, cutoff_angle?:number){
        this.position = position;
        this.color = color;
        this.intensity = intensity;
        this.radius = radius;
        if(direction)
            this.direction = direction;
        if(cutoff_angle)
            this.cutoff = Math.cos(cutoff_angle);
    }
}