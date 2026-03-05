import type { ArrayType } from "../math/types";
import type { Node } from "../rendering/types/node";

export class Inspector {
    private container: HTMLElement;
    public current_node: Node | null = null;

    private move_speed = 0.5;
    private scale_factor = 0.1;

    constructor(container_id: string) {
        const el = document.getElementById(container_id);
        if (!el) throw new Error(`Inspector container not found.`);
        this.container = el;
        this.clear();
        this.setup_keyboard_controls();
    }

    public inspect(node: Node | null) {
        this.current_node = node;
        this.container.innerHTML = "";

        if (!node) {
            this.clear();
            return;
        }

        const h3 = document.createElement("h3");
        const title_font = document.createElement("font");
        title_font.setAttribute("face", "Arial");
        title_font.innerText = "Action Inspector";
        h3.appendChild(title_font);
        this.container.appendChild(h3);

        const hint = document.createElement("font");
        hint.setAttribute("size", "2");
        hint.setAttribute("color", "gray");
        hint.setAttribute("face", "Arial");
        hint.innerText = "WASD to move X/Z. Q/E to move Y.";
        this.container.appendChild(hint);
        
        this.container.appendChild(document.createElement("br"));
        this.container.appendChild(document.createElement("br"));

        const table = document.createElement("table");
        table.setAttribute("border", "0");
        table.setAttribute("cellpadding", "2");
        this.container.appendChild(table);

        this.create_action_row(table, "Move X", 
            () => { node.position[0] -= this.move_speed; node.update_matrix(); },
            () => { node.position[0] += this.move_speed; node.update_matrix(); }
        );
        this.create_action_row(table, "Move Y", 
            () => { node.position[1] -= this.move_speed; node.update_matrix(); },
            () => { node.position[1] += this.move_speed; node.update_matrix(); }
        );
        this.create_action_row(table, "Move Z", 
            () => { node.position[2] -= this.move_speed; node.update_matrix(); },
            () => { node.position[2] += this.move_speed; node.update_matrix(); }
        );

        this.add_divider(table);

        this.create_slider_row(table, "Rotate X", "-3.14", "3.14", "0.01", node.rotation[0], (v) => {
            node.rotation[0] = v;
            node.update_matrix();
        });
        this.create_slider_row(table, "Rotate Y", "-3.14", "3.14", "0.01", node.rotation[1], (v) => {
            node.rotation[1] = v;
            node.update_matrix();
        });
        this.create_slider_row(table, "Rotate Z", "-3.14", "3.14", "0.01", node.rotation[2], (v) => {
            node.rotation[2] = v;
            node.update_matrix();
        });

        this.add_divider(table);

        this.create_action_row(table, "Scale", 
            () => { 
                node.scale_vec[0] -= this.scale_factor;
                node.scale_vec[1] -= this.scale_factor;
                node.scale_vec[2] -= this.scale_factor;
                node.update_matrix(); 
            },
            () => { 
                node.scale_vec[0] += this.scale_factor;
                node.scale_vec[1] += this.scale_factor;
                node.scale_vec[2] += this.scale_factor;
                node.update_matrix(); 
            }
        );

        this.add_divider(table);

        const tr_del = document.createElement("tr");
        const td_del = document.createElement("td");
        td_del.setAttribute("colspan", "3");
        
        const btn_del = document.createElement("button");
        const b_del = document.createElement("b");
        const font_del = document.createElement("font");
        font_del.setAttribute("color", "red");
        font_del.setAttribute("face", "Arial");
        font_del.innerText = "Delete Mesh";
        b_del.appendChild(font_del);
        btn_del.appendChild(b_del);
        
        btn_del.onclick = () => {
            node.scale_vec[0] = 0;
            node.scale_vec[1] = 0;
            node.scale_vec[2] = 0;
            node.update_matrix();
            this.inspect(node);
        };
        
        td_del.appendChild(btn_del);
        tr_del.appendChild(td_del);
        table.appendChild(tr_del);

        this.add_divider(table);

        if (node.mesh && node.mesh.albedo && !node.light) {
            this.create_color_row(table, "Color", node.mesh.albedo, node.mesh.albedo);
        }

        if (node.light) {
            this.add_divider(table);

            const tr_light = document.createElement("tr");
            const td_light = document.createElement("td");
            td_light.setAttribute("colspan", "3");
            const b_light = document.createElement("b");
            const font_light = document.createElement("font");
            font_light.setAttribute("face", "Arial");
            font_light.innerText = "Light Properties";
            b_light.appendChild(font_light);
            td_light.appendChild(b_light);
            tr_light.appendChild(td_light);
            table.appendChild(tr_light);

            const light = node.light;

            this.create_action_row(table, "Intensity", 
                () => { light.intensity -= 0.1; },
                () => { light.intensity += 0.1; }
            );

            this.create_action_row(table, "Radius", 
                () => { light.radius -= 1.0; },
                () => { light.radius += 1.0; }
            );

            this.create_color_row(table, "Emission", light.color, node.mesh.albedo);

            if (false) {
                this.create_slider_row(table, "Cutoff", "0.0", "3.14", "0.01", Math.acos(light.cutoff || 1.0), (v) => {
                    light.cutoff = Math.cos(v);
                });
            }
        }

        const any_node = node as any;
        if (any_node.animations && any_node.animations.length > 0) {
            this.add_divider(table);

            const tr_anim = document.createElement("tr");
            const td_anim = document.createElement("td");
            td_anim.setAttribute("colspan", "3");
            const b_anim = document.createElement("b");
            const font_anim = document.createElement("font");
            font_anim.setAttribute("face", "Arial");
            font_anim.innerText = "Animations";
            b_anim.appendChild(font_anim);
            td_anim.appendChild(b_anim);
            tr_anim.appendChild(td_anim);
            table.appendChild(tr_anim);

            any_node.animations.forEach((anim: any, idx: number) => {
                const tr = document.createElement("tr");
                const td_name = document.createElement("td");
                td_name.setAttribute("colspan", "2");
                const f_name = document.createElement("font");
                f_name.setAttribute("face", "Arial");
                f_name.innerText = anim.name;
                td_name.appendChild(f_name);

                const td_btn = document.createElement("td");
                const btn = document.createElement("button");
                btn.innerText = "Remove";
                btn.onclick = () => {
                    any_node.animations.splice(idx, 1);
                    this.inspect(node);
                };
                td_btn.appendChild(btn);

                tr.appendChild(td_name);
                tr.appendChild(td_btn);
                table.appendChild(tr);
            });
        }
    }

