// <reference path="Scripts/typings/FileSaver/FileSaver.d.ts" />
// <reference path="Scripts/typings/html2canvas/html2canvas.d.ts" />

function isUndefined(value: any): boolean
{
    var undef;
    return value == undef;
}

function isNull(value: any): boolean
{
    return value == null;
}

function isEmpty(value: any): boolean
{
    return (isUndefined(value) || isNull(value));
}

function getDocumentUrl(): string
{
    var url: string = document.location.href.split("?")[0];
    return url;
}

function saveElementImage(elm: HTMLElement, fileName: string)
{
    html2canvas(elm).then(
        function (canvas: HTMLCanvasElement)
        {
            var imgType: string = "image/png";
            var url: string = canvas.toDataURL(imgType);

            // DataURL のデータ部分を抜き出し、Base64からバイナリに変換  
            var bin = atob(url.split(',')[1]);  

            // 空の Uint8Array ビューを作る  
            var buffer = new Uint8Array(bin.length);  

            // Uint8Array ビューに 1 バイトずつ値を埋める  
            for (var i = 0; i < bin.length; i++)
            {
                buffer[i] = bin.charCodeAt(i);
            }  

            // Uint8Array ビューのバッファーを抜き出し、それを元に Blob を作る  
            var blob = new Blob([buffer.buffer], { type: imgType });

            saveAs(blob, fileName);
        }
    );
}
