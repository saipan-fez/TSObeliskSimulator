module TSObeliskSimulator
{
    //アプリ用定数
    export class ObeSimConst
    {
        public static MAX_OBELISK: number = 25;  // 最大オベリスク数
        public static MAX_ECLIPSE: number = 5;   // 最大エクリプス数
        public static MAX_ARROWTOWER: number = 10;  // 最大アロータワー数
        public static MAX_BULLWORK: number = 3;  // 最大ブルワーク数
        public static MAX_CRYSTAL: number = 10;  // クリスタル数
        public static DEF_KEEP_SET_DISTANCE: number = 128;   // キープ設置可能距離
        public static COLOR_ATK_TERRITORY: Color = Color.fromRGBInt(0xff7f00); // 攻撃側支配領域の色
        public static COLOR_DEF_TERRITORY: Color = Color.fromRGBInt(0x007fff); // 防衛側支配領域の色
        public static COLOR_KEEP_SET_DISTANCE: Color = Color.fromRGBInt(0xffffff); // キープ設置可能距離の円の色
        public static COLOR_CENTER_LINE: Color = Color.fromRGBInt(0x00ff00); // キープ設置可能距離の円の色
        public static COLOR_BUTTON_ON: string = "lemonchiffon"; // ボタンON時の色
        public static RANGE_CASTLE: number = 80;
        public static RANGE_OBELISK: number = 81;
        public static RANGE_ECLIPSE: number = 57;
        public static MAP_PATH: string = "mapdata/MapList.xml";
    }

    /// <summary>
    /// 設置する建築物種別。
    /// </summary>
    export enum BuildingConst
    {
        None = 0,   // 無選択
        AtkCastle,  // キープ
        AtkObelisk, // 攻撃側オベリスク
        AtkEclipse, // 攻撃側エクリプス
        AtkArrowTower, // 攻撃側アロータワー
        AtkGateOfHades, // 攻撃側ゲートオブハデス
        AtkWarCraft, // 攻撃側ウォークラフト
        AtkBullwork, // 攻撃側ブルワーク
        Crystal,    // クリスタル
        DefCastle,  // キャッスル
        DefObelisk, // 防衛側オベリスク
        DefEclipse, // 防衛側エクリプス
        DefArrowTower, // 防衛側アロータワー
        DefGateOfHades, // 防衛側ゲートオブハデス
        DefWarCraft, // 防衛側ウォークラフト
        DefBullwork, // 防衛側ブルワーク
        Delete, // 削除モード
        MAX = Delete,
    }

    /// <summary>
    /// 領域種別定数。
    /// </summary>
    export enum TerritoryType
    {
        Castle = 0, // キャッスル
        Obelisk = 1,    // オベリスク
        Eclipse = 2,    // エクリプス
    }
}