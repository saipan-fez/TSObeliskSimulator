module TSObeliskSimulator
{
    /// <summary>
    /// スプライト線表示クラス。
    /// </summary>
    export class SpriteLine implements ISprite
    {
        private _lineTo: Point = new Point();
        private _position: Point = new Point(); // 現在座標
        private _opacity: number = 1;
        private _visible: boolean = false;
        private _strokeColor: Color = new Color(0xff, 0xff, 0xff);  // 線の色
        private _lineWidth: number = 1;

        constructor(lineTo: Point = null)
        {
            if (!isNull(lineTo))
            {
                this._lineTo = lineTo;
            }
        }

        /// <summary>
        /// 線との命中判定。
        /// </summary>
        /// <param name="pt">判定対象の座標。</param>
        /// <returns>true:当たっている false:当たっていない</returns>
        public isHit(pt: Point): boolean
        {
            // 要らないのでまたの機会に考える
            return false;
        }

        public set lineTo(value: Point)
        {
            this._lineTo = value;
        }
        public get lineTo(): Point
        {
            return this._lineTo;
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

        public draw(ctxDst: CanvasRenderingContext2D)
        {
            if (!this.visible || this._opacity == 0)
            {
                return;
            }

            ctxDst.beginPath();
            ctxDst.globalAlpha = this._opacity;
            ctxDst.lineWidth = this._lineWidth;
            ctxDst.moveTo(this._position.x, this._position.y);
            ctxDst.lineTo(this._lineTo.x, this._lineTo.y);
            ctxDst.strokeStyle = this._strokeColor.toRGBAStyle();
            ctxDst.stroke();
            ctxDst.globalAlpha = 1;
        }
    }
} 