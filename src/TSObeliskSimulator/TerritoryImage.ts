module TSObeliskSimulator
{
    /// <summary>
    /// 支配領域表示用Imageクラス。
    /// </summary>
    export class TerritoryImage extends SpriteImage
    {
        private _sprObelisk: SpriteImage;    // オベリスク用BMP
        private _sprEclipse: SpriteImage;    // エクリプス用BMP 
        private _territoryColor: Color;    // 支配領域の色

        /// <summary>
        /// コンストラクタ。
        /// </summary>
        /// <param name="owner">親となるオブジェクト。(Canvas、Gridなど)</param>
        /// <param name="territoryColor">支配領域の描画色。</param>
        constructor(territoryColor: Color)
        {
            super(256, 256);
            var _this = this;
            this._territoryColor = territoryColor;

            SpriteImage.loadFile("image/building/field_obelisk.png", new Point(0, 0), function (spr: SpriteImage)
            {
                var centerPos = Math.ceil(spr.width / 2);
                spr.center = new Point(centerPos, centerPos);
                spr.visible = true;
                _this._sprObelisk = spr;
                _this.setTerritoryColor(spr, _this._territoryColor);
            });
            SpriteImage.loadFile("image/building/field_eclipse.png", new Point(0, 0), function (spr: SpriteImage)
            {
                var centerPos = Math.ceil(spr.width / 2);
                spr.center = new Point(centerPos, centerPos);
                spr.visible = true;
                _this._sprEclipse = spr;
                _this.setTerritoryColor(spr, _this._territoryColor);
            });
        }

        private setTerritoryColor(spr: SpriteImage, color: Color)
        {
            var img: ImageData = spr.Context.getImageData(0, 0, spr.width, spr.height);
            var pixels: Uint8ClampedArray = img.data;
            var len: number = pixels.length;
            var r: number = color.r;
            var g: number = color.g;
            var b: number = color.b;
            for (var i = 0; i < len; i+=4)
            {
                if (pixels[i+3] != 0)
                {
                    pixels[i] = r;
                    pixels[i+1] = g;
                    pixels[i+2] = b;
                }
            }
            spr.Context.putImageData(img, 0, 0);
        }

        /// <summary>
        /// 指定座標が支配領域かどうかを判定する。
        /// </summary>
        /// <param name="pt">判定対象の座標。</param>
        /// <returns>true:支配領域である false:支配領域ではない</returns>
        public isTerritory(pt: Point): boolean
        {
            var x: number = pt.x;
            var y: number = pt.y;
            if (x < 0 || x > this.width || y < 0 || y > this.height)
            {
                return false;
            }

            var pixel: number = this.getPixel(pt.x, pt.y);
            if ( pixel!=0 )
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// 指定した座標に支配領域をセット。
        /// </summary>
        /// <param name="pt">座標。</param>
        /// <param name="fieldType">領域種別。</param>
        public setTerritory(pt: Point, territoryType: TerritoryType )
        {
            var spr: SpriteImage = this._sprObelisk;  
            switch (territoryType)
            {
                case TerritoryType.Castle:
                    break;
    
                case TerritoryType.Eclipse:
                    spr = this._sprEclipse;
                    break;
    
                case TerritoryType.Obelisk:
                    break;
            }
    
            spr.position = pt.clone();
            spr.draw(this.Context);
        }
 

        /// <summary>
        /// 支配率。
        /// </summary>
        get TerritoryPercent(): number
        {
            var areaAll = this.width * this.height;
            var areaTerritory = 0;
            var imgData: ImageData = this.Context.getImageData(0, 0, this.width, this.height);
            var pixels: Uint8ClampedArray = imgData.data;
            var len: number = pixels.length;
            for (var i: number = 0; i < len; i+=4)
            {
                if (pixels[i + 3] != 0)
                {
                    areaTerritory++;
                }
            }

            return areaTerritory / areaAll * 100.0;
        }
    }
}