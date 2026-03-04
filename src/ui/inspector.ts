import type { Node } from "../rendering/types/node";

export class Inspector {
    private container: HTMLElement;
    public current_node: Node | null = null;

    private move_speed = 0.5;
    private rot_speed = 0.26; 
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

        this.create_action_row(table, "Rotate X", 
            () => { node.rotation[0] -= this.rot_speed; node.update_matrix(); },
            () => { node.rotation[0] += this.rot_speed; node.update_matrix(); }
        );
        this.create_action_row(table, "Rotate Y", 
            () => { node.rotation[1] -= this.rot_speed; node.update_matrix(); },
            () => { node.rotation[1] += this.rot_speed; node.update_matrix(); }
        );
        this.create_action_row(table, "Rotate Z", 
            () => { node.rotation[2] -= this.rot_speed; node.update_matrix(); },
            () => { node.rotation[2] += this.rot_speed; node.update_matrix(); }
        );

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

        if (node.mesh && node.mesh.albedo) {
            this.create_color_row(table, "Color", node.mesh.albedo);
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

    private create_color_row(table: HTMLElement, label: string, color_vec: Float32Array | number[]) {
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