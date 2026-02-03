function hsl2rgb(h, s, l) {
    const f_final = (n) => {
        const k = (n + h * 12) % 12;
        const color = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return 255 * color;
    };
    return [f_final(0), f_final(8), f_final(4)];
}

export function generate_trash_data(width, height){
    const out = []
    const center_x = width / 2;
    const center_y = height / 2;
    for(let value_y=0;value_y<height;++value_y){
        let line = []
        for(let value_x=0;value_x<width;++value_x){
            const x = value_x - center_x;
            const y = center_y - value_y;

            const angle = Math.atan2(y,x);
            const hue = ((angle + Math.PI)/(2.0 * Math.PI));
            const light = (2.0/Math.PI) * Math.atan(Math.sqrt(x**2 + y**2)/100);
            const color = hsl2rgb(hue,1.0,light);
            line.push(color);
        }
        out.push(line);
    }
    return out;
}