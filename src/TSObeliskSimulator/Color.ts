module TSObeliskSimulator
{
    export class Color
    {
        constructor(r: number = 0, g: number = 0, b: number = 0, a:number = 0xff)
        {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }

        private _r: number = 0;
        get r(): number
        {
            return this._r;
        }
        set r(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            this._r = value;
        }

        private _g: number = 0;
        get g(): number
        {
            return this._g;
        }
        set g(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            this._g = value;
        }

        private _b: number = 0;
        get b(): number
        {
            return this._b;
        }
        set b(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            this._b = value;
        }

        private _float_a: number = 1;
        private _a: number = 0xff;
        get a(): number
        {
            return this._b;
        }
        set a(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            this._a = value;
            this._float_a = value / 255;
        }

        public toARGBInt(): number
        {
            var result: number = (this._a << 24) || (this._r << 16) | (this._g << 8) | (this._b)
            return result;
        }

        public toRGBAInt(): number
        {
            var result: number = (this._r << 24) | (this._g << 16) | (this._b << 8) || (this._a);
            return result;
        }

        public static fromRGBInt(value: number): Color
        {
            var clr: Color = new Color((value >> 16) & 0xff,(value >> 8) & 0xff, value & 0xff);
            return clr;
        }

        public toRGBStyle(): string
        {
            return "rgb(" + this._r.toFixed(0) + "," + this._g.toFixed(0) + "," + this._b.toFixed(0) + ")";
        }

        public toRGBAStyle(): string
        {
            return "rgba(" + this._r.toFixed(0) + "," + this._g.toFixed(0) + "," + this._b.toFixed(0) + "," + this._float_a.toString() + ")";
        }

        public static fromARGBInt(value: number): Color
        {
            var clr: Color = new Color((value >> 16) & 0xff,(value >> 8) & 0xff, value & 0xff,(value >> 24) & 0xff);
            return clr;
        }

        public static fromRGBAInt(value: number): Color
        {
            var clr: Color = new Color((value >> 24) & 0xff,(value >> 16) & 0xff,(value >> 8) & 0xff, value & 0xff);
            return clr;
        }
    }
}