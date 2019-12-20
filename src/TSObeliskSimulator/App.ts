/// <reference path="Scripts/typings/jquery/jquery.d.ts" />

module TSObeliskSimulator
{
    export class App
    {
        private static _instance: App;  // シングルトン用インスタンス

        private _comboMap: HTMLSelectElement;
        private _canvasMap: HTMLCanvasElement;
        private _ctxMap: CanvasRenderingContext2D;
        private _panelLeft: HTMLElement;
        private _txtCursorPos: HTMLElement;
        private _txtKeepSetDistance: HTMLElement;
        private _txtCastleDistance: HTMLElement;
        private _txtReserved: HTMLElement;
        private _txtAtkTerritory: HTMLElement;
        private _txtDefTerritory: HTMLElement;
        private _txtURL: HTMLElement;
        private _sliderKeepSetDistance: Slider;
        private _arrayBtnBuild: Array<HTMLElement> = new Array<HTMLElement>();  // ボタンのElement配列
        private _btnSavePicture: HTMLElement;

        private _dicMapData: collections.Dictionary<string, MapData> = new collections.Dictionary<string, MapData>();   // XMLから読み込んだMAPデータのDictionary
        private _sprMap: SpriteImage = new SpriteImage();   //MAP用スプライト
        private _atkCastle: SpriteImage = new SpriteImage(); // キープ用スプライト
        private _defCastle: SpriteImage = new SpriteImage(); // キャッスル用スプライト
        private _ellipseKeepSetDistance: SpriteEllipse = new SpriteEllipse();  // キープ設置可能距離の円
        private _ellipseTerritoryRange: SpriteEllipse = new SpriteEllipse();  // 建築物で確保可能な領域の円
        private _atkObelisk: Array<SpriteImage> = new Array<SpriteImage>();    // 攻撃側オベリスク用スプライト
        private _defObelisk: Array<SpriteImage> = new Array<SpriteImage>();    // 防衛側オベリスク用スプライト
        private _atkEclipse: Array<SpriteImage> = new Array<SpriteImage>();    // 攻撃側エクリプス用スプライト
        private _defEclipse: Array<SpriteImage> = new Array<SpriteImage>();    // 防衛側エクリプス用スプライト
        private _atkArrowTower: Array<SpriteImage> = new Array<SpriteImage>();    // 攻撃側アロータワー用スプライト
        private _defArrowTower: Array<SpriteImage> = new Array<SpriteImage>();    // 防衛側アロータワー用スプライト
        private _atkGateOfHades: SpriteImage; // 攻撃側ゲートオブハデス用スプライト
        private _defGateOfHades: SpriteImage; // 防衛側ゲートオブハデス用スプライト
        private _atkWarCraft: SpriteImage; // 攻撃側ウォークラフト用スプライト
        private _defWarCraft: SpriteImage; // 防衛側ウォークラフト用スプライト
        private _atkBullwork: Array<SpriteImage> = new Array<SpriteImage>();    // 攻撃側ブルワーク用スプライト
        private _defBullwork: Array<SpriteImage> = new Array<SpriteImage>();    // 防衛側ブルワーク用スプライト
        private _crystal: Array<SpriteImage> = new Array<SpriteImage>();   // クリスタル用スプライト
        private _sprCursor: SpriteImage = new SpriteImage(); // カーソル用スプライト

        private _renderSprites: Array<ISprite> = new Array<ISprite>();

        private _defField: TerritoryImage = new TerritoryImage(ObeSimConst.COLOR_DEF_TERRITORY);    // 防衛側領域描画用フィールド画像
        private _atkField: TerritoryImage = new TerritoryImage(ObeSimConst.COLOR_ATK_TERRITORY);    // 攻撃側領域描画用フィールド画像
        private _centerLine: SpriteLine = new SpriteLine();    //キープ間中心線
        private _selectedBuilding: BuildingConst = BuildingConst.None;   // 現在選択中の建築物

        private _param: collections.Dictionary<string, string> = new collections.Dictionary<string, string>(); // URLから渡されたパラメータ
        private _currentMapData: MapData = null;    // 選択中のMAPデータ
        private _keepSetDistance: number = 128;

        constructor()
        {
            App._instance = this;
            this._param = this.getUrlParameter();
            this._sprMap.visible = true;
        }

        public static getInstance()
        {
            return App._instance;
        }

