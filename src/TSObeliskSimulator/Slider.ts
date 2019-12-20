module TSObeliskSimulator
{
    export class Slider
    {
        private _instance: Slider;
        private _elmBody: HTMLElement;
        private _elmGage: HTMLElement;
        private _drugging: boolean = false;

        constructor(elm: HTMLElement)
        {
            var _this: Slider = this;
            this._elmBody = elm;

            this._elmGage = document.createElement("div");
            this._elmGage.className = "tso-slider-gage";
            this._elmGage.style.position = "absolute";
            this._elmGage.style.left = "0px";
            this._elmGage.style.top = "0px";
            $(this._elmGage).width(0);
            $(this._elmGage).height($(elm).height());
            elm.appendChild(this._elmGage);

            elm.onmousemove = function (ev: MouseEvent)
            {
                _this.onmousemove(ev);
            }
            elm.onmousedown = function (ev: MouseEvent)
            {
                _this.onmousedown(ev);
            }
            elm.onmouseup = function (ev: MouseEvent)
            {
            }
            var oldDocMouseUp: Function = document.onmouseup;
            document.onmouseup = function (ev: MouseEvent)
            {
                if (!isEmpty(oldDocMouseUp))
                {
                    oldDocMouseUp(ev);
                }
                _this.onmouseup(ev);
            }

            this.max = Number(elm.getAttribute("max"));
            this.min = Number(elm.getAttribute("min"));
            this.value = Number(elm.getAttribute("value"));
        }

        private getInstance()
        {
            return this._instance;
        }

        private _min: number = 0;
        public set min(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            this._min = value;
            this._elmBody.setAttribute("min", value.toString());
        }
        public get min(): number
        {
            return this._min;
        }

        private _max: number = 100;
        public set max(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            this._max = value;
            this._elmBody.setAttribute("max", value.toString());
        }
        public get max(): number
        {
            return this._max;
        }

        private _value: number;
        public set value(value: number)
        {
            if (isNaN(value))
            {
                return;
            }
            else if (value > this.max)
            {
                value = this.max;
            }
            else if (value < this.min)
            {
                value = this.min
            }

            this._value = Math.floor(value);
            this._elmBody.setAttribute("value", value.toString());
            this.setGage(value);
            this.onchange(value);
        }
        public get value(): number
        {
            return this._value;
        }

        private onmousemove(ev: MouseEvent)
        {
            var x: number = 0;
            x = Number(ev.offsetX);

            if (this._drugging)
            {
                var bodyWidth = $(this._elmBody).width();
                var value: number = this.min + ((this.max - this.min) * (x / bodyWidth));
                this.value = value;
            }
        }

        private onmouseup(ev: MouseEvent)
        {
            this._drugging = false;
        }

        private onmousedown(ev: MouseEvent)
        {
            this._drugging = true;
            this.onmousemove(ev);
        }

        private setGage(value: number)
        {
            var bodyWidth: number = $(this._elmBody).width();
            var valueWidth: number = this.max - this.min;
            var valuePos: number = (value - this.min) / valueWidth * bodyWidth
            $(this._elmGage).width(valuePos);
        }

        public onchange(value: number)
        {
        }
    }
}