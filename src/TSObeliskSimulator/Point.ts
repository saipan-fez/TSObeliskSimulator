//座標保持用クラス
class Point
{
    constructor(x: number = 0, y: number = 0)
    {
        this._x = x;
        this._y = y;
    }

    public clone(): Point
    {
        return new Point(this._x, this._y);
    }

    private _x: number = -1;
    get x(): number
    {
        return this._x;
    }
    set x(value: number)
    {
        if (isNaN(value))
        {
            return;
        }
        this._x = value;
    }

    private _y: number = -1;
    get y(): number
    {
        return this._y;
    }
    set y(value: number)
    {
        if (isNaN(value))
        {
            return;
        }
        this._y = value;
    }

    public distance(pt: Point) : number
    {
        return Point.calcDistance(this, pt);
    }

    public toHex(): string
    {
        var posInt: number = (this.x << 8) + this.y;
        return posInt.toString(16);
    }

    public static fromHex(hex: string): Point
    {
        var val: number = parseInt(hex, 16);
        var x: number = (val >> 8) & 0xff;
        var y: number = (val) & 0xff;
        return new Point(x, y);
    }

    public static calcDistance(pt1: Point, pt2: Point): number
    {
        var xDistance: number = Math.max(pt1.x, pt2.x) - Math.min(pt1.x, pt2.x);
        var yDistance: number = Math.max(pt1.y, pt2.y) - Math.min(pt1.y, pt2.y);
        var distance: number = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
        return distance;
    }
}