        public run()
        {
            var app = App.getInstance();

            // コントロールを変数に記憶し、イベントをセットする
            app._panelLeft = document.getElementById("PanelLeft");
            app._comboMap = <HTMLSelectElement>document.getElementById("ComboMap");
            app._comboMap.onchange = app.onComboMap_Change;
            app._canvasMap = <HTMLCanvasElement>document.getElementById("CanvasMap");
            app._canvasMap.width = 256;
            app._canvasMap.height = 256;
            app._ctxMap = app._canvasMap.getContext("2d");
            app._canvasMap.onmousemove = app.onCanvasMap_MouseMove;
            app._canvasMap.onmouseenter = app.onCanvasMap_MouseEnter;
            app._canvasMap.onmouseleave = app.onCanvasMap_MouseLeave;
            app._canvasMap.onclick = app.onCanvasMap_MouseLeftDown;
            app._txtCursorPos = document.getElementById("TextCursorPos");
            app._txtCastleDistance = document.getElementById("TextCastleDistance");
            app._txtKeepSetDistance = document.getElementById("TextKeepSetDistance");
            app._txtCursorPos = document.getElementById("TextCursorPos");
            app._txtReserved = document.getElementById("TextReserved");
            app._txtAtkTerritory = document.getElementById("TextAtkTerritory");
            app._txtDefTerritory = document.getElementById("TextDefTerritory");
            app._txtURL = document.getElementById("TextURL");
            app._sliderKeepSetDistance = new Slider(document.getElementById("SliderKeepSetDistance"));
            app._sliderKeepSetDistance.onchange = function (value: number)
            {
                app._keepSetDistance = Math.floor(value);
                app.updateCastleDistance();
                app.updateSimURL();
                app.updateCanvas();
            }

            for (var i: number = 1; i <= 16; i++)
            {
                var elmBtn = document.getElementById("ButtonBuild" + i);
                elmBtn.onclick = app.onButtonBuildClick;
                app._arrayBtnBuild.push(elmBtn);
            }
            app._btnSavePicture = document.getElementById("ButtonSavePicture");
            app._btnSavePicture.onclick = function ()
            {
                saveElementImage(app._panelLeft, "オベシミュ結果.png");
            }

            // 支配領域イメージ作成
            app._atkField.visible = true;
            app._atkField.opacity = 0.5;
            app._defField.visible = true;
            app._defField.opacity = 0.5;
            app._renderSprites.push(app._atkField);
            app._renderSprites.push(app._defField);

            // キープ設置可能距離Ellipse作成
            app._ellipseKeepSetDistance.width = ObeSimConst.DEF_KEEP_SET_DISTANCE;
            app._ellipseKeepSetDistance.opacity = 0.5;
            app._ellipseKeepSetDistance.strokeColor = ObeSimConst.COLOR_KEEP_SET_DISTANCE;
            app._renderSprites.push(app._ellipseKeepSetDistance);

            // オベリスク用スプライト作成
            var ptObeliskCenter: Point = new Point(4, 4);
            app.addSpriteArrayFromFile(app._atkObelisk, "image/building/atk_obelisk.png", ptObeliskCenter, ObeSimConst.MAX_OBELISK);
            app.addSpriteArrayFromFile(app._defObelisk, "image/building/def_obelisk.png", ptObeliskCenter, ObeSimConst.MAX_OBELISK);

            // エクリプス用スプライト作成
            var ptEclipseCenter: Point = new Point(4, 4);
            app.addSpriteArrayFromFile(app._atkEclipse, "image/building/atk_eclipse.png", ptEclipseCenter, ObeSimConst.MAX_ECLIPSE);
            app.addSpriteArrayFromFile(app._defEclipse, "image/building/def_eclipse.png", ptEclipseCenter, ObeSimConst.MAX_ECLIPSE);

            // アロータワー用スプライト作成
            var ptArrowTowerCenter: Point = new Point(4, 4);
            app.addSpriteArrayFromFile(app._atkArrowTower, "image/building/atk_arrowtower.png", ptArrowTowerCenter, ObeSimConst.MAX_ARROWTOWER);
            app.addSpriteArrayFromFile(app._defArrowTower, "image/building/def_arrowtower.png", ptArrowTowerCenter, ObeSimConst.MAX_ARROWTOWER);

            // クリスタル用スプライト作成
            var ptCrystalCenter: Point = new Point(3, 3);
            app.addSpriteArrayFromFile(app._crystal, "image/building/crystal.png", ptCrystalCenter, ObeSimConst.MAX_CRYSTAL);

            // キープ、キャッスル用スプライト作成
            var ptCastleCenter: Point = new Point(4, 4);
            SpriteImage.loadFile("image/building/atk_castle.png", ptCastleCenter, function (spr: SpriteImage)
            {
                app._atkCastle = spr;
                app._renderSprites.push(spr);
            });
            SpriteImage.loadFile("image/building/def_castle.png", ptCastleCenter, function (spr: SpriteImage)
            {
                app._defCastle = spr;
                app._renderSprites.push(spr);
            });
       
            // ゲートオブハデス用スプライト作成
            var ptGateOfHadesCenter: Point = new Point(4, 4);
            SpriteImage.loadFile("image/building/atk_gateofhades.png", ptGateOfHadesCenter, function (spr: SpriteImage)
            {
                app._atkGateOfHades = spr;
                app._renderSprites.push(spr);
            });
            SpriteImage.loadFile("image/building/def_gateofhades.png", ptGateOfHadesCenter, function (spr: SpriteImage)
            {
                app._defGateOfHades = spr;
                app._renderSprites.push(spr);
            });

            // ウォークラフト用スプライト作成
            var ptWarCraftCenter: Point = new Point(4, 4);
            SpriteImage.loadFile("image/building/atk_warcraft.png", ptWarCraftCenter, function (spr: SpriteImage)
            {
                app._atkWarCraft = spr;
                app._renderSprites.push(spr);
            });
            SpriteImage.loadFile("image/building/def_warcraft.png", ptWarCraftCenter, function (spr: SpriteImage)
            {
                app._defWarCraft = spr;
                app._renderSprites.push(spr);
            });
            
            // ブルワーク用スプライト作成
            var ptBullworkCenter: Point = new Point(4, 4);
            app.addSpriteArrayFromFile(app._atkBullwork, "image/building/atk_bullwork.png", ptBullworkCenter, ObeSimConst.MAX_BULLWORK);
            app.addSpriteArrayFromFile(app._defBullwork, "image/building/def_bullwork.png", ptBullworkCenter, ObeSimConst.MAX_BULLWORK);

            // MAP用カーソル作成
            var ptCursor: Point = new Point(7, 7);
            SpriteImage.loadFile("image/cursor/cursor_cross.png", ptCursor, function (spr: SpriteImage) {
                spr.visible = true;
                app._sprCursor = spr;

                // 中心線作成
                app._centerLine.strokeColor = ObeSimConst.COLOR_CENTER_LINE;
                app._centerLine.opacity = 0.5;
                app._renderSprites.push(app._centerLine);

                // 領域範囲Ellipse作成
                app._renderSprites.push(app._ellipseTerritoryRange);

                app._renderSprites.push(spr);
            });

            // MAPXML読み込み
            var dic: collections.Dictionary<string, string> = app.getUrlParameter();
            app.loadMapDataFromXml();

            //app.updateCanvas();
        }

