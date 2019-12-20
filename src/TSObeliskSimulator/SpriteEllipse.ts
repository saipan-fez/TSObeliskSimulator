module TSObeliskSimulator
{
    /// <summary>
    /// スプライト円表示クラス。
    /// </summary>
    export class SpriteEllipse implements ISprite
    {
        private _width: number = 0;
        private _center: Point = new Point(0, 0);  // スプライトの中心座標
        private _position: Point = new Point(0, 0); // 現在座標
        private _opacity: number = 1;
        private _visible: boolean = false;
        private _strokeColor: Color = new Color(0xff, 0xff, 0xff);  // 線の色
        private _fill: boolean = false;  // 塗りつぶし
        private _lineWidth: number = 1;

        constructor(width: number = 0)
        {
            if (width > 0)
            {
                this._width = width;
            }
        }

        public set visible(value: boolean)
        {
            this._visible = value;
        }
        public get visible(): boolean
        {
            return this._visible;
        }

        public set strokeColor(value: Color)
        {
            this._strokeColor = value;
        }
        public get strokeColor(): Color
        {
            return this._strokeColor;
        }

        public set fill(value: boolean)
        {
            this._fill = value;
        }
        public get fill(): boolean
        {
            return this._fill;
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
            this._width = value;
        }
        public get width(): number
        {
            return this._width;
        }

        /// <summary>
        /// 高さ。
        /// </summary>
        public set height(value: number)
        {
            this.width = value;
        }
        public get height(): number
        {
            return this.width;
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
            var length: number = pt.distance(this._position);
            if (length <= (this._width / 2))
            {
                return true;
            }

            return false;
        }

        public draw(ctxDst: CanvasRenderingContext2D)
        {
            if (!this.visible || this._opacity == 0)
            {
                return;
            }

            ctxDst.globalAlpha = this._opacity;
            ctxDst.beginPath();
            ctxDst.lineWidth = this._lineWidth;
            ctxDst.arc(this._position.x, this._position.y, this._width / 2, 0, Math.PI * 2);
            if (this._fill)
            {
                ctxDst.fillStyle = this._strokeColor.toRGBAStyle();
                ctxDst.fill();
            }
            else
            {
                ctxDst.strokeStyle = this._strokeColor.toRGBAStyle();
                ctxDst.stroke();
            }
            ctxDst.globalAlpha = 1;
        }
    }
} 