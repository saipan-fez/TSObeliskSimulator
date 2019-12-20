module TSObeliskSimulator
{
    /// <summary>
    /// スプライト用インターフェース。
    /// </summary>
    export interface ISprite
    {
        visible: boolean;
        opacity: number;
        position: Point;
        isHit(pt: Point): boolean;
        draw(ctx: CanvasRenderingContext2D);
    }
} 