        /// <summary>
        /// URLパラメータを取得する。
        /// </summary>
        private getUrlParameter()
        {
            var dic: collections.Dictionary<string, string> = new collections.Dictionary<string, string>();
            var params: string[] = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i: number = 0; i < params.length; i++)
            {
                var keyval: string[] = params[i].split('=');
                dic.setValue(keyval[0], keyval[1]);
            }
            return dic;
        }

        private loadMapDataFromXml()
        {
            $.ajax({
                url: ObeSimConst.MAP_PATH,
                type: "get",
                dataType: "xml",
                timeout: 1000,
                success: this.parseMapData
            });
        }

        private parseMapData(xml: XMLDocument, status: string, jqXHR: JQueryXHR)
        {
            var app: App = App.getInstance();
            var arrayMap: JQuery = $(xml).find("Map");
            var mapList: collections.Dictionary<string, MapData> = app._dicMapData;
            var combo: HTMLSelectElement = app._comboMap;

            $(arrayMap).each(function ()
            {
                var val: JQuery = $(this);
                var mapData = new MapData();
                mapData.mapName = val.attr("Name");
                mapData.mapID = val.attr("MapID");
                mapData.imageUrl = val.attr("ImageUrl");
                mapData.keepSetDistance = Number(val.attr("KeepSetDistance"));
                var defCastle: JQuery = val.find("DefCastle");
                if (!isUndefined(defCastle))
                {
                    var arrayPos: JQuery = $(defCastle).find("Position");
                    $(arrayPos).each(function ()
                    {
                        var val = $(this);
                        var pos = new Point(Number(val.attr("X")), Number(val.attr("Y")));
                        if (pos.x >= 0 && pos.x <= 255 && pos.y >= 0 && pos.y <= 255)
                        {
                            mapData.defCastlePosition.push(pos);
                        }
                    });
                }
                var crystals: JQuery = val.find("Crystal");
                if (!isUndefined(crystals))
                {
                    var arrayPos: JQuery = $(crystals).find("Position");
                    $(arrayPos).each(function ()
                    {
                        var val = $(this);
                        var pos = new Point(Number(val.attr("X")), Number(val.attr("Y")));
                        if (pos.x >= 0 && pos.x <= 255 && pos.y >= 0 && pos.y <= 255)
                        {
                            mapData.crystalPosition.push(pos);
                        }
                    });
                }

                var dispMapName: string = mapData.mapID.replace("M", "") + ":" + mapData.mapName;
                mapList.setValue(mapData.mapID, mapData);
                var opt = <HTMLOptionElement>document.createElement("option");
                opt.innerText = dispMapName;
                opt.value = mapData.mapID;
                combo.appendChild(opt);
            });

            if (app._param.size() > 0)
            {
                app.setMapFromParams();
            }
        }

        /// <summary>
        /// URL引数からマップデータを配置する。
        /// </summary>
        private setMapFromParams()
        {
            var app: App = App.getInstance();
            var param: collections.Dictionary<string, string> = app._param;
            var comboMap: HTMLSelectElement = app._comboMap;

            // "mapid" 引数がある場合は、初期MAP設定
            if (param.containsKey("mapid"))
            {
                var mapID: string = "M" + param.getValue("mapid");
                for (var i: number = 0; i < comboMap.childNodes.length; i++)
                {
                    var item: HTMLOptionElement = <HTMLOptionElement>comboMap.childNodes.item(i);
                    var value: string = item.value;
                    if ( value==mapID )
                    {
                        comboMap.selectedIndex = i;
                        app.loadMap(value, true);
                        break;
                    }
                }
            }
        }

