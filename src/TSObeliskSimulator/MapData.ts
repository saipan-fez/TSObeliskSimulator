module TSObeliskSimulator
{
    //マップデータ保持クラス
    export class MapData
    {
        // mapID
        private _mapID: string;
        get mapID(): string
        {
            return this._mapID;
        }
        set mapID(value: string)
        {
            this._mapID = value;
        }

        // map名
        private _mapName: string;
        get mapName(): string
        {
            return this._mapName;
        }
        set mapName(value: string)
        {
            this._mapName = value;
        }

        // 画像URL
        private _imageUrl: string;
        get imageUrl(): string
        {
            return this._imageUrl;
        }
        set imageUrl(value: string)
        {
            this._imageUrl = value;
        }

        // キープ設置可能距離
        private _keepSetDistance: number = ObeSimConst.DEF_KEEP_SET_DISTANCE;
        get keepSetDistance(): number
        {
            return this._keepSetDistance;
        }
        set keepSetDistance(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            this._keepSetDistance = value;
        }

        // キャッスル座標
        private _defCastlePosition: Array<Point> = new Array<Point>();
        get defCastlePosition(): Array<Point>
        {
            return this._defCastlePosition;
        }
        set defCastlePosition(value: Array<Point>)
        {
            this._defCastlePosition = value;
        }

        // クリスタル座標
        private _crystalPosition: Array<Point> = new Array<Point>();
        get crystalPosition(): Array<Point>
        {
            return this._crystalPosition;
        }
        set crystalPosition(value: Array<Point>)
        {
            this._crystalPosition = value;
        }
    }
}