    private clear() {
        this.container.innerHTML = `<font color="gray" face="Arial">Select an object to inspect.</font>`;
    }

    private add_divider(table: HTMLElement) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.setAttribute("colspan", "3");
        td.appendChild(document.createElement("hr"));
        tr.appendChild(td);
        table.appendChild(tr);
    }

    private create_action_row(table: HTMLElement, label: string, on_minus: () => void, on_plus: () => void) {
        const tr = document.createElement("tr");

        const td_label = document.createElement("td");
        const font = document.createElement("font");
        font.setAttribute("face", "Arial");
        font.innerText = `${label}: `;
        td_label.appendChild(font);

        const td_minus = document.createElement("td");
        const btn_minus = document.createElement("button");
        btn_minus.innerText = " - ";
        btn_minus.onclick = on_minus;
        td_minus.appendChild(btn_minus);

        const td_plus = document.createElement("td");
        const btn_plus = document.createElement("button");
        btn_plus.innerText = " + ";
        btn_plus.onclick = on_plus;
        td_plus.appendChild(btn_plus);

        tr.appendChild(td_label);
        tr.appendChild(td_minus);
        tr.appendChild(td_plus);
        table.appendChild(tr);
    }

    private create_slider_row(table: HTMLElement, label: string, min: string, max: string, step: string, value: number, on_change: (val: number) => void) {
        const tr = document.createElement("tr");

        const td_label = document.createElement("td");
        const font = document.createElement("font");
        font.setAttribute("face", "Arial");
        font.innerText = `${label}: `;
        td_label.appendChild(font);

        const td_input = document.createElement("td");
        td_input.setAttribute("colspan", "2");

        const input = document.createElement("input");
        input.type = "range";
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value.toString();

        const val_font = document.createElement("font");
        val_font.setAttribute("face", "monospace");
        val_font.innerText = " " + value.toFixed(2);

        input.addEventListener("input", (e) => {
            const num = parseFloat((e.target as HTMLInputElement).value);
            val_font.innerText = " " + num.toFixed(2);
            on_change(num);
        });

        td_input.appendChild(input);
        td_input.appendChild(val_font);
        tr.appendChild(td_label);
        tr.appendChild(td_input);
        table.appendChild(tr);
    }

    private create_color_row(table: HTMLElement, label: string, color_vec: ArrayType | number[], albedo: ArrayType) {
        const tr = document.createElement("tr");

        const td_label = document.createElement("td");
        const font = document.createElement("font");
        font.setAttribute("face", "Arial");
        font.innerText = `${label}: `;
        td_label.appendChild(font);

        const td_input = document.createElement("td");
        td_input.setAttribute("colspan", "2"); 
        
        const color_picker = document.createElement("input");
        color_picker.type = "color";

        const r = Math.max(0, Math.min(255, Math.round(color_vec[0] * 255))).toString(16).padStart(2, '0');
        const g = Math.max(0, Math.min(255, Math.round(color_vec[1] * 255))).toString(16).padStart(2, '0');
        const b = Math.max(0, Math.min(255, Math.round(color_vec[2] * 255))).toString(16).padStart(2, '0');
        color_picker.value = `#${r}${g}${b}`;

        color_picker.addEventListener("input", (e) => {
            const hex = (e.target as HTMLInputElement).value;
            color_vec[0] = parseInt(hex.substring(1, 3), 16) / 255.0;
            color_vec[1] = parseInt(hex.substring(3, 5), 16) / 255.0;
            color_vec[2] = parseInt(hex.substring(5, 7), 16) / 255.0;
            albedo[0] = color_vec[0];
            albedo[1] = color_vec[1];
            albedo[2] = color_vec[2];
        });

        td_input.appendChild(color_picker);
        tr.appendChild(td_label);
        tr.appendChild(td_input);
        table.appendChild(tr);
    }

    private setup_keyboard_controls() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!this.current_node) return;
            
            let dirty = false;
            
            switch(e.key.toLowerCase()) {
                case 'w': this.current_node.position[2] -= this.move_speed; dirty = true; break; 
                case 's': this.current_node.position[2] += this.move_speed; dirty = true; break;
                case 'a': this.current_node.position[0] -= this.move_speed; dirty = true; break;
                case 'd': this.current_node.position[0] += this.move_speed; dirty = true; break;
                case 'q': this.current_node.position[1] += this.move_speed; dirty = true; break;
                case 'e': this.current_node.position[1] -= this.move_speed; dirty = true; break;
            }

            if (dirty) {
                this.current_node.update_matrix();
            }
        });
    }
}