        private setObjectFromParam()
        {
            var app: App = App.getInstance();
            var param: collections.Dictionary<string, string> = app._param;

            // "act" 引数がある場合は、キープ位置設定
            if (param.containsKey("act"))
            {
                app.spritePositionFromString([app._atkCastle], param.getValue("act"));
            }

            // "ksg" 引数がある場合は、キープ設置可能距離設定
            if (param.containsKey("ksd"))
            {
                var distance: number = parseInt(param.getValue("ksd"), 16);
                if (distance < app._sliderKeepSetDistance.min || distance > app._sliderKeepSetDistance.max)
                {
                    distance = ObeSimConst.DEF_KEEP_SET_DISTANCE;
                }
                app._sliderKeepSetDistance.value = distance;
                app._keepSetDistance = distance;
            }
            
            // "dct" 引数がある場合は、キャッスル位置設定
            if (param.containsKey("dct"))
            {
                app.spritePositionFromString([app._defCastle], param.getValue("dct"));

                var keepSetDistance: number = Number(app._txtKeepSetDistance.innerHTML);
                app._ellipseKeepSetDistance.position = app._defCastle.position;
                app._ellipseKeepSetDistance.width = keepSetDistance * 2 + 1;
                app._ellipseKeepSetDistance.visible = true;

            }

            // "cry" 引数がある場合は、クリ位置設定
            if (param.containsKey("cry"))
            {
                app.spritePositionFromString(app._crystal, param.getValue("cry"));
            }

            // "aob" 引数がある場合は、攻撃側オベ位置設定
            if (param.containsKey("aob"))
            {
                app.spritePositionFromString(app._atkObelisk, param.getValue("aob"));
            }

            // "dob" 引数がある場合は、攻撃側オベ位置設定
            if (param.containsKey("dob"))
            {
                app.spritePositionFromString(app._defObelisk, param.getValue("dob"));
            }

            // "aec" 引数がある場合は、攻撃側エクリ位置設定
            if (param.containsKey("aec"))
            {
                app.spritePositionFromString(app._atkEclipse, param.getValue("aec"));
            }

            // "dec" 引数がある場合は、防衛側エクリ位置設定
            if (param.containsKey("dec"))
            {
                app.spritePositionFromString(app._defEclipse, param.getValue("dec"));
            }

            // "aat" 引数がある場合は、攻撃側ブルワーク位置設定
            if (param.containsKey("aat"))
            {
                app.spritePositionFromString(app._atkArrowTower, param.getValue("aat"));
            }

            // "dat" 引数がある場合は、防衛側ブルワーク位置設定
            if (param.containsKey("dat"))
            {
                app.spritePositionFromString(app._defArrowTower, param.getValue("dat"));
            }

            // "abw" 引数がある場合は、攻撃側ブルワーク位置設定
            if (param.containsKey("abw"))
            {
                app.spritePositionFromString(app._atkBullwork, param.getValue("abw"));
            }

            // "dbw" 引数がある場合は、防衛側ブルワーク位置設定
            if (param.containsKey("dbw"))
            {
                app.spritePositionFromString(app._defBullwork, param.getValue("dbw"));
            }

            // "agh" 引数がある場合は、攻撃側ゲートオブハデス位置設定
            if (param.containsKey("agh"))
            {
                app.spritePositionFromString([app._atkGateOfHades], param.getValue("agh"));
            }

            // "dgh" 引数がある場合は、防衛側ゲートオブハデス位置設定
            app._defGateOfHades.visible = false;
            if (param.containsKey("dgh"))
            {
                app.spritePositionFromString([app._defGateOfHades], param.getValue("dgh"));
            }

            // "awc" 引数がある場合は、攻撃側ウォークラフト位置設定
            app._atkWarCraft.visible = false;
            if (param.containsKey("awc"))
            {
                app.spritePositionFromString([app._atkWarCraft], param.getValue("awc"));
            }

            // "dwc" 引数がある場合は、防衛側ウォークラフト位置設定
            app._defWarCraft.visible = false;
            if (param.containsKey("dwc"))
            {
                app.spritePositionFromString([app._defWarCraft], param.getValue("dwc"));
            }
        }

        /// <summary>
        /// 全オブジェクトを非表示にする
        /// </summary>
        private resetVisible()
        {
            var app: App = App.getInstance();
            app._defCastle.visible = false
            app._atkCastle.visible = false
            for (var i: number = 0; i < ObeSimConst.MAX_CRYSTAL; i++)
            {
                app._crystal[i].visible = false
            }
            for (var i: number = 0; i < ObeSimConst.MAX_OBELISK; i++)
            {
                app._atkObelisk[i].visible = false
                app._defObelisk[i].visible = false
            }
            for (var i: number = 0; i < ObeSimConst.MAX_ECLIPSE; i++)
            {
                app._atkEclipse[i].visible = false
                app._defEclipse[i].visible = false
            }
            for (var i: number = 0; i < ObeSimConst.MAX_ARROWTOWER; i++)
            {
                app._atkArrowTower[i].visible = false
                app._defArrowTower[i].visible = false
            }
            for (var i: number = 0; i < ObeSimConst.MAX_BULLWORK; i++)
            {
                app._atkBullwork[i].visible = false
                app._defBullwork[i].visible = false
            }
            app._atkGateOfHades.visible = false
            app._defGateOfHades.visible = false
            app._atkWarCraft.visible = false
            app._defWarCraft.visible = false
            app._sprCursor.visible = false;
        }


        /// <summary>
        /// MAPを読み込む。
        /// </summary>
        /// <param name="mapID">マップID。</param>
        private loadMap(mapID: string, paramRelocate: boolean)
        {
            var app: App = App.getInstance();
            var map: MapData = app._dicMapData.getValue(mapID);

            // MapIDをキーにしてMAPデータを取得し、マップ画像、オブジェクト位置、キープ設置距離を初期化。
            SpriteImage.loadFile(map.imageUrl, new Point(), function (sprMap: SpriteImage)
            {
                app.resetVisible();

                // 通常のキープ設置可能距離
                app._sliderKeepSetDistance.value = ObeSimConst.DEF_KEEP_SET_DISTANCE;

                sprMap.visible = true;
                app._sprMap = sprMap;

                // キャッスル位置設定
                if (map.defCastlePosition.length > 0)
                {
                    app._defCastle.position = map.defCastlePosition[0];
                    app._defCastle.visible = true;
                }

                // クリスタル位置設定
                if (map.crystalPosition.length > 0)
                {
                    var count: number = Math.min(ObeSimConst.MAX_CRYSTAL, map.crystalPosition.length);
                    for (var i: number = 0; i < count; i++)
                    {
                        app._crystal[i].visible = true;
                        app._crystal[i].position = map.crystalPosition[i];
                    }
                }

                // 選択されたMAPデータを記憶
                app._currentMapData = map;

                if (paramRelocate)
                {
                    app.setObjectFromParam();
                }

                // キープ設置可能距離設定
                app._keepSetDistance = map.keepSetDistance;
                app._sliderKeepSetDistance.value = map.keepSetDistance;

                // 支配領域更、キャッスル距離、シミュレーション結果URL更新
                app.updateAtkTerritoryInfo();
                app.updateDefTerritoryInfo();
                app.updateCastleDistance();
                app.updateSimURL();
                app.updateCanvas();
            });
        }

