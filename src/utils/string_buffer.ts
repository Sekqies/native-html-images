
export function string_to_uint(str: string): Uint8Array {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
    }
    return arr;
}

export function character_to_uint(str:string):number{
    return str.charCodeAt(0);
}


const MINUS = character_to_uint("-");
const ZERO = character_to_uint("0");
const DOT = character_to_uint(".");


export const SB_TOKENS = {
    MINUS: MINUS,
    ZERO: ZERO,
    DOT: DOT,
    COMMA: character_to_uint(','),
    SPACE: character_to_uint(' ')
}

export class StringBuffer{
    cursor:number;
    buffer:Uint8Array;
    constructor(size:number){
        this.buffer = new Uint8Array(size);
        this.cursor = 0;
    }
    
    push(val:number){
        this.buffer[this.cursor++] = val;
    }

    write_chunk(chunk:Uint8Array):void {
        this.buffer.set(chunk,this.cursor);
        this.cursor += chunk.length;
    }

    write_float(val:number):void {
        if(val < 0){
            this.push(MINUS);
            val = -val;
        }
        const fixed_point = (val * 1000 + 0.5) | 0;
        const integer_part = (fixed_point / 1000) | 0;
        
        if(integer_part !== 0){
            const start = this.cursor;
            let temp = integer_part;
            while(temp > 0){
                const digit = temp%10;
                this.push(ZERO + digit);
                temp = (temp/10) | 0;
            }
            let left = start;
            let right = this.cursor - 1;
            while(left<right){
                const swap = this.buffer[left];
                this.buffer[left++] = this.buffer[right];
                this.buffer[right--] = swap;
            }
        }
        else {
            this.push(ZERO);
        }
        this.push(DOT);
        let decimal_part = fixed_point % 1000;
        const first_digit = (decimal_part / 100) | 0;
        this.push(ZERO + first_digit);
        decimal_part %= 100;

        const second_digit = (decimal_part / 10) | 0;
        this.push(ZERO + second_digit);
        const third_digit = decimal_part % 10;
        this.push(ZERO + third_digit);  
    }

    write_string(str:string):void {
        for(let i = 0; i < str.length; ++i){
            this.push(str.charCodeAt(i));
        }
    }

    reset():void {
        this.cursor = 0;
    }
}