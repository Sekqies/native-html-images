import type { Node } from "../rendering/types/node";

export interface Animation {
    name: string;
    apply(node: Node, t: number, dt: number): void;
}

export class Rotator implements Animation {
    public name = "Rotator";
    
    constructor(public axis: number, public speed: number) {}
    
    apply(node: Node, t: number, dt: number) {
        node.rotation[this.axis] += this.speed * dt;
    }
}

export class Oscillator implements Animation {
    public name = "Oscillator";
    
    constructor(
        public axis: number, 
        public speed: number, 
        public amplitude: number, 
        public base_val: number
    ) {}
    
    apply(node: Node, t: number, dt: number) {
        node.position[this.axis] = this.base_val + Math.sin(t * this.speed) * this.amplitude;
    }
}

export class Orbit implements Animation {
    public name = "Orbit";
    
    constructor(
        public speed: number, 
        public radius: number, 
        public center_x: number, 
        public center_z: number
    ) {}
    
    apply(node: Node, t: number, dt: number) {
        node.position[0] = this.center_x + Math.cos(t * this.speed) * this.radius;
        node.position[2] = this.center_z + Math.sin(t * this.speed) * this.radius;
    }
}