        /// <summary>
        /// 建築物を指定座標へ配置する。
        /// </summary>
        /// <param name="pt">建築物を配置する座標。</param>
        /// <returns>true:成功 false:失敗</returns>
        private setBuilding()
        {
            var app: App = App.getInstance();
            if (app._currentMapData == null)
            {
                return false;
            }

            var delTarget: SpriteImage = null;
            var mapPt: Point = app._sprCursor.position.clone();
            var updateAtk: boolean = false;
            var updateDef: boolean = false;

            // 建築物の種別に応じて、各建築物設置処理へ分岐
            switch (app._selectedBuilding)
            {
                case BuildingConst.AtkCastle: // キープ
                    if (app._atkCastle.visible == false)
                    {
                        if (app._defCastle.visible == true)
                        {
                            var distance: number = mapPt.distance(app._defCastle.position);
                            if (distance < app._sliderKeepSetDistance.value)
                            {
                                break;
                            }
                        }

                        app._atkCastle.visible = true;
                        app._atkCastle.position = mapPt;
                        app._atkField.setTerritory(mapPt, TerritoryType.Castle);
                        updateAtk = true;
                        break;
                    }
                    break;

                case BuildingConst.DefCastle:   // キャッスル
                    if (app._defCastle.visible == false)
                    {
                        app._defCastle.visible = true;
                        app._defCastle.position = mapPt;
                        app._defField.setTerritory(mapPt, TerritoryType.Castle);
                        updateDef = true;
                        break;
                    }
                    break;

                case BuildingConst.AtkObelisk:  // 攻撃側オベリスク
                    if (!app._atkField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_OBELISK; i++)
                    {
                        if (app._atkObelisk[i].visible == false)
                        {
                            app._atkObelisk[i].visible = true;
                            app._atkObelisk[i].position = mapPt;
                            updateAtk = true;
                            break;
                        }
                    }
                    break;

                case BuildingConst.DefObelisk:  // 防衛側オベリスク
                    if (!app._defField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_OBELISK; i++)
                    {
                        if (app._defObelisk[i].visible == false)
                        {
                            app._defObelisk[i].visible = true;
                            app._defObelisk[i].position = mapPt;
                            updateDef = true;
                            break;
                        }
                    }
                    break;

                case BuildingConst.AtkEclipse:  // 攻撃側エクリプス
                    if (!app._atkField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_ECLIPSE; i++)
                    {
                        if (app._atkEclipse[i].visible == false)
                        {
                            app._atkEclipse[i].visible = true;
                            app._atkEclipse[i].position = mapPt;
                            updateAtk = true;
                            break;
                        }
                    }
                    break;

                case BuildingConst.DefEclipse:  // 防衛側エクリプス
                    if (!app._defField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_ECLIPSE; i++)
                    {
                        if (app._defEclipse[i].visible == false)
                        {
                            app._defEclipse[i].visible = true;
                            app._defEclipse[i].position = mapPt;
                            updateDef = true;
                            break;
                        }
                    }
                    break;

                case BuildingConst.AtkArrowTower:  // 攻撃側アロータワー
                    if (!app._atkField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_ARROWTOWER; i++)
                    {
                        if (app._atkArrowTower[i].visible == false)
                        {
                            app._atkArrowTower[i].visible = true;
                            app._atkArrowTower[i].position = mapPt;
                            break;
                        }
                    }
                    break;

                case BuildingConst.DefArrowTower:  // 防衛側アロータワー
                    if (!app._defField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_ARROWTOWER; i++)
                    {
                        if (app._defArrowTower[i].visible == false)
                        {
                            app._defArrowTower[i].visible = true;
                            app._defArrowTower[i].position = mapPt;
                            break;
                        }
                    }
                    break;

                case BuildingConst.AtkGateOfHades: // 攻撃側ゲートオブハデス
                    if (!app._atkField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    if (app._atkGateOfHades.visible == false)
                    {
                        app._atkGateOfHades.visible = true;
                        app._atkGateOfHades.position = mapPt;
                        break;
                    }
                    break;

                case BuildingConst.DefGateOfHades:   // 防衛側ゲートオブハデス
                    if (!app._defField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    if (app._defGateOfHades.visible == false)
                    {
                        app._defGateOfHades.visible = true;
                        app._defGateOfHades.position = mapPt;
                        break;
                    }
                    break;

                case BuildingConst.AtkWarCraft: // 攻撃側ウォークラフト
                    if (!app._atkField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    if (app._atkWarCraft.visible == false)
                    {
                        app._atkWarCraft.visible = true;
                        app._atkWarCraft.position = mapPt;
                        break;
                    }
                    break;

                case BuildingConst.DefWarCraft:   // 防衛側ウォークラフト
                    if (!app._defField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    if (app._defWarCraft.visible == false)
                    {
                        app._defWarCraft.visible = true;
                        app._defWarCraft.position = mapPt;
                        break;
                    }
                    break;

                case BuildingConst.AtkBullwork:  // 攻撃側ブルワーク
                    if (!app._atkField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_BULLWORK; i++)
                    {
                        if (app._atkBullwork[i].visible == false)
                        {
                            app._atkBullwork[i].visible = true;
                            app._atkBullwork[i].position = mapPt;
                            break;
                        }
                    }
                    break;

                case BuildingConst.DefBullwork:  // 防衛側ブルワーク
                    if (!app._defField.isTerritory(mapPt))
                    {
                        return false;
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_BULLWORK; i++)
                    {
                        if (app._defBullwork[i].visible == false)
                        {
                            app._defBullwork[i].visible = true;
                            app._defBullwork[i].position = mapPt;
                            break;
                        }
                    }
                    break;

                case BuildingConst.Crystal: // クリスタル
                    for (var i: number = 0; i < ObeSimConst.MAX_CRYSTAL; i++)
                    {
                        if (app._crystal[i].visible == false)
                        {
                            app._crystal[i].visible = true;
                            app._crystal[i].position = mapPt;
                            break;
                        }
                    }
                    break;

                case BuildingConst.Delete:  // 建築物削除
                    for (var i: number = 0; i < ObeSimConst.MAX_OBELISK; i++)
                    {
                        if (app._atkObelisk[i].visible == true)
                        {
                            if (app._atkObelisk[i].isHit(mapPt))
                            {
                                delTarget = app._atkObelisk[i];
                                updateAtk = true;
                                break;
                            }
                        }
                        if (app._defObelisk[i].visible == true)
                        {
                            if (app._defObelisk[i].isHit(mapPt))
                            {
                                delTarget = app._defObelisk[i];
                                updateDef = true;
                                break;
                            }
                        }
                    }
                    for (var i: number = 0; i < ObeSimConst.MAX_ECLIPSE; i++)
                    {
                        if (app._atkEclipse[i].visible == true)
                        {
                            if (app._atkEclipse[i].isHit(mapPt))
                            {
                                delTarget = app._atkEclipse[i];
                                updateAtk = true;
                                break;
                            }
                        }
                        if (app._defEclipse[i].visible == true)
                        {
                            if (app._defEclipse[i].isHit(mapPt))
                            {
                                delTarget = app._defEclipse[i];
                                updateDef = true;
                                break;
                            }
                        }
                    }
                    for (var i: number = 0; i < ObeSimConst.MAX_ARROWTOWER; i++)
                    {
                        if (app._atkArrowTower[i].visible == true)
                        {
                            if (app._atkArrowTower[i].isHit(mapPt))
                            {
                                delTarget = app._atkArrowTower[i];
                                break;
                            }
                        }
                        if (app._defArrowTower[i].visible == true)
                        {
                            if (app._defArrowTower[i].isHit(mapPt))
                            {
                                delTarget = app._defArrowTower[i];
                                break;
                            }
                        }
                    }
                    for (var i: number = 0; i < ObeSimConst.MAX_BULLWORK; i++)
                    {
                        if (app._atkBullwork[i].visible == true)
                        {
                            if (app._atkBullwork[i].isHit(mapPt))
                            {
                                delTarget = app._atkBullwork[i];
                                break;
                            }
                        }
                        if (app._defBullwork[i].visible == true)
                        {
                            if (app._defBullwork[i].isHit(mapPt))
                            {
                                delTarget = app._defBullwork[i];
                                break;
                            }
                        }
                    }

                    if (app._atkGateOfHades.visible == true)
                    {
                        if (app._atkGateOfHades.isHit(mapPt))
                        {
                            delTarget = app._atkGateOfHades;
                            break;
                        }
                    }

                    if (app._defGateOfHades.visible == true)
                    {
                        if (app._defGateOfHades.isHit(mapPt))
                        {
                            delTarget = app._defGateOfHades;
                            break;
                        }
                    }

                    if (app._atkWarCraft.visible == true)
                    {
                        if (app._atkWarCraft.isHit(mapPt))
                        {
                            delTarget = app._atkWarCraft;
                            break;
                        }
                    }

                    if (app._defWarCraft.visible == true)
                    {
                        if (app._defWarCraft.isHit(mapPt))
                        {
                            delTarget = app._defWarCraft;
                            break;
                        }
                    }

                    if (app._atkCastle.visible == true)
                    {
                        if (app._atkCastle.isHit(mapPt))
                        {
                            delTarget = app._atkCastle;
                            updateAtk = true;
                            break;
                        }
                    }

                    if (app._defCastle.visible == true)
                    {
                        if (app._defCastle.isHit(mapPt))
                        {
                            delTarget = app._defCastle;
                            break;
                        }
                    }

                    for (var i: number = 0; i < ObeSimConst.MAX_CRYSTAL; i++)
                    {
                        if (app._crystal[i].visible == true)
                        {
                            if (app._crystal[i].isHit(mapPt))
                            {
                                delTarget = app._crystal[i];
                                break;
                            }
                        }
                    }
                    break;

                default:
                    return false;
            }

            // 削除対象があれば消す
            if (delTarget != null)
            {
                delTarget.visible = false;
            }

            // 支配領域、キャッスル距離、シミュレーション結果URL更新
            if (updateAtk)
            {
                app.updateAtkTerritoryInfo();
            }
            if (updateDef)
            {
                app.updateDefTerritoryInfo();
            }
            app.updateCastleDistance();
            app.updateSimURL();
            app.updateCanvas();
            return true;
        }

        /// <summary>
        /// 攻撃側の領域表示を更新する。
        /// </summary>
        private updateAtkTerritoryInfo()
        {
            var app: App = App.getInstance();
            app._atkField.clear();

            if (app._atkCastle.visible== true)
            {
                app._atkField.setTerritory(app._atkCastle.position, TerritoryType.Castle);
            }
            for (var i: number = 0; i < ObeSimConst.MAX_OBELISK; i++)
            {
                if (app._atkObelisk[i].visible== true)
                {
                    app._atkField.setTerritory(app._atkObelisk[i].position, TerritoryType.Obelisk);
                }
            }
            for (var i: number = 0; i < ObeSimConst.MAX_ECLIPSE; i++)
            {
                if (app._atkEclipse[i].visible== true)
                {
                    app._atkField.setTerritory(app._atkEclipse[i].position, TerritoryType.Eclipse);
                }
            }
            app._txtAtkTerritory.innerHTML = "攻撃支配率 " + app._atkField.TerritoryPercent.toFixed(2) + "%";
        }

        /// <summary>
        /// 防衛側の領域表示を更新する。
        /// </summary>
        private updateDefTerritoryInfo()
        {
            var app: App = App.getInstance();
            app._defField.clear();

            if (app._defCastle.visible== true)
            {
                app._defField.setTerritory(app._defCastle.position, TerritoryType.Castle);
            }
            for (var i: number = 0; i < ObeSimConst.MAX_OBELISK; i++)
            {
                if (app._defObelisk[i].visible== true)
                {
                    app._defField.setTerritory(app._defObelisk[i].position, TerritoryType.Obelisk);
                }
            }
            for (var i: number = 0; i < ObeSimConst.MAX_ECLIPSE; i++)
            {
                if (app._defEclipse[i].visible== true)
                {
                    app._defField.setTerritory(app._defEclipse[i].position, TerritoryType.Eclipse);
                }
            }
            app._txtDefTerritory.innerHTML = "防衛支配率 " + app._defField.TerritoryPercent.toFixed(2) + "%";
        }

        private onComboMap_Change(ev: Event)
        {
            var app: App = App.getInstance();
            var combo: HTMLSelectElement = app._comboMap;
            var idx: number = combo.selectedIndex;
            var opt: HTMLOptionElement = <HTMLOptionElement>combo.childNodes.item(idx);
            app.loadMap(opt.value, false);
        }

        private onCanvasMap_MouseEnter(ev: MouseEvent)
        {
            var app: App = App.getInstance();
            app.onCanvasMap_MouseMove(ev);
        }

        private onCanvasMap_MouseLeave(ev: MouseEvent)
        {
            var app: App = App.getInstance();
            app._sprCursor.visible = false;
            app.updateCanvas();
        }

        private onCanvasMap_MouseMove(ev: MouseEvent)
        {
            var app: App = App.getInstance();
            var x: number = Math.floor(ev.offsetX / 2);
            var y: number = Math.floor(ev.offsetY / 2);
            if (x < 0 || y < 0 || x >= app._canvasMap.width || y >= app._canvasMap.height)
            {
                app._sprCursor.visible = false;
                return;
            }

            app._sprCursor.visible = true;
            app._sprCursor.position = new Point(x, y);
            app._ellipseTerritoryRange.position = app._sprCursor.position;

            app.updateCastleDistance();
            app.updateCanvas();
        }

        private onCanvasMap_MouseLeftDown(ev: MouseEvent)
        {
            var app: App = App.getInstance();
            app.setBuilding();
        }

        private updateCanvas()
        {
            var app: App = App.getInstance();
            var ctx: CanvasRenderingContext2D = app._ctxMap;
            if (isEmpty(app._currentMapData))
            {
                return;
            }

            app._sprMap.draw(ctx);

            for (var i: number = 0; i < app._renderSprites.length; i++)
            {
                app._renderSprites[i].draw(ctx);
            }
        }

        private addSpriteArrayFromFile(arraySprite: Array<SpriteImage>, url: string, ptCenter: Point, count: number)
        {
            var app: App = App.getInstance();
            var img: HTMLImageElement = new Image();
            img.src = url;
            img.onload = function ()
            {
                for (var i: number = 0; i < count; i++)
                {
                    var spr: SpriteImage = SpriteImage.fromImage(img);
                    spr.center = ptCenter;
                    arraySprite.push(spr);
                    app._renderSprites.push(spr);
                }
            }
        }

        private onButtonBuildClick(ev : MouseEvent)
        {
            var app: App = App.getInstance();

            // ボタン色をリセット
            for (var i: number = 0; i < BuildingConst.MAX; i++)
            {
                app._arrayBtnBuild[i].style.backgroundColor = "";
            } 

            // 選択ボタンをON色に設定
            var elmBtn: HTMLElement = <HTMLElement>ev.srcElement;
            elmBtn.style.backgroundColor = ObeSimConst.COLOR_BUTTON_ON;

            // value値を取得して記憶
            var value: number = Number(elmBtn.getAttribute("value"));
            app._selectedBuilding = value;

            switch (app._selectedBuilding)
            {
                case BuildingConst.AtkCastle:
                    app._ellipseTerritoryRange.strokeColor = ObeSimConst.COLOR_ATK_TERRITORY;
                    app._ellipseTerritoryRange.width = ObeSimConst.RANGE_CASTLE;
                    app._ellipseTerritoryRange.visible = true;
                    break;

                case BuildingConst.DefCastle:
                    app._ellipseTerritoryRange.strokeColor = ObeSimConst.COLOR_DEF_TERRITORY;
                    app._ellipseTerritoryRange.width = ObeSimConst.RANGE_CASTLE;
                    app._ellipseTerritoryRange.visible = true;
                    break;

                case BuildingConst.AtkObelisk:
                    app._ellipseTerritoryRange.strokeColor = ObeSimConst.COLOR_ATK_TERRITORY;
                    app._ellipseTerritoryRange.width = ObeSimConst.RANGE_OBELISK;
                    app._ellipseTerritoryRange.visible = true;
                    break;

                case BuildingConst.DefObelisk:
                    app._ellipseTerritoryRange.strokeColor = ObeSimConst.COLOR_DEF_TERRITORY;
                    app._ellipseTerritoryRange.width = ObeSimConst.RANGE_OBELISK;
                    app._ellipseTerritoryRange.visible = true;
                    break;

                case BuildingConst.AtkEclipse:
                    app._ellipseTerritoryRange.strokeColor = ObeSimConst.COLOR_ATK_TERRITORY;
                    app._ellipseTerritoryRange.width = ObeSimConst.RANGE_ECLIPSE;
                    app._ellipseTerritoryRange.visible = true;
                    break;

                case BuildingConst.DefEclipse:
                    app._ellipseTerritoryRange.strokeColor = ObeSimConst.COLOR_DEF_TERRITORY;
                    app._ellipseTerritoryRange.width = ObeSimConst.RANGE_ECLIPSE;
                    app._ellipseTerritoryRange.visible = true;
                    break;

                default:
                    app._ellipseTerritoryRange.visible = false;
            }
        }

        /// <summary>
        /// シミュレーション結果URLのテキストを更新する。
        /// </summary>
        private updateSimURL()
        {
            var app: App = App.getInstance();
            var url: string = getDocumentUrl();
            var optList: Array<string> = new Array<string>();

            // mapID
            if (app._currentMapData != null)
            {
                optList.push("mapid=" + app._currentMapData.mapID.replace("M", ""));
            }

            // キープ設置距離
            optList.push("ksd=" + app._sliderKeepSetDistance.value.toString(16));

            // キープ座標
            app.addSpritePositionParam("act", [app._atkCastle], optList);

            // キャッスル座標
            app.addSpritePositionParam("dct", [app._defCastle], optList);

            // クリスタル座標
            app.addSpritePositionParam("cry", app._crystal, optList);

            // 攻撃側オベリスク座標
            app.addSpritePositionParam("aob", app._atkObelisk, optList);

            // 防衛側オベリスク座標
            app.addSpritePositionParam("dob", app._defObelisk, optList);

            // 攻撃側エクリプス座標
            app.addSpritePositionParam("aec", app._atkEclipse, optList);

            // 防衛側エクリプス座標
            app.addSpritePositionParam("dec", app._defEclipse, optList);

            // 攻撃側アロータワー座標
            app.addSpritePositionParam("aat", app._atkArrowTower, optList);

            // 防衛側アロータワー座標
            app.addSpritePositionParam("dat", app._defArrowTower, optList);

            // 攻撃側ブルワーク座標
            app.addSpritePositionParam("abw", app._atkBullwork, optList);

            // 防衛側ブルワーク座標
            app.addSpritePositionParam("dbw", app._defBullwork, optList);

            // 攻撃側ゲートオブハデス座標
            app.addSpritePositionParam("agh", [app._atkGateOfHades], optList);

            // 防衛側ゲートオブハデス座標
            app.addSpritePositionParam("dgh", [app._defGateOfHades], optList);

            // 攻撃側ウォークラフト座標
            app.addSpritePositionParam("awc", [app._atkWarCraft], optList);

            // 防衛側ウォークラフト座標
            app.addSpritePositionParam("dwc", [app._defWarCraft], optList);

            // オプションをURL文字列に追加
            if (optList.length > 0)
            {
                url += "?" + optList[0];
                for (var i: number = 1; i < optList.length; i++)
                {
                    url += "&" + optList[i];
                }
            }

            app._txtURL.innerHTML = url;
        }

        private spritePositionFromString(arraySprite: Array<SpriteImage>, posStr: string)
        {
            var datPos: string[] = posStr.split(":");
            var cnt: number = Math.min(datPos.length, arraySprite.length)
            for (var i: number = 0; i < cnt; i++)
            {
                arraySprite[i].position = Point.fromHex(datPos[i]);
                arraySprite[i].visible = true;
            }
        }

        private addSpritePositionParam(paramName: string, arraySprite: Array<SpriteImage>, arrayParam: Array<string>)
        {
            var len: number = arraySprite.length;
            var arrayPosStr: Array<string> = new Array<string>();
            for (var i: number = 0; i < len; i++)
            {
                if (arraySprite[i].visible == true)
                {
                    arrayPosStr.push(arraySprite[i].position.toHex());
                }
            }
            if (arrayPosStr.length > 0)
            {
                var posStr: string = "";
                for (var i: number = 0; i < arrayPosStr.length; i++)
                {
                    if (i > 0)
                    {
                        posStr += ":";
                    }

                    posStr += arrayPosStr[i];
                }

                arrayParam.push(paramName + "=" + posStr);
            }
        }

        /// <summary>
        /// Castle距離を更新する。
        /// </summary>
        private updateCastleDistance()
        {
            var app: App = App.getInstance();
            var cursorPos: Point = app._sprCursor.position;
            app._txtCursorPos.innerHTML = "x:" + cursorPos.x + " y:" + cursorPos.y;
            app._txtCastleDistance.style.color = "";
            app._txtCastleDistance.innerHTML = "Castle距離 ";
            app._txtKeepSetDistance.innerHTML = app._keepSetDistance.toFixed(0);
            if (app._defCastle.visible)
            {
                var ptTarget: Point = cursorPos;

                if (app._atkCastle.visible)
                {
                    ptTarget = app._atkCastle.position;
                }

                var castleDistance: number = ptTarget.distance(app._defCastle.position);

                // キープ設置可能距離より近ければCastle距離を赤文字にする
                if (castleDistance < app._keepSetDistance)
                {
                    app._txtCastleDistance.style.color = "";
                }

                app._txtCastleDistance.innerHTML += castleDistance.toFixed(1);

                // キープ設置可能距離の円を表示
                var keepSetDistance: number = Number(app._txtKeepSetDistance.innerHTML);
                app._ellipseKeepSetDistance.width = keepSetDistance * 2;
                app._ellipseKeepSetDistance.position = app._defCastle.position;
                app._ellipseKeepSetDistance.visible = true;

                // 中心線を表示
                var lineLength: number = 500;
                var angle = Math.atan2(ptTarget.y - app._defCastle.position.y, ptTarget.x - app._defCastle.position.x) + Math.PI / 2;
                var dx: number = lineLength * Math.cos(angle);
                var dy: number = lineLength * Math.sin(angle);
                var center: Point = new Point((ptTarget.x + app._defCastle.position.x) / 2,(ptTarget.y + app._defCastle.position.y) / 2);
                app._centerLine.position = new Point(center.x + dx, center.y + dy);
                app._centerLine.lineTo = new Point(center.x - dx, center.y - dy);
                app._centerLine.visible = true;
            }
            else
            {
                app._txtCastleDistance.innerHTML += "0.0";
                app._ellipseKeepSetDistance.visible = false;
                app._centerLine.visible = false;
            }
        }
    }
}

window.onload = () =>
{
    var app: TSObeliskSimulator.App = new TSObeliskSimulator.App();
    app.run();
};