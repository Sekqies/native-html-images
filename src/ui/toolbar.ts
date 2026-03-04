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

function create_file_input(
    parent_el: HTMLElement, 
    options_el: HTMLElement,
    on_create_geometry: (geo: Geometry) => void
): void {
    const file_input = document.createElement("input");
    file_input.type = "file";
    file_input.accept = ".obj";
    file_input.hidden = true;
    
    file_input.addEventListener("change", (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            try {
                const geo = parse_obj(content);
                on_create_geometry(geo);
            } catch (err) {
                console.error("Failed to parse OBJ:", err);
                alert("Failed to parse the OBJ file. Check the console for details.");
            }
            file_input.value = ""; 
        };
        
        reader.readAsText(file);
    });

    const import_btn = document.createElement("button");
    const b = document.createElement("b");
    b.innerText = "Import OBJ";
    import_btn.appendChild(b); 
    import_btn.title = "Upload a custom .obj 3D model.";
    
    import_btn.addEventListener("click", () => {
        options_el.innerHTML = `<h3><font face="Arial">Import Custom Model</font></h3><font size="2" color="gray">Select an .obj file from your computer.</font>`;
        file_input.click();
    });
    
    parent_el.appendChild(import_btn);
    parent_el.appendChild(document.createElement("br")); 
    parent_el.appendChild(file_input);
}

export function initialize_toolbar(
    toolbar_container_id: string,
    options_container_id: string,
    on_create_geometry: (geo: Geometry) => void
): void {
    const toolbar_el = document.getElementById(toolbar_container_id);
    const options_el = document.getElementById(options_container_id);

    if (!toolbar_el || !options_el) {
        console.warn("These ids do not exist: ", toolbar_container_id, options_container_id);
        return;
    }

    toolbar_el.innerHTML = ""; 

    const primitives_container = create_category(toolbar_el, "Primitives", true);
    
    Object.entries(primitive_map).forEach(([name, tool]) => {
        const btn = document.createElement("button");
        btn.innerText = name;
        btn.title = tool.description;

        btn.addEventListener("click", () => {
            options_el.innerHTML = `<h3><font face="Arial">${name} Options</font></h3>`;
            
            const inputs: HTMLInputElement[] = [];

            tool.parameters.forEach(param => {
                const label = document.createElement("label");
                const font = document.createElement("font");
                font.setAttribute("face", "Arial");
                font.innerText = `${param.name}: `;
                label.appendChild(font);
                if (param.toolhint) label.title = param.toolhint;

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

            const create_btn = document.createElement("button");
            const b = document.createElement("b");
            b.innerText = "Add to Scene";
            create_btn.appendChild(b);
            
            create_btn.addEventListener("click", () => {
                const args = inputs.map(input => parseFloat(input.value));
                const new_geometry = tool.fun(...args);
                on_create_geometry(new_geometry);
            });

            options_el.appendChild(create_btn);
        });

        primitives_container.appendChild(btn);
        primitives_container.appendChild(document.createElement("br"));
    });

    const import_container = create_category(toolbar_el, "Import", false);
    create_file_input(import_container, options_el, on_create_geometry);
}