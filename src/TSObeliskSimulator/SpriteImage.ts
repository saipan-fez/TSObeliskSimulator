module TSObeliskSimulator
{
    /// <summary>
    /// スプライト画像表示用クラス。
    /// </summary>
    export class SpriteImage implements ISprite
    {
        private _canvas: HTMLCanvasElement; // スプライト用canvas
        private _ctx: CanvasRenderingContext2D; // canvasの2Dコンテキス
        private _center: Point = new Point();  // スプライトの中心座標
        private _position: Point = new Point(); // 現在座標
        private _opacity: number = 1;

        constructor(width: number = 0, height: number = 0)
        {
            this._canvas = <HTMLCanvasElement>document.createElement("canvas");
            this._canvas.width = width;
            this._canvas.height = height;
            this._ctx = this._canvas.getContext("2d");

            //this.visible = false;
            this.onload = function () { };
        }

        public set visible(value: boolean)
        {
            if (value)
            {
                this._canvas.style.visibility = "visible";
            }
            else
            {
                this._canvas.style.visibility = "hidden";
            }
        }
        public get visible(): boolean
        {
            return this._canvas.style.visibility == "visible";
        }

        /// <summary>
        /// 透明度。
        /// </summary>
        public set opacity(value: number)
        {
            this._opacity = value;
        }
        public get opacity(): number
        {
            return this._opacity;
        }

        /// <summary>
        /// 幅。
        /// </summary>
        public set width(value: number)
        {
            this._canvas.width;
        }
        public get width(): number
        {
            return this._canvas.width;
        }

        /// <summary>
        /// 高さ。
        /// </summary>
        public set height(value: number)
        {
            this._canvas.height = value;
        }
        public get height(): number
        {
            return this._canvas.height;
        }

        /// <summary>
        /// 中心座標。
        /// </summary>
        public set center(value: Point)
        {
            this._center = value;
        }
        public get center(): Point
        {
            return this._center;
        }

        /// <summary>
        /// 座標。
        /// </summary>
        set position(value: Point)
        {
            this._position = value;
        }
        get position(): Point
        {
            return this._position;
        }

        /// <summary>
        /// 点との命中判定。
        /// </summary>
        /// <param name="pt">判定対象の座標。</param>
        /// <returns>true:当たっている false:当たっていない</returns>
        public isHit(pt: Point): boolean
        {
            var x: number = this._position.x;
            var y: number = this._position.y;
            if (pt.x >= (x - (this.width / 2)))
            {
                if (pt.x <= x + (this.width / 2))
                {
                    if (pt.y >= y - (this.height / 2))
                    {
                        if (pt.y <= y + (this.height / 2))
                        {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        public getPixel(x: number, y: number): number
        {
            var imgData: ImageData = this.Context.getImageData(x, y, 1, 1);
            var pixel: number = (imgData.data[0]<<24) | (imgData.data[1]<<16) | (imgData.data[2]<<8) | imgData.data[3];
            return pixel
        }

        public get Canvas(): HTMLCanvasElement
        {
            return this._canvas;
        }

        public get Context(): CanvasRenderingContext2D
        {
            return this._ctx;
        }

        /// <summary>
        /// 指定色で全体を塗りつぶす。
        /// </summary>
        public clear(color: Color = new Color(0, 0, 0, 0))
        {
            var imgData: ImageData = this.Context.createImageData(this.width, this.height);
            var pixels: Uint8ClampedArray = imgData.data;
            var len: number = imgData.data.length;
            var r: number = color.r;
            var g: number = color.g;
            var b: number = color.b;
            var a: number = color.a;
            for (var i: number = 0; i < len; i++)
            {
                pixels[i] = r;
                pixels[i+1] = g;
                pixels[i+2] = b;
                pixels[i+3] = a;
            }
            this.Context.putImageData(imgData, 0, 0);
        }

        public static fromImage(img: HTMLImageElement): SpriteImage
        {
            var spr: SpriteImage = new SpriteImage(img.width, img.height);
            spr._ctx.drawImage(img, 0, 0);
            return spr;
        }

        public static loadFile(url: string, ptCenter: Point = new Point(), onloadFunc: Function = null) 
        {
            var img: HTMLImageElement = new Image();
            img.src = url;
            img.onload = function ()
            {
                var spr: SpriteImage = SpriteImage.fromImage(img);
                spr.center = ptCenter;
                if( !isEmpty(onloadFunc) )
                {
                    onloadFunc(spr);
                }
            }
        }

        public draw(ctxDst: CanvasRenderingContext2D)
        {
            if (!this.visible || this._opacity==0)
            {
                return;
            } 

            ctxDst.globalAlpha = this._opacity;
            ctxDst.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height, this._position.x - this._center.x, this._position.y - this._center.y, this.width, this.height);
            ctxDst.globalAlpha = 1;
        }

        public onload: Function;
    }
} 