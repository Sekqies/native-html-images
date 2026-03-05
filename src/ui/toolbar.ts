import { primitive_map } from "./toolbar_config";
import { Geometry } from "../rendering/types/geometry";
import { parse_obj } from "../utils/parser";

function create_category(parent_el: HTMLElement, title: string, is_open: boolean = true): HTMLElement {
    const details = document.createElement("details");
    if (is_open) details.open = true;

    const summary = document.createElement("summary");
    const b = document.createElement("b");
    const font = document.createElement("font");
    font.setAttribute("face", "Arial");
    font.setAttribute("color", "#aaaaaa");
    font.innerText = title;

    b.appendChild(font);
    summary.appendChild(b);
    details.appendChild(summary);

    const blockquote = document.createElement("blockquote");
    details.appendChild(blockquote);
    
    parent_el.appendChild(details);
    parent_el.appendChild(document.createElement("br")); 

    return blockquote;
}

function append_color_picker(options_el: HTMLElement, default_hex: string): HTMLInputElement {
    const label = document.createElement("label");
    const font = document.createElement("font");
    font.setAttribute("face", "Arial");
    font.innerText = "Color: ";
    label.appendChild(font);

    const input = document.createElement("input");
    input.type = "color";
    input.value = default_hex;

    options_el.appendChild(label);
    options_el.appendChild(input);
    options_el.appendChild(document.createElement("br"));
    options_el.appendChild(document.createElement("br"));

    return input;
}

function create_file_input(
    parent_el: HTMLElement, 
    options_el: HTMLElement,
    on_create_geometry: (geo: Geometry, color: number[]) => void
): void {
    const file_input = document.createElement("input");
    file_input.type = "file";
    file_input.accept = ".obj";
    file_input.hidden = true; 

    const import_btn = document.createElement("button");
    const b = document.createElement("b");
    b.innerText = "Import OBJ";
    import_btn.appendChild(b); 
    
    import_btn.addEventListener("click", () => {
        options_el.innerHTML = `<h3><font face="Arial">Import Custom Model</font></h3><font size="2" color="gray">Set color then select an .obj file.</font><br><br>`;
        
        const color_picker = append_color_picker(options_el, "#b2b2b2");
        
        const choose_file_btn = document.createElement("button");
        const choose_b = document.createElement("b");
        choose_b.innerText = "Choose File";
        choose_file_btn.appendChild(choose_b);
        
        choose_file_btn.addEventListener("click", () => file_input.click());
        
        options_el.appendChild(choose_file_btn);

        file_input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                try {
                    const geo = parse_obj(content);
                    const hex = color_picker.value;
                    const r = parseInt(hex.substring(1, 3), 16) / 255.0;
                    const g = parseInt(hex.substring(3, 5), 16) / 255.0;
                    const b = parseInt(hex.substring(5, 7), 16) / 255.0;
                    on_create_geometry(geo, [r, g, b]);
                } catch (err) {
                    console.error(err);
                }
                file_input.value = ""; 
            };
            reader.readAsText(file);
        };
    });
    
    parent_el.appendChild(import_btn);
    parent_el.appendChild(document.createElement("br")); 
    parent_el.appendChild(file_input);
}

export function initialize_toolbar(
    toolbar_container_id: string,
    options_container_id: string,
    on_create_geometry: (geo: Geometry, color: number[]) => void,
    on_create_light: (intensity: number, radius: number, color: number[], casts_shadow:boolean) => void,
    on_playback_action: (action: "play" | "pause" | "stop") => void,
    on_add_animation: (type: string, params: number[]) => void,
    on_load_sample: () => void
): void {
    const toolbar_el = document.getElementById(toolbar_container_id);
    const options_el = document.getElementById(options_container_id);

    if (!toolbar_el || !options_el) return;

    toolbar_el.innerHTML = ""; 

    const playback_container = create_category(toolbar_el, "Playback", true);
    
    const play_btn = document.createElement("button");
    play_btn.innerHTML = "<b>Play</b>";
    play_btn.onclick = () => on_playback_action("play");
    
    const pause_btn = document.createElement("button");
    pause_btn.innerHTML = "<b>Pause</b>";
    pause_btn.onclick = () => on_playback_action("pause");
    
    const stop_btn = document.createElement("button");
    stop_btn.innerHTML = "<b>Stop</b>";
    stop_btn.onclick = () => on_playback_action("stop");
    
    playback_container.appendChild(play_btn);
    playback_container.appendChild(pause_btn);
    playback_container.appendChild(stop_btn);
    playback_container.appendChild(document.createElement("br"));

    const primitives_container = create_category(toolbar_el, "Primitives", true);
    
    Object.entries(primitive_map).forEach(([name, tool]) => {
        const btn = document.createElement("button");
        btn.innerText = name;

        btn.addEventListener("click", () => {
            options_el.innerHTML = `<h3><font face="Arial">${name} Options</font></h3>`;
            
            const inputs: HTMLInputElement[] = [];

            tool.parameters.forEach(param => {
                const label = document.createElement("label");
                const font = document.createElement("font");
                font.setAttribute("face", "Arial");
                font.innerText = `${param.name}: `;
                label.appendChild(font);

                const input = document.createElement("input");
                input.type = "range";
                input.min = param.min.toString();
                input.max = param.max.toString();
                input.step = param.step.toString();
                input.value = param.default.toString();

                const value_display = document.createElement("span");
                const val_font = document.createElement("font");
                val_font.setAttribute("face", "monospace");
                val_font.innerText = input.value;
                value_display.appendChild(val_font);

                input.addEventListener("input", () => {
                    val_font.innerText = input.value;
                });

                inputs.push(input);

                options_el.appendChild(label);
                options_el.appendChild(input);
                options_el.appendChild(value_display);
                options_el.appendChild(document.createElement("br"));
                options_el.appendChild(document.createElement("br"));
            });

            const color_picker = append_color_picker(options_el, "#b2b2b2");

            const create_btn = document.createElement("button");
            const b = document.createElement("b");
            b.innerText = "Add to Scene";
            create_btn.appendChild(b);
            
            create_btn.addEventListener("click", () => {
                const args = inputs.map(input => parseFloat(input.value));
                const new_geometry = tool.fun(...args);
                
                const hex = color_picker.value;
                const r = parseInt(hex.substring(1, 3), 16) / 255.0;
                const g = parseInt(hex.substring(3, 5), 16) / 255.0;
                const b = parseInt(hex.substring(5, 7), 16) / 255.0;
                
                on_create_geometry(new_geometry, [r, g, b]);
            });

            options_el.appendChild(create_btn);
        });

        primitives_container.appendChild(btn);
        primitives_container.appendChild(document.createElement("br"));
    });

    const lights_container = create_category(toolbar_el, "Lights", false);
    
    const add_light_btn = document.createElement("button");
    const b_light = document.createElement("b");
    b_light.innerText = "Add Point Light";
    add_light_btn.appendChild(b_light);

    add_light_btn.addEventListener("click", () => {
        options_el.innerHTML = `<h3><font face="Arial">Point Light Options</font></h3>`;

        const label_int = document.createElement("label");
        const font_int = document.createElement("font");
        font_int.setAttribute("face", "Arial");
        font_int.innerText = "Intensity: ";
        label_int.appendChild(font_int);

        const input_int = document.createElement("input");
        input_int.type = "range";
        input_int.min = "0.1";
        input_int.max = "10.0";
        input_int.step = "0.1";
        input_int.value = "1.0";

        const val_int = document.createElement("span");
        const val_int_font = document.createElement("font");
        val_int_font.setAttribute("face", "monospace");
        val_int_font.innerText = input_int.value;
        val_int.appendChild(val_int_font);

        input_int.addEventListener("input", () => {
            val_int_font.innerText = input_int.value;
        });

        const label_rad = document.createElement("label");
        const font_rad = document.createElement("font");
        font_rad.setAttribute("face", "Arial");
        font_rad.innerText = "Radius: ";
        label_rad.appendChild(font_rad);

        const input_rad = document.createElement("input");
        input_rad.type = "range";
        input_rad.min = "1.0";
        input_rad.max = "100.0";
        input_rad.step = "1.0";
        input_rad.value = "10.0";

        const val_rad = document.createElement("span");
        const val_rad_font = document.createElement("font");
        val_rad_font.setAttribute("face", "monospace");
        val_rad_font.innerText = input_rad.value;
        val_rad.appendChild(val_rad_font);

        input_rad.addEventListener("input", () => {
            val_rad_font.innerText = input_rad.value;
        });

        options_el.appendChild(label_int);
        options_el.appendChild(input_int);
        options_el.appendChild(val_int);
        options_el.appendChild(document.createElement("br"));
        options_el.appendChild(document.createElement("br"));

        options_el.appendChild(label_rad);
        options_el.appendChild(input_rad);
        options_el.appendChild(val_rad);
        options_el.appendChild(document.createElement("br"));
        options_el.appendChild(document.createElement("br"));

        const color_picker = append_color_picker(options_el, "#ffffff");

        const label_shadow = document.createElement("label");
        const font_shadow = document.createElement("font");
        font_shadow.setAttribute("face", "Arial");
        font_shadow.innerText = "Cast Shadows: ";
        label_shadow.appendChild(font_shadow);

        const input_shadow = document.createElement("input");
        input_shadow.type = "checkbox";
        input_shadow.checked = false;

        const warning_shadow = document.createElement("font");
        warning_shadow.setAttribute("color", "red");
        warning_shadow.setAttribute("size", "2");
        warning_shadow.setAttribute("face", "Arial");
        const b_warning = document.createElement("b");
        b_warning.innerText = " WARNING: Enabling this forces real-time raytracing. It WILL drastically tank your performance.";
        warning_shadow.appendChild(b_warning);

        const create_btn = document.createElement("button");
        const create_b = document.createElement("b");
        create_b.innerText = "Add to Scene";
        options_el.appendChild(label_shadow);
        options_el.appendChild(input_shadow);
        options_el.appendChild(document.createElement("br"));
        options_el.appendChild(warning_shadow);
        options_el.appendChild(document.createElement("br"));
        options_el.appendChild(document.createElement("br"));
        create_btn.appendChild(create_b);

        create_btn.addEventListener("click", () => {
            const intensity = parseFloat(input_int.value);
            const radius = parseFloat(input_rad.value);
            const casts_shadow = input_shadow.checked;
            
            const hex = color_picker.value;
            const r = parseInt(hex.substring(1, 3), 16) / 255.0;
            const g = parseInt(hex.substring(3, 5), 16) / 255.0;
            const b = parseInt(hex.substring(5, 7), 16) / 255.0;
            
            on_create_light(intensity, radius, [r, g, b], casts_shadow);
        });

        options_el.appendChild(create_btn);
    });

    lights_container.appendChild(add_light_btn);
    lights_container.appendChild(document.createElement("br"));

    const import_container = create_category(toolbar_el, "Import", false);
    create_file_input(import_container, options_el, on_create_geometry);

    const anim_container = create_category(toolbar_el, "Animations", false);

    const anims = [
        {
            name: "Rotator",
            params: [
                { name: "Axis (0=X,1=Y,2=Z)", min: "0", max: "2", step: "1", default: "1" },
                { name: "Speed", min: "-5", max: "5", step: "0.1", default: "1.0" }
            ]
        },
        {
            name: "Oscillator",
            params: [
                { name: "Axis (0=X,1=Y,2=Z)", min: "0", max: "2", step: "1", default: "1" },
                { name: "Speed", min: "0.1", max: "10", step: "0.1", default: "2.0" },
                { name: "Amplitude", min: "0.1", max: "10", step: "0.1", default: "1.0" },
                { name: "Base Value", min: "-10", max: "10", step: "0.1", default: "0.0" }
            ]
        },
        {
            name: "Orbit",
            params: [
                { name: "Speed", min: "-5", max: "5", step: "0.1", default: "1.0" },
                { name: "Radius", min: "0.1", max: "20", step: "0.1", default: "5.0" },
                { name: "Center X", min: "-10", max: "10", step: "0.1", default: "0.0" },
                { name: "Center Z", min: "-10", max: "10", step: "0.1", default: "0.0" }
            ]
        }
    ];

    anims.forEach(anim => {
        const btn = document.createElement("button");
        btn.innerText = anim.name;
        
        btn.addEventListener("click", () => {
            options_el.innerHTML = `<h3><font face="Arial">${anim.name} Options</font></h3>`;
            
            const inputs: HTMLInputElement[] = [];
            
            anim.params.forEach(param => {
                const label = document.createElement("label");
                const font = document.createElement("font");
                font.setAttribute("face", "Arial");
                font.innerText = `${param.name}: `;
                label.appendChild(font);

                const input = document.createElement("input");
                input.type = "range";
                input.min = param.min;
                input.max = param.max;
                input.step = param.step;
                input.value = param.default;

                const val_display = document.createElement("span");
                const val_font = document.createElement("font");
                val_font.setAttribute("face", "monospace");
                val_font.innerText = input.value;
                val_display.appendChild(val_font);

                input.addEventListener("input", () => {
                    val_font.innerText = input.value;
                });

                inputs.push(input);

                options_el.appendChild(label);
                options_el.appendChild(input);
                options_el.appendChild(val_display);
                options_el.appendChild(document.createElement("br"));
                options_el.appendChild(document.createElement("br"));
            });

            const create_btn = document.createElement("button");
            const b = document.createElement("b");
            b.innerText = "Add to Selected";
            create_btn.appendChild(b);
            
            create_btn.addEventListener("click", () => {
                const args = inputs.map(input => parseFloat(input.value));
                on_add_animation(anim.name, args);
            });

            options_el.appendChild(create_btn);
        });
        
        anim_container.appendChild(btn);
        anim_container.appendChild(document.createElement("br"));
    });

    const samples_container = create_category(toolbar_el, "Samples", false);
    
    const sample_btn = document.createElement("button");
    const b_sample = document.createElement("b");
    b_sample.innerText = "Load Solar System Scene";
    sample_btn.appendChild(b_sample);

    sample_btn.addEventListener("click", () => {
        options_el.innerHTML = `<h3><font face="Arial">Sample Scene</font></h3><font size="2" color="gray">Loading the animated sample scene...</font>`;
        on_load_sample();
    });

    samples_container.appendChild(sample_btn);
    samples_container.appendChild(document.createElement("br"));
}