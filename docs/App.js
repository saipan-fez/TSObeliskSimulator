/// <reference path="Scripts/typings/jquery/jquery.d.ts" />
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    var App = (function () {
        function App() {
            this._arrayBtnBuild = new Array(); // ボタンのElement配列
            this._dicMapData = new collections.Dictionary(); // XMLから読み込んだMAPデータのDictionary
            this._sprMap = new TSObeliskSimulator.SpriteImage(); //MAP用スプライト
            this._atkCastle = new TSObeliskSimulator.SpriteImage(); // キープ用スプライト
            this._defCastle = new TSObeliskSimulator.SpriteImage(); // キャッスル用スプライト
            this._ellipseKeepSetDistance = new TSObeliskSimulator.SpriteEllipse(); // キープ設置可能距離の円
            this._ellipseTerritoryRange = new TSObeliskSimulator.SpriteEllipse(); // 建築物で確保可能な領域の円
            this._atkObelisk = new Array(); // 攻撃側オベリスク用スプライト
            this._defObelisk = new Array(); // 防衛側オベリスク用スプライト
            this._atkEclipse = new Array(); // 攻撃側エクリプス用スプライト
            this._defEclipse = new Array(); // 防衛側エクリプス用スプライト
            this._atkArrowTower = new Array(); // 攻撃側アロータワー用スプライト
            this._defArrowTower = new Array(); // 防衛側アロータワー用スプライト
            this._atkBullwork = new Array(); // 攻撃側ブルワーク用スプライト
            this._defBullwork = new Array(); // 防衛側ブルワーク用スプライト
            this._crystal = new Array(); // クリスタル用スプライト
            this._sprCursor = new TSObeliskSimulator.SpriteImage(); // カーソル用スプライト
            this._renderSprites = new Array();
            this._defField = new TSObeliskSimulator.TerritoryImage(TSObeliskSimulator.ObeSimConst.COLOR_DEF_TERRITORY); // 防衛側領域描画用フィールド画像
            this._atkField = new TSObeliskSimulator.TerritoryImage(TSObeliskSimulator.ObeSimConst.COLOR_ATK_TERRITORY); // 攻撃側領域描画用フィールド画像
            this._centerLine = new TSObeliskSimulator.SpriteLine(); //キープ間中心線
            this._selectedBuilding = 0 /* None */; // 現在選択中の建築物
            this._param = new collections.Dictionary(); // URLから渡されたパラメータ
            this._currentMapData = null; // 選択中のMAPデータ
            this._keepSetDistance = 128;
            App._instance = this;
            this._param = this.getUrlParameter();
            this._sprMap.visible = true;
        }
        App.getInstance = function () {
            return App._instance;
        };
        App.prototype.run = function () {
            var app = App.getInstance();
            // コントロールを変数に記憶し、イベントをセットする
            app._panelLeft = document.getElementById("PanelLeft");
            app._comboMap = document.getElementById("ComboMap");
            app._comboMap.onchange = app.onComboMap_Change;
            app._canvasMap = document.getElementById("CanvasMap");
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
            app._sliderKeepSetDistance = new TSObeliskSimulator.Slider(document.getElementById("SliderKeepSetDistance"));
            app._sliderKeepSetDistance.onchange = function (value) {
                app._keepSetDistance = Math.floor(value);
                app.updateCastleDistance();
                app.updateSimURL();
                app.updateCanvas();
            };
            for (var i = 1; i <= 16; i++) {
                var elmBtn = document.getElementById("ButtonBuild" + i);
                elmBtn.onclick = app.onButtonBuildClick;
                app._arrayBtnBuild.push(elmBtn);
            }
            app._btnSavePicture = document.getElementById("ButtonSavePicture");
            app._btnSavePicture.onclick = function () {
                TSObeliskSimulator.Util.saveElementImage(app._panelLeft, "オベシミュ結果.png");
            };
            // 支配領域イメージ作成
            app._atkField.visible = true;
            app._atkField.opacity = 0.5;
            app._defField.visible = true;
            app._defField.opacity = 0.5;
            // オベリスク用スプライト作成
            var ptObeliskCenter = new TSObeliskSimulator.Point(4, 4);
            app.addSpriteArrayFromFile(app._atkObelisk, "image/building/atk_obelisk.png", ptObeliskCenter, TSObeliskSimulator.ObeSimConst.MAX_OBELISK);
            app.addSpriteArrayFromFile(app._defObelisk, "image/building/def_obelisk.png", ptObeliskCenter, TSObeliskSimulator.ObeSimConst.MAX_OBELISK);
            // エクリプス用スプライト作成
            var ptEclipseCenter = new TSObeliskSimulator.Point(4, 4);
            app.addSpriteArrayFromFile(app._atkEclipse, "image/building/atk_eclipse.png", ptEclipseCenter, TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE);
            app.addSpriteArrayFromFile(app._defEclipse, "image/building/def_eclipse.png", ptEclipseCenter, TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE);
            // アロータワー用スプライト作成
            var ptArrowTowerCenter = new TSObeliskSimulator.Point(4, 4);
            app.addSpriteArrayFromFile(app._atkArrowTower, "image/building/atk_arrowtower.png", ptArrowTowerCenter, TSObeliskSimulator.ObeSimConst.MAX_ARROWTOWER);
            app.addSpriteArrayFromFile(app._defArrowTower, "image/building/def_arrowtower.png", ptArrowTowerCenter, TSObeliskSimulator.ObeSimConst.MAX_ARROWTOWER);
            // クリスタル用スプライト作成
            var ptCrystalCenter = new TSObeliskSimulator.Point(3, 3);
            app.addSpriteArrayFromFile(app._crystal, "image/building/crystal.png", ptCrystalCenter, TSObeliskSimulator.ObeSimConst.MAX_CRYSTAL);
            // キープ、キャッスル用スプライト作成
            var ptCastleCenter = new TSObeliskSimulator.Point(4, 4);
            TSObeliskSimulator.SpriteImage.loadFile("image/building/atk_castle.png", ptCastleCenter, function (spr) {
                app._atkCastle = spr;
                app._renderSprites.push(spr);
            });
            TSObeliskSimulator.SpriteImage.loadFile("image/building/def_castle.png", ptCastleCenter, function (spr) {
                app._defCastle = spr;
                app._renderSprites.push(spr);
            });
            // ゲートオブハデス用スプライト作成
            var ptGateOfHadesCenter = new TSObeliskSimulator.Point(4, 4);
            TSObeliskSimulator.SpriteImage.loadFile("image/building/atk_gateofhades.png", ptGateOfHadesCenter, function (spr) {
                app._atkGateOfHades = spr;
                app._renderSprites.push(spr);
            });
            TSObeliskSimulator.SpriteImage.loadFile("image/building/def_gateofhades.png", ptGateOfHadesCenter, function (spr) {
                app._defGateOfHades = spr;
                app._renderSprites.push(spr);
            });
            // ウォークラフト用スプライト作成
            var ptWarCraftCenter = new TSObeliskSimulator.Point(4, 4);
            TSObeliskSimulator.SpriteImage.loadFile("image/building/atk_warcraft.png", ptWarCraftCenter, function (spr) {
                app._atkWarCraft = spr;
                app._renderSprites.push(spr);
            });
            TSObeliskSimulator.SpriteImage.loadFile("image/building/def_warcraft.png", ptWarCraftCenter, function (spr) {
                app._defWarCraft = spr;
                app._renderSprites.push(spr);
            });
            // ブルワーク用スプライト作成
            var ptBullworkCenter = new TSObeliskSimulator.Point(4, 4);
            app.addSpriteArrayFromFile(app._atkBullwork, "image/building/atk_bullwork.png", ptBullworkCenter, TSObeliskSimulator.ObeSimConst.MAX_BULLWORK);
            app.addSpriteArrayFromFile(app._defBullwork, "image/building/def_bullwork.png", ptBullworkCenter, TSObeliskSimulator.ObeSimConst.MAX_BULLWORK);
            // キープ設置可能距離Ellipse作成
            app._ellipseKeepSetDistance.width = TSObeliskSimulator.ObeSimConst.DEF_KEEP_SET_DISTANCE;
            app._ellipseKeepSetDistance.opacity = 0.5;
            app._ellipseKeepSetDistance.strokeColor = TSObeliskSimulator.ObeSimConst.COLOR_KEEP_SET_DISTANCE;
            // 中心線作成
            app._centerLine.strokeColor = TSObeliskSimulator.ObeSimConst.COLOR_CENTER_LINE;
            app._centerLine.opacity = 0.5;
            // MAP用カーソル作成
            var ptCursor = new TSObeliskSimulator.Point(7, 7);
            TSObeliskSimulator.SpriteImage.loadFile("image/cursor/cursor_cross.png", ptCursor, function (spr) {
                spr.visible = true;
                app._sprCursor = spr;
            });
            // MAPXML読み込み
            var dic = app.getUrlParameter();
            app.loadMapDataFromXml();
            //app.updateCanvas();
        };
        /// <summary>
        /// URLパラメータを取得する。
        /// </summary>
        App.prototype.getUrlParameter = function () {
            var dic = new collections.Dictionary();
            var params = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < params.length; i++) {
                var keyval = params[i].split('=');
                dic.setValue(keyval[0], keyval[1]);
            }
            return dic;
        };
        App.prototype.loadMapDataFromXml = function () {
            $.ajax({
                url: TSObeliskSimulator.ObeSimConst.MAP_PATH,
                type: "get",
                dataType: "xml",
                timeout: 1000,
                success: this.parseMapData
            });
        };
        App.prototype.parseMapData = function (xml, status, jqXHR) {
            var app = App.getInstance();
            var arrayMap = $(xml).find("Map");
            var mapList = app._dicMapData;
            var combo = app._comboMap;
            $(arrayMap).each(function () {
                var val = $(this);
                var mapData = new TSObeliskSimulator.MapData();
                mapData.mapName = val.attr("Name");
                mapData.mapID = val.attr("MapID");
                mapData.imageUrl = val.attr("ImageUrl");
                mapData.keepSetDistance = Number(val.attr("KeepSetDistance"));
                var defCastle = val.find("DefCastle");
                if (!TSObeliskSimulator.isUndefined(defCastle)) {
                    var arrayPos = $(defCastle).find("Position");
                    $(arrayPos).each(function () {
                        var val = $(this);
                        var pos = new TSObeliskSimulator.Point(Number(val.attr("X")), Number(val.attr("Y")));
                        if (pos.x >= 0 && pos.x <= 255 && pos.y >= 0 && pos.y <= 255) {
                            mapData.defCastlePosition.push(pos);
                        }
                    });
                }
                var crystals = val.find("Crystal");
                if (!TSObeliskSimulator.isUndefined(crystals)) {
                    var arrayPos = $(crystals).find("Position");
                    $(arrayPos).each(function () {
                        var val = $(this);
                        var pos = new TSObeliskSimulator.Point(Number(val.attr("X")), Number(val.attr("Y")));
                        if (pos.x >= 0 && pos.x <= 255 && pos.y >= 0 && pos.y <= 255) {
                            mapData.crystalPosition.push(pos);
                        }
                    });
                }
                var dispMapName = mapData.mapID.replace("M", "") + ":" + mapData.mapName;
                mapList.setValue(mapData.mapID, mapData);
                var opt = document.createElement("option");
                opt.innerText = dispMapName;
                opt.value = mapData.mapID;
                combo.appendChild(opt);
            });
            if (app._param.size() > 0) {
                app.setMapFromParams();
            }
        };
        /// <summary>
        /// URL引数からマップデータを配置する。
        /// </summary>
        App.prototype.setMapFromParams = function () {
            var app = App.getInstance();
            var param = app._param;
            var comboMap = app._comboMap;
            // "mapid" 引数がある場合は、初期MAP設定
            if (param.containsKey("mapid")) {
                var mapID = "M" + param.getValue("mapid");
                for (var i = 0; i < comboMap.childNodes.length; i++) {
                    var item = comboMap.childNodes.item(i);
                    var value = item.value;
                    if (value == mapID) {
                        comboMap.selectedIndex = i;
                        app.loadMap(value, true);
                        break;
                    }
                }
            }
        };
        App.prototype.setObjectFromParam = function () {
            var app = App.getInstance();
            var param = app._param;
            // "act" 引数がある場合は、キープ位置設定
            if (param.containsKey("act")) {
                app.spritePositionFromString([app._atkCastle], param.getValue("act"));
            }
            // "ksg" 引数がある場合は、キープ設置可能距離設定
            if (param.containsKey("ksd")) {
                var distance = parseInt(param.getValue("ksd"), 16);
                if (distance < app._sliderKeepSetDistance.min || distance > app._sliderKeepSetDistance.max) {
                    distance = TSObeliskSimulator.ObeSimConst.DEF_KEEP_SET_DISTANCE;
                }
                app._sliderKeepSetDistance.value = distance;
                app._keepSetDistance = distance;
            }
            // "dct" 引数がある場合は、キャッスル位置設定
            if (param.containsKey("dct")) {
                app.spritePositionFromString([app._defCastle], param.getValue("dct"));
                var keepSetDistance = Number(app._txtKeepSetDistance.innerHTML);
                app._ellipseKeepSetDistance.position = app._defCastle.position;
                app._ellipseKeepSetDistance.width = keepSetDistance * 2 + 1;
                app._ellipseKeepSetDistance.visible = true;
            }
            // "cry" 引数がある場合は、クリ位置設定
            if (param.containsKey("cry")) {
                app.spritePositionFromString(app._crystal, param.getValue("cry"));
            }
            // "aob" 引数がある場合は、攻撃側オベ位置設定
            if (param.containsKey("aob")) {
                app.spritePositionFromString(app._atkObelisk, param.getValue("aob"));
            }
            // "dob" 引数がある場合は、攻撃側オベ位置設定
            if (param.containsKey("dob")) {
                app.spritePositionFromString(app._defObelisk, param.getValue("dob"));
            }
            // "aec" 引数がある場合は、攻撃側エクリ位置設定
            if (param.containsKey("aec")) {
                app.spritePositionFromString(app._atkEclipse, param.getValue("aec"));
            }
            // "dec" 引数がある場合は、防衛側エクリ位置設定
            if (param.containsKey("dec")) {
                app.spritePositionFromString(app._defEclipse, param.getValue("dec"));
            }
            // "aat" 引数がある場合は、攻撃側ブルワーク位置設定
            if (param.containsKey("aat")) {
                app.spritePositionFromString(app._atkArrowTower, param.getValue("aat"));
            }
            // "dat" 引数がある場合は、防衛側ブルワーク位置設定
            if (param.containsKey("dat")) {
                app.spritePositionFromString(app._defArrowTower, param.getValue("dat"));
            }
            // "abw" 引数がある場合は、攻撃側ブルワーク位置設定
            if (param.containsKey("abw")) {
                app.spritePositionFromString(app._atkBullwork, param.getValue("abw"));
            }
            // "dbw" 引数がある場合は、防衛側ブルワーク位置設定
            if (param.containsKey("dbw")) {
                app.spritePositionFromString(app._defBullwork, param.getValue("dbw"));
            }
            // "agh" 引数がある場合は、攻撃側ゲートオブハデス位置設定
            if (param.containsKey("agh")) {
                app.spritePositionFromString([app._atkGateOfHades], param.getValue("agh"));
            }
            // "dgh" 引数がある場合は、防衛側ゲートオブハデス位置設定
            app._defGateOfHades.visible = false;
            if (param.containsKey("dgh")) {
                app.spritePositionFromString([app._defGateOfHades], param.getValue("dgh"));
            }
            // "awc" 引数がある場合は、攻撃側ウォークラフト位置設定
            app._atkWarCraft.visible = false;
            if (param.containsKey("awc")) {
                app.spritePositionFromString([app._atkWarCraft], param.getValue("awc"));
            }
            // "dwc" 引数がある場合は、防衛側ウォークラフト位置設定
            app._defWarCraft.visible = false;
            if (param.containsKey("dwc")) {
                app.spritePositionFromString([app._defWarCraft], param.getValue("dwc"));
            }
        };
        /// <summary>
        /// 全オブジェクトを非表示にする
        /// </summary>
        App.prototype.resetVisible = function () {
            var app = App.getInstance();
            app._defCastle.visible = false;
            app._atkCastle.visible = false;
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_CRYSTAL; i++) {
                app._crystal[i].visible = false;
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_OBELISK; i++) {
                app._atkObelisk[i].visible = false;
                app._defObelisk[i].visible = false;
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE; i++) {
                app._atkEclipse[i].visible = false;
                app._defEclipse[i].visible = false;
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ARROWTOWER; i++) {
                app._atkArrowTower[i].visible = false;
                app._defArrowTower[i].visible = false;
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_BULLWORK; i++) {
                app._atkBullwork[i].visible = false;
                app._defBullwork[i].visible = false;
            }
            app._atkGateOfHades.visible = false;
            app._defGateOfHades.visible = false;
            app._atkWarCraft.visible = false;
            app._defWarCraft.visible = false;
            app._sprCursor.visible = false;
        };
        /// <summary>
        /// MAPを読み込む。
        /// </summary>
        /// <param name="mapID">マップID。</param>
        App.prototype.loadMap = function (mapID, paramRelocate) {
            var app = App.getInstance();
            var map = app._dicMapData.getValue(mapID);
            // MapIDをキーにしてMAPデータを取得し、マップ画像、オブジェクト位置、キープ設置距離を初期化。
            TSObeliskSimulator.SpriteImage.loadFile(map.imageUrl, new TSObeliskSimulator.Point(), function (sprMap) {
                app.resetVisible();
                // 通常のキープ設置可能距離
                app._sliderKeepSetDistance.value = TSObeliskSimulator.ObeSimConst.DEF_KEEP_SET_DISTANCE;
                sprMap.visible = true;
                app._sprMap = sprMap;
                // キャッスル位置設定
                if (map.defCastlePosition.length > 0) {
                    app._defCastle.position = map.defCastlePosition[0];
                    app._defCastle.visible = true;
                }
                // クリスタル位置設定
                if (map.crystalPosition.length > 0) {
                    var count = Math.min(TSObeliskSimulator.ObeSimConst.MAX_CRYSTAL, map.crystalPosition.length);
                    for (var i = 0; i < count; i++) {
                        app._crystal[i].visible = true;
                        app._crystal[i].position = map.crystalPosition[i];
                    }
                }
                // 選択されたMAPデータを記憶
                app._currentMapData = map;
                if (paramRelocate) {
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
        };
        /// <summary>
        /// 建築物を指定座標へ配置する。
        /// </summary>
        /// <param name="pt">建築物を配置する座標。</param>
        /// <returns>true:成功 false:失敗</returns>
        App.prototype.setBuilding = function () {
            var app = App.getInstance();
            if (app._currentMapData == null) {
                return false;
            }
            var delTarget = null;
            var mapPt = app._sprCursor.position.clone();
            var updateAtk = false;
            var updateDef = false;
            switch (app._selectedBuilding) {
                case 1 /* AtkCastle */:
                    if (app._atkCastle.visible == false) {
                        if (app._defCastle.visible == true) {
                            var distance = TSObeliskSimulator.Util.pointDistance(mapPt, app._defCastle.position);
                            if (distance < app._sliderKeepSetDistance.value) {
                                break;
                            }
                        }
                        app._atkCastle.visible = true;
                        app._atkCastle.position = mapPt;
                        app._atkField.setTerritory(mapPt, 0 /* Castle */);
                        updateAtk = true;
                        break;
                    }
                    break;
                case 9 /* DefCastle */:
                    if (app._defCastle.visible == false) {
                        app._defCastle.visible = true;
                        app._defCastle.position = mapPt;
                        app._defField.setTerritory(mapPt, 0 /* Castle */);
                        updateDef = true;
                        break;
                    }
                    break;
                case 2 /* AtkObelisk */:
                    if (!app._atkField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_OBELISK; i++) {
                        if (app._atkObelisk[i].visible == false) {
                            app._atkObelisk[i].visible = true;
                            app._atkObelisk[i].position = mapPt;
                            updateAtk = true;
                            break;
                        }
                    }
                    break;
                case 10 /* DefObelisk */:
                    if (!app._defField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_OBELISK; i++) {
                        if (app._defObelisk[i].visible == false) {
                            app._defObelisk[i].visible = true;
                            app._defObelisk[i].position = mapPt;
                            updateDef = true;
                            break;
                        }
                    }
                    break;
                case 3 /* AtkEclipse */:
                    if (!app._atkField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE; i++) {
                        if (app._atkEclipse[i].visible == false) {
                            app._atkEclipse[i].visible = true;
                            app._atkEclipse[i].position = mapPt;
                            updateAtk = true;
                            break;
                        }
                    }
                    break;
                case 11 /* DefEclipse */:
                    if (!app._defField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE; i++) {
                        if (app._defEclipse[i].visible == false) {
                            app._defEclipse[i].visible = true;
                            app._defEclipse[i].position = mapPt;
                            updateDef = true;
                            break;
                        }
                    }
                    break;
                case 4 /* AtkArrowTower */:
                    if (!app._atkField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ARROWTOWER; i++) {
                        if (app._atkArrowTower[i].visible == false) {
                            app._atkArrowTower[i].visible = true;
                            app._atkArrowTower[i].position = mapPt;
                            break;
                        }
                    }
                    break;
                case 12 /* DefArrowTower */:
                    if (!app._defField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ARROWTOWER; i++) {
                        if (app._defArrowTower[i].visible == false) {
                            app._defArrowTower[i].visible = true;
                            app._defArrowTower[i].position = mapPt;
                            break;
                        }
                    }
                    break;
                case 5 /* AtkGateOfHades */:
                    if (!app._atkField.isTerritory(mapPt)) {
                        return false;
                    }
                    if (app._atkGateOfHades.visible == false) {
                        app._atkGateOfHades.visible = true;
                        app._atkGateOfHades.position = mapPt;
                        break;
                    }
                    break;
                case 13 /* DefGateOfHades */:
                    if (!app._defField.isTerritory(mapPt)) {
                        return false;
                    }
                    if (app._defGateOfHades.visible == false) {
                        app._defGateOfHades.visible = true;
                        app._defGateOfHades.position = mapPt;
                        break;
                    }
                    break;
                case 6 /* AtkWarCraft */:
                    if (!app._atkField.isTerritory(mapPt)) {
                        return false;
                    }
                    if (app._atkWarCraft.visible == false) {
                        app._atkWarCraft.visible = true;
                        app._atkWarCraft.position = mapPt;
                        break;
                    }
                    break;
                case 14 /* DefWarCraft */:
                    if (!app._defField.isTerritory(mapPt)) {
                        return false;
                    }
                    if (app._defWarCraft.visible == false) {
                        app._defWarCraft.visible = true;
                        app._defWarCraft.position = mapPt;
                        break;
                    }
                    break;
                case 7 /* AtkBullwork */:
                    if (!app._atkField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_BULLWORK; i++) {
                        if (app._atkBullwork[i].visible == false) {
                            app._atkBullwork[i].visible = true;
                            app._atkBullwork[i].position = mapPt;
                            break;
                        }
                    }
                    break;
                case 15 /* DefBullwork */:
                    if (!app._defField.isTerritory(mapPt)) {
                        return false;
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_BULLWORK; i++) {
                        if (app._defBullwork[i].visible == false) {
                            app._defBullwork[i].visible = true;
                            app._defBullwork[i].position = mapPt;
                            break;
                        }
                    }
                    break;
                case 8 /* Crystal */:
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_CRYSTAL; i++) {
                        if (app._crystal[i].visible == false) {
                            app._crystal[i].visible = true;
                            app._crystal[i].position = mapPt;
                            break;
                        }
                    }
                    break;
                case 16 /* Delete */:
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_OBELISK; i++) {
                        if (app._atkObelisk[i].visible == true) {
                            if (app._atkObelisk[i].isHit(mapPt)) {
                                delTarget = app._atkObelisk[i];
                                updateAtk = true;
                                break;
                            }
                        }
                        if (app._defObelisk[i].visible == true) {
                            if (app._defObelisk[i].isHit(mapPt)) {
                                delTarget = app._defObelisk[i];
                                updateDef = true;
                                break;
                            }
                        }
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE; i++) {
                        if (app._atkEclipse[i].visible == true) {
                            if (app._atkEclipse[i].isHit(mapPt)) {
                                delTarget = app._atkEclipse[i];
                                updateAtk = true;
                                break;
                            }
                        }
                        if (app._defEclipse[i].visible == true) {
                            if (app._defEclipse[i].isHit(mapPt)) {
                                delTarget = app._defEclipse[i];
                                updateDef = true;
                                break;
                            }
                        }
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ARROWTOWER; i++) {
                        if (app._atkArrowTower[i].visible == true) {
                            if (app._atkArrowTower[i].isHit(mapPt)) {
                                delTarget = app._atkArrowTower[i];
                                break;
                            }
                        }
                        if (app._defArrowTower[i].visible == true) {
                            if (app._defArrowTower[i].isHit(mapPt)) {
                                delTarget = app._defArrowTower[i];
                                break;
                            }
                        }
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_BULLWORK; i++) {
                        if (app._atkBullwork[i].visible == true) {
                            if (app._atkBullwork[i].isHit(mapPt)) {
                                delTarget = app._atkBullwork[i];
                                break;
                            }
                        }
                        if (app._defBullwork[i].visible == true) {
                            if (app._defBullwork[i].isHit(mapPt)) {
                                delTarget = app._defBullwork[i];
                                break;
                            }
                        }
                    }
                    if (app._atkGateOfHades.visible == true) {
                        if (app._atkGateOfHades.isHit(mapPt)) {
                            delTarget = app._atkGateOfHades;
                            break;
                        }
                    }
                    if (app._defGateOfHades.visible == true) {
                        if (app._defGateOfHades.isHit(mapPt)) {
                            delTarget = app._defGateOfHades;
                            break;
                        }
                    }
                    if (app._atkWarCraft.visible == true) {
                        if (app._atkWarCraft.isHit(mapPt)) {
                            delTarget = app._atkWarCraft;
                            break;
                        }
                    }
                    if (app._defWarCraft.visible == true) {
                        if (app._defWarCraft.isHit(mapPt)) {
                            delTarget = app._defWarCraft;
                            break;
                        }
                    }
                    if (app._atkCastle.visible == true) {
                        if (app._atkCastle.isHit(mapPt)) {
                            delTarget = app._atkCastle;
                            updateAtk = true;
                            break;
                        }
                    }
                    if (app._defCastle.visible == true) {
                        if (app._defCastle.isHit(mapPt)) {
                            delTarget = app._defCastle;
                            break;
                        }
                    }
                    for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_CRYSTAL; i++) {
                        if (app._crystal[i].visible == true) {
                            if (app._crystal[i].isHit(mapPt)) {
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
            if (delTarget != null) {
                delTarget.visible = false;
            }
            // 支配領域、キャッスル距離、シミュレーション結果URL更新
            if (updateAtk) {
                app.updateAtkTerritoryInfo();
            }
            if (updateDef) {
                app.updateDefTerritoryInfo();
            }
            app.updateCastleDistance();
            app.updateSimURL();
            return true;
        };
        /// <summary>
        /// 攻撃側の領域表示を更新する。
        /// </summary>
        App.prototype.updateAtkTerritoryInfo = function () {
            var app = App.getInstance();
            app._atkField.clear();
            if (app._atkCastle.visible == true) {
                app._atkField.setTerritory(app._atkCastle.position, 0 /* Castle */);
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_OBELISK; i++) {
                if (app._atkObelisk[i].visible == true) {
                    app._atkField.setTerritory(app._atkObelisk[i].position, 1 /* Obelisk */);
                }
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE; i++) {
                if (app._atkEclipse[i].visible == true) {
                    app._atkField.setTerritory(app._atkEclipse[i].position, 2 /* Eclipse */);
                }
            }
            app._txtAtkTerritory.innerHTML = "攻撃支配率 " + app._atkField.TerritoryPercent.toFixed(2) + "%";
        };
        /// <summary>
        /// 防衛側の領域表示を更新する。
        /// </summary>
        App.prototype.updateDefTerritoryInfo = function () {
            var app = App.getInstance();
            app._defField.clear();
            if (app._defCastle.visible == true) {
                app._defField.setTerritory(app._defCastle.position, 0 /* Castle */);
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_OBELISK; i++) {
                if (app._defObelisk[i].visible == true) {
                    app._defField.setTerritory(app._defObelisk[i].position, 1 /* Obelisk */);
                }
            }
            for (var i = 0; i < TSObeliskSimulator.ObeSimConst.MAX_ECLIPSE; i++) {
                if (app._defEclipse[i].visible == true) {
                    app._defField.setTerritory(app._defEclipse[i].position, 2 /* Eclipse */);
                }
            }
            app._txtDefTerritory.innerHTML = "防衛支配率 " + app._defField.TerritoryPercent.toFixed(2) + "%";
        };
        App.prototype.onComboMap_Change = function (ev) {
            var app = App.getInstance();
            var combo = app._comboMap;
            var idx = combo.selectedIndex;
            var opt = combo.childNodes.item(idx);
            app.loadMap(opt.value, false);
        };
        App.prototype.onCanvasMap_MouseEnter = function (ev) {
            var app = App.getInstance();
            app.onCanvasMap_MouseMove(ev);
        };
        App.prototype.onCanvasMap_MouseLeave = function (ev) {
            var app = App.getInstance();
            app._sprCursor.visible = false;
            app.updateCanvas();
        };
        App.prototype.onCanvasMap_MouseMove = function (ev) {
            var app = App.getInstance();
            var x = Math.floor(ev.offsetX / 2);
            var y = Math.floor(ev.offsetY / 2);
            if (x < 0 || y < 0 || x >= app._canvasMap.width || y >= app._canvasMap.height) {
                app._sprCursor.visible = false;
                return;
            }
            app._sprCursor.visible = true;
            app._sprCursor.position = new TSObeliskSimulator.Point(x, y);
            app.updateCastleDistance();
            app._ellipseTerritoryRange.position = app._sprCursor.position.clone();
            app.updateCanvas();
        };
        App.prototype.onCanvasMap_MouseLeftDown = function (ev) {
            var app = App.getInstance();
            //app.updateCastleDistance();
            //var cursorPos = app._sprCursor.position;
            //var str = `X="${cursorPos.x}" Y="${cursorPos.y}"`;
            // console.log(str);
            // if(navigator.clipboard){
            //     navigator.clipboard.writeText(str);
            // }
            app.setBuilding();
        };
        App.prototype.updateCanvas = function () {
            var app = App.getInstance();
            var ctx = app._ctxMap;
            if (TSObeliskSimulator.isEmpty(app._currentMapData)) {
                return;
            }
            app._sprMap.draw(ctx);
            app._atkField.draw(ctx);
            app._defField.draw(ctx);
            for (var i = 0; i < app._renderSprites.length; i++) {
                app._renderSprites[i].draw(ctx);
            }
            app._ellipseKeepSetDistance.draw(ctx);
            app._centerLine.draw(ctx);
            app._sprCursor.draw(ctx);
        };
        App.prototype.addSpriteArrayFromFile = function (arraySprite, url, ptCenter, count) {
            var app = App.getInstance();
            var img = new Image();
            img.src = url;
            img.onload = function () {
                for (var i = 0; i < count; i++) {
                    var spr = TSObeliskSimulator.SpriteImage.fromImage(img);
                    spr.center = ptCenter;
                    arraySprite.push(spr);
                    app._renderSprites.push(spr);
                }
            };
        };
        App.prototype.onButtonBuildClick = function (ev) {
            var app = App.getInstance();
            for (var i = 0; i < TSObeliskSimulator.BuildingConst.MAX; i++) {
                app._arrayBtnBuild[i].style.backgroundColor = "";
            }
            // 選択ボタンをON色に設定
            var elmBtn = ev.srcElement;
            elmBtn.style.backgroundColor = TSObeliskSimulator.ObeSimConst.COLOR_BUTTON_ON;
            // value値を取得して記憶
            var value = Number(elmBtn.getAttribute("value"));
            app._selectedBuilding = value;
        };
        /// <summary>
        /// シミュレーション結果URLのテキストを更新する。
        /// </summary>
        App.prototype.updateSimURL = function () {
            var app = App.getInstance();
            var url = TSObeliskSimulator.Util.getDocumentUrl();
            var optList = new Array();
            // mapID
            if (app._currentMapData != null) {
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
            if (optList.length > 0) {
                url += "?" + optList[0];
                for (var i = 1; i < optList.length; i++) {
                    url += "&" + optList[i];
                }
            }
            app._txtURL.innerHTML = url;
        };
        App.prototype.spritePositionFromString = function (arraySprite, posStr) {
            var datPos = posStr.split(":");
            var cnt = Math.min(datPos.length, arraySprite.length);
            for (var i = 0; i < cnt; i++) {
                arraySprite[i].position = TSObeliskSimulator.Util.hexToPoint(datPos[i]);
                arraySprite[i].visible = true;
            }
        };
        App.prototype.addSpritePositionParam = function (paramName, arraySprite, arrayParam) {
            var len = arraySprite.length;
            var arrayPosStr = new Array();
            for (var i = 0; i < len; i++) {
                if (arraySprite[i].visible == true) {
                    arrayPosStr.push(TSObeliskSimulator.Util.pointToHex(arraySprite[i].position));
                }
            }
            if (arrayPosStr.length > 0) {
                var posStr = "";
                for (var i = 0; i < arrayPosStr.length; i++) {
                    if (i > 0) {
                        posStr += ":";
                    }
                    posStr += arrayPosStr[i];
                }
                arrayParam.push(paramName + "=" + posStr);
            }
        };
        /// <summary>
        /// Castle距離を更新する。
        /// </summary>
        App.prototype.updateCastleDistance = function () {
            var app = App.getInstance();
            var cursorPos = app._sprCursor.position;
            app._txtCursorPos.innerHTML = "x:" + cursorPos.x + " y:" + cursorPos.y;
            app._txtCastleDistance.style.color = "";
            app._txtCastleDistance.innerHTML = "Castle距離 ";
            app._txtKeepSetDistance.innerHTML = app._keepSetDistance.toFixed(0);
            if (app._defCastle.visible) {
                var ptTarget = cursorPos;
                if (app._atkCastle.visible) {
                    ptTarget = app._atkCastle.position;
                }
                var castleDistance = TSObeliskSimulator.Util.pointDistance(ptTarget, app._defCastle.position);
                // キープ設置可能距離より近ければCastle距離を赤文字にする
                if (castleDistance < app._keepSetDistance) {
                    app._txtCastleDistance.style.color = "";
                }
                app._txtCastleDistance.innerHTML += castleDistance.toFixed(1);
                // キープ設置可能距離の円を表示
                var keepSetDistance = Number(app._txtKeepSetDistance.innerHTML);
                app._ellipseKeepSetDistance.width = keepSetDistance * 2;
                app._ellipseKeepSetDistance.position = app._defCastle.position;
                app._ellipseKeepSetDistance.visible = true;
                // 中心線を表示
                var lineLength = 500;
                var angle = Math.atan2(ptTarget.y - app._defCastle.position.y, ptTarget.x - app._defCastle.position.x) + Math.PI / 2;
                var dx = lineLength * Math.cos(angle);
                var dy = lineLength * Math.sin(angle);
                var center = new TSObeliskSimulator.Point((ptTarget.x + app._defCastle.position.x) / 2, (ptTarget.y + app._defCastle.position.y) / 2);
                app._centerLine.position = new TSObeliskSimulator.Point(center.x + dx, center.y + dy);
                app._centerLine.lineTo = new TSObeliskSimulator.Point(center.x - dx, center.y - dy);
                app._centerLine.visible = true;
            }
            else {
                app._txtCastleDistance.innerHTML += "0.0";
                app._ellipseKeepSetDistance.visible = false;
                app._centerLine.visible = false;
            }
        };
        return App;
    })();
    TSObeliskSimulator.App = App;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
window.onload = function () {
    var app = new TSObeliskSimulator.App();
    app.run();
};
var Base64 = (function () {
    function Base64() {
    }
    Base64.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    };
    Base64.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = this._utf8_decode(output);
        return output;
    };
    Base64._utf8_encode = function (str) {
        str = str.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < str.length; n++) {
            var c = str.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    Base64._utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                var c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    };
    Base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    return Base64;
})();
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    /// <summary>
    /// スプライト線表示クラス。
    /// </summary>
    var SpriteLine = (function () {
        function SpriteLine(lineTo) {
            if (lineTo === void 0) { lineTo = null; }
            this._lineTo = new TSObeliskSimulator.Point();
            this._position = new TSObeliskSimulator.Point(); // 現在座標
            this._opacity = 1;
            this._visible = false;
            this._strokeColor = new TSObeliskSimulator.Color(0xff, 0xff, 0xff); // 線の色
            this._lineWidth = 1;
            if (!TSObeliskSimulator.isNull(lineTo)) {
                this._lineTo = lineTo;
            }
        }
        /// <summary>
        /// 線との命中判定。
        /// </summary>
        /// <param name="pt">判定対象の座標。</param>
        /// <returns>true:当たっている false:当たっていない</returns>
        SpriteLine.prototype.isHit = function (pt) {
            // 要らないのでまたの機会に考える
            return false;
        };
        Object.defineProperty(SpriteLine.prototype, "lineTo", {
            get: function () {
                return this._lineTo;
            },
            set: function (value) {
                this._lineTo = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteLine.prototype, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (value) {
                this._visible = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteLine.prototype, "strokeColor", {
            get: function () {
                return this._strokeColor;
            },
            set: function (value) {
                this._strokeColor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteLine.prototype, "opacity", {
            get: function () {
                return this._opacity;
            },
            /// <summary>
            /// 透明度。
            /// </summary>
            set: function (value) {
                this._opacity = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteLine.prototype, "position", {
            get: function () {
                return this._position;
            },
            /// <summary>
            /// 座標。
            /// </summary>
            set: function (value) {
                this._position = value;
            },
            enumerable: true,
            configurable: true
        });
        SpriteLine.prototype.draw = function (ctxDst) {
            if (!this.visible || this._opacity == 0) {
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
        };
        return SpriteLine;
    })();
    TSObeliskSimulator.SpriteLine = SpriteLine;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
// Copyright 2013 Basarat Ali Syed. All Rights Reserved.
//
// Licensed under MIT open source license http://opensource.org/licenses/MIT
//
// Orginal javascript code was by Mauricio Santos
/**
 * @namespace Top level namespace for collections, a TypeScript data structure library.
 */
var collections;
(function (collections) {
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var has = function (obj, prop) {
        return _hasOwnProperty.call(obj, prop);
    };
    /**
     * Default function to compare element order.
     * @function
     */
    function defaultCompare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a === b) {
            return 0;
        }
        else {
            return 1;
        }
    }
    collections.defaultCompare = defaultCompare;
    /**
     * Default function to test equality.
     * @function
     */
    function defaultEquals(a, b) {
        return a === b;
    }
    collections.defaultEquals = defaultEquals;
    /**
     * Default function to convert an object to a string.
     * @function
     */
    function defaultToString(item) {
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return '$s' + item;
        }
        else {
            return '$o' + item.toString();
        }
    }
    collections.defaultToString = defaultToString;
    /**
    * Joins all the properies of the object using the provided join string
    */
    function makeString(item, join) {
        if (join === void 0) { join = ","; }
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return item.toString();
        }
        else {
            var toret = "{";
            var first = true;
            for (var prop in item) {
                if (has(item, prop)) {
                    if (first)
                        first = false;
                    else
                        toret = toret + join;
                    toret = toret + prop + ":" + item[prop];
                }
            }
            return toret + "}";
        }
    }
    collections.makeString = makeString;
    /**
     * Checks if the given argument is a function.
     * @function
     */
    function isFunction(func) {
        return (typeof func) === 'function';
    }
    collections.isFunction = isFunction;
    /**
     * Checks if the given argument is undefined.
     * @function
     */
    function isUndefined(obj) {
        return (typeof obj) === 'undefined';
    }
    collections.isUndefined = isUndefined;
    /**
     * Checks if the given argument is a string.
     * @function
     */
    function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    }
    collections.isString = isString;
    /**
     * Reverses a compare function.
     * @function
     */
    function reverseCompareFunction(compareFunction) {
        if (!collections.isFunction(compareFunction)) {
            return function (a, b) {
                if (a < b) {
                    return 1;
                }
                else if (a === b) {
                    return 0;
                }
                else {
                    return -1;
                }
            };
        }
        else {
            return function (d, v) {
                return compareFunction(d, v) * -1;
            };
        }
    }
    collections.reverseCompareFunction = reverseCompareFunction;
    /**
     * Returns an equal function given a compare function.
     * @function
     */
    function compareToEquals(compareFunction) {
        return function (a, b) {
            return compareFunction(a, b) === 0;
        };
    }
    collections.compareToEquals = compareToEquals;
    /**
     * @namespace Contains various functions for manipulating arrays.
     */
    var arrays;
    (function (arrays) {
        /**
         * Returns the position of the first occurrence of the specified item
         * within the specified array.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the first occurrence of the specified element
         * within the specified array, or -1 if not found.
         */
        function indexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.indexOf = indexOf;
        /**
         * Returns the position of the last occurrence of the specified element
         * within the specified array.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the last occurrence of the specified element
         * within the specified array or -1 if not found.
         */
        function lastIndexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = length - 1; i >= 0; i--) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.lastIndexOf = lastIndexOf;
        /**
         * Returns true if the specified array contains the specified element.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the specified array contains the specified element.
         */
        function contains(array, item, equalsFunction) {
            return arrays.indexOf(array, item, equalsFunction) >= 0;
        }
        arrays.contains = contains;
        /**
         * Removes the first ocurrence of the specified element from the specified array.
         * @param {*} array the array in which to search element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the array changed after this call.
         */
        function remove(array, item, equalsFunction) {
            var index = arrays.indexOf(array, item, equalsFunction);
            if (index < 0) {
                return false;
            }
            array.splice(index, 1);
            return true;
        }
        arrays.remove = remove;
        /**
         * Returns the number of elements in the specified array equal
         * to the specified object.
         * @param {Array} array the array in which to determine the frequency of the element.
         * @param {Object} item the element whose frequency is to be determined.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the number of elements in the specified array
         * equal to the specified object.
         */
        function frequency(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            var freq = 0;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    freq++;
                }
            }
            return freq;
        }
        arrays.frequency = frequency;
        /**
         * Returns true if the two specified arrays are equal to one another.
         * Two arrays are considered equal if both arrays contain the same number
         * of elements, and all corresponding pairs of elements in the two
         * arrays are equal and are in the same order.
         * @param {Array} array1 one array to be tested for equality.
         * @param {Array} array2 the other array to be tested for equality.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between elemements in the arrays.
         * @return {boolean} true if the two arrays are equal
         */
        function equals(array1, array2, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            if (array1.length !== array2.length) {
                return false;
            }
            var length = array1.length;
            for (var i = 0; i < length; i++) {
                if (!equals(array1[i], array2[i])) {
                    return false;
                }
            }
            return true;
        }
        arrays.equals = equals;
        /**
         * Returns shallow a copy of the specified array.
         * @param {*} array the array to copy.
         * @return {Array} a copy of the specified array
         */
        function copy(array) {
            return array.concat();
        }
        arrays.copy = copy;
        /**
         * Swaps the elements at the specified positions in the specified array.
         * @param {Array} array The array in which to swap elements.
         * @param {number} i the index of one element to be swapped.
         * @param {number} j the index of the other element to be swapped.
         * @return {boolean} true if the array is defined and the indexes are valid.
         */
        function swap(array, i, j) {
            if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
                return false;
            }
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            return true;
        }
        arrays.swap = swap;
        function toString(array) {
            return '[' + array.toString() + ']';
        }
        arrays.toString = toString;
        /**
         * Executes the provided function once for each element present in this array
         * starting from index 0 to length - 1.
         * @param {Array} array The array in which to iterate.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        function forEach(array, callback) {
            var lenght = array.length;
            for (var i = 0; i < lenght; i++) {
                if (callback(array[i]) === false) {
                    return;
                }
            }
        }
        arrays.forEach = forEach;
    })(arrays = collections.arrays || (collections.arrays = {}));
    var LinkedList = (function () {
        /**
        * Creates an empty Linked List.
        * @class A linked list is a data structure consisting of a group of nodes
        * which together represent a sequence.
        * @constructor
        */
        function LinkedList() {
            /**
            * First node in the list
            * @type {Object}
            * @private
            */
            this.firstNode = null;
            /**
            * Last node in the list
            * @type {Object}
            * @private
            */
            this.lastNode = null;
            /**
            * Number of elements in the list
            * @type {number}
            * @private
            */
            this.nElements = 0;
        }
        /**
        * Adds an element to this list.
        * @param {Object} item element to be added.
        * @param {number=} index optional index to add the element. If no index is specified
        * the element is added to the end of this list.
        * @return {boolean} true if the element was added or false if the index is invalid
        * or if the element is undefined.
        */
        LinkedList.prototype.add = function (item, index) {
            if (collections.isUndefined(index)) {
                index = this.nElements;
            }
            if (index < 0 || index > this.nElements || collections.isUndefined(item)) {
                return false;
            }
            var newNode = this.createNode(item);
            if (this.nElements === 0) {
                // First node in the list.
                this.firstNode = newNode;
                this.lastNode = newNode;
            }
            else if (index === this.nElements) {
                // Insert at the end.
                this.lastNode.next = newNode;
                this.lastNode = newNode;
            }
            else if (index === 0) {
                // Change first node.
                newNode.next = this.firstNode;
                this.firstNode = newNode;
            }
            else {
                var prev = this.nodeAtIndex(index - 1);
                newNode.next = prev.next;
                prev.next = newNode;
            }
            this.nElements++;
            return true;
        };
        /**
        * Returns the first element in this list.
        * @return {*} the first element of the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.first = function () {
            if (this.firstNode !== null) {
                return this.firstNode.element;
            }
            return undefined;
        };
        /**
        * Returns the last element in this list.
        * @return {*} the last element in the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.last = function () {
            if (this.lastNode !== null) {
                return this.lastNode.element;
            }
            return undefined;
        };
        /**
         * Returns the element at the specified position in this list.
         * @param {number} index desired index.
         * @return {*} the element at the given index or undefined if the index is
         * out of bounds.
         */
        LinkedList.prototype.elementAtIndex = function (index) {
            var node = this.nodeAtIndex(index);
            if (node === null) {
                return undefined;
            }
            return node.element;
        };
        /**
         * Returns the index in this list of the first occurrence of the
         * specified element, or -1 if the List does not contain this element.
         * <p>If the elements inside this list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction Optional
         * function used to check if two elements are equal.
         * @return {number} the index in this list of the first occurrence
         * of the specified element, or -1 if this list does not contain the
         * element.
         */
        LinkedList.prototype.indexOf = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (collections.isUndefined(item)) {
                return -1;
            }
            var currentNode = this.firstNode;
            var index = 0;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    return index;
                }
                index++;
                currentNode = currentNode.next;
            }
            return -1;
        };
        /**
           * Returns true if this list contains the specified element.
           * <p>If the elements inside the list are
           * not comparable with the === operator a custom equals function should be
           * provided to perform searches, the function must receive two arguments and
           * return true if they are equal, false otherwise. Example:</p>
           *
           * <pre>
           * var petsAreEqualByName = function(pet1, pet2) {
           *  return pet1.name === pet2.name;
           * }
           * </pre>
           * @param {Object} item element to search for.
           * @param {function(Object,Object):boolean=} equalsFunction Optional
           * function used to check if two elements are equal.
           * @return {boolean} true if this list contains the specified element, false
           * otherwise.
           */
        LinkedList.prototype.contains = function (item, equalsFunction) {
            return (this.indexOf(item, equalsFunction) >= 0);
        };
        /**
         * Removes the first occurrence of the specified element in this list.
         * <p>If the elements inside the list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item element to be removed from this list, if present.
         * @return {boolean} true if the list contained the specified element.
         */
        LinkedList.prototype.remove = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (this.nElements < 1 || collections.isUndefined(item)) {
                return false;
            }
            var previous = null;
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    if (currentNode === this.firstNode) {
                        this.firstNode = this.firstNode.next;
                        if (currentNode === this.lastNode) {
                            this.lastNode = null;
                        }
                    }
                    else if (currentNode === this.lastNode) {
                        this.lastNode = previous;
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    else {
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    this.nElements--;
                    return true;
                }
                previous = currentNode;
                currentNode = currentNode.next;
            }
            return false;
        };
        /**
         * Removes all of the elements from this list.
         */
        LinkedList.prototype.clear = function () {
            this.firstNode = null;
            this.lastNode = null;
            this.nElements = 0;
        };
        /**
         * Returns true if this list is equal to the given list.
         * Two lists are equal if they have the same elements in the same order.
         * @param {LinkedList} other the other list.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function used to check if two elements are equal. If the elements in the lists
         * are custom objects you should provide a function, otherwise
         * the === operator is used to check equality between elements.
         * @return {boolean} true if this list is equal to the given list.
         */
        LinkedList.prototype.equals = function (other, equalsFunction) {
            var eqF = equalsFunction || collections.defaultEquals;
            if (!(other instanceof collections.LinkedList)) {
                return false;
            }
            if (this.size() !== other.size()) {
                return false;
            }
            return this.equalsAux(this.firstNode, other.firstNode, eqF);
        };
        /**
        * @private
        */
        LinkedList.prototype.equalsAux = function (n1, n2, eqF) {
            while (n1 !== null) {
                if (!eqF(n1.element, n2.element)) {
                    return false;
                }
                n1 = n1.next;
                n2 = n2.next;
            }
            return true;
        };
        /**
         * Removes the element at the specified position in this list.
         * @param {number} index given index.
         * @return {*} removed element or undefined if the index is out of bounds.
         */
        LinkedList.prototype.removeElementAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return undefined;
            }
            var element;
            if (this.nElements === 1) {
                //First node in the list.
                element = this.firstNode.element;
                this.firstNode = null;
                this.lastNode = null;
            }
            else {
                var previous = this.nodeAtIndex(index - 1);
                if (previous === null) {
                    element = this.firstNode.element;
                    this.firstNode = this.firstNode.next;
                }
                else if (previous.next === this.lastNode) {
                    element = this.lastNode.element;
                    this.lastNode = previous;
                }
                if (previous !== null) {
                    element = previous.next.element;
                    previous.next = previous.next.next;
                }
            }
            this.nElements--;
            return element;
        };
        /**
         * Executes the provided function once for each element present in this list in order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        LinkedList.prototype.forEach = function (callback) {
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (callback(currentNode.element) === false) {
                    break;
                }
                currentNode = currentNode.next;
            }
        };
        /**
         * Reverses the order of the elements in this linked list (makes the last
         * element first, and the first element last).
         */
        LinkedList.prototype.reverse = function () {
            var previous = null;
            var current = this.firstNode;
            var temp = null;
            while (current !== null) {
                temp = current.next;
                current.next = previous;
                previous = current;
                current = temp;
            }
            temp = this.firstNode;
            this.firstNode = this.lastNode;
            this.lastNode = temp;
        };
        /**
         * Returns an array containing all of the elements in this list in proper
         * sequence.
         * @return {Array.<*>} an array containing all of the elements in this list,
         * in proper sequence.
         */
        LinkedList.prototype.toArray = function () {
            var array = [];
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                array.push(currentNode.element);
                currentNode = currentNode.next;
            }
            return array;
        };
        /**
         * Returns the number of elements in this list.
         * @return {number} the number of elements in this list.
         */
        LinkedList.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this list contains no elements.
         * @return {boolean} true if this list contains no elements.
         */
        LinkedList.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        LinkedList.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        /**
         * @private
         */
        LinkedList.prototype.nodeAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return null;
            }
            if (index === (this.nElements - 1)) {
                return this.lastNode;
            }
            var node = this.firstNode;
            for (var i = 0; i < index; i++) {
                node = node.next;
            }
            return node;
        };
        /**
         * @private
         */
        LinkedList.prototype.createNode = function (item) {
            return {
                element: item,
                next: null
            };
        };
        return LinkedList;
    })();
    collections.LinkedList = LinkedList; // End of linked list 
    var Dictionary = (function () {
        /**
         * Creates an empty dictionary.
         * @class <p>Dictionaries map keys to values; each key can map to at most one value.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to unique
         * strings must be provided. Example:</p>
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         */
        function Dictionary(toStrFunction) {
            this.table = {};
            this.nElements = 0;
            this.toStr = toStrFunction || collections.defaultToString;
        }
        /**
         * Returns the value to which this dictionary maps the specified key.
         * Returns undefined if this dictionary contains no mapping for this key.
         * @param {Object} key key whose associated value is to be returned.
         * @return {*} the value to which this dictionary maps the specified key or
         * undefined if the map contains no mapping for this key.
         */
        Dictionary.prototype.getValue = function (key) {
            var pair = this.table['$' + this.toStr(key)];
            if (collections.isUndefined(pair)) {
                return undefined;
            }
            return pair.value;
        };
        /**
         * Associates the specified value with the specified key in this dictionary.
         * If the dictionary previously contained a mapping for this key, the old
         * value is replaced by the specified value.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value value to be associated with the specified key.
         * @return {*} previous value associated with the specified key, or undefined if
         * there was no mapping for the key or if the key/value are undefined.
         */
        Dictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return undefined;
            }
            var ret;
            var k = '$' + this.toStr(key);
            var previousElement = this.table[k];
            if (collections.isUndefined(previousElement)) {
                this.nElements++;
                ret = undefined;
            }
            else {
                ret = previousElement.value;
            }
            this.table[k] = {
                key: key,
                value: value
            };
            return ret;
        };
        /**
         * Removes the mapping for this key from this dictionary if it is present.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @return {*} previous value associated with specified key, or undefined if
         * there was no mapping for key.
         */
        Dictionary.prototype.remove = function (key) {
            var k = '$' + this.toStr(key);
            var previousElement = this.table[k];
            if (!collections.isUndefined(previousElement)) {
                delete this.table[k];
                this.nElements--;
                return previousElement.value;
            }
            return undefined;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        Dictionary.prototype.keys = function () {
            var array = [];
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    array.push(pair.key);
                }
            }
            return array;
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        Dictionary.prototype.values = function () {
            var array = [];
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    array.push(pair.value);
                }
            }
            return array;
        };
        /**
        * Executes the provided function once for each key-value pair
        * present in this dictionary.
        * @param {function(Object,Object):*} callback function to execute, it is
        * invoked with two arguments: key and value. To break the iteration you can
        * optionally return false.
        */
        Dictionary.prototype.forEach = function (callback) {
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    var ret = callback(pair.key, pair.value);
                    if (ret === false) {
                        return;
                    }
                }
            }
        };
        /**
         * Returns true if this dictionary contains a mapping for the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary contains a mapping for the
         * specified key.
         */
        Dictionary.prototype.containsKey = function (key) {
            return !collections.isUndefined(this.getValue(key));
        };
        /**
        * Removes all mappings from this dictionary.
        * @this {collections.Dictionary}
        */
        Dictionary.prototype.clear = function () {
            this.table = {};
            this.nElements = 0;
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        Dictionary.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        Dictionary.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        Dictionary.prototype.toString = function () {
            var toret = "{";
            this.forEach(function (k, v) {
                toret = toret + "\n\t" + k.toString() + " : " + v.toString();
            });
            return toret + "\n}";
        };
        return Dictionary;
    })();
    collections.Dictionary = Dictionary; // End of dictionary
    // /**
    //  * Returns true if this dictionary is equal to the given dictionary.
    //  * Two dictionaries are equal if they contain the same mappings.
    //  * @param {collections.Dictionary} other the other dictionary.
    //  * @param {function(Object,Object):boolean=} valuesEqualFunction optional
    //  * function used to check if two values are equal.
    //  * @return {boolean} true if this dictionary is equal to the given dictionary.
    //  */
    // collections.Dictionary.prototype.equals = function(other,valuesEqualFunction) {
    // 	var eqF = valuesEqualFunction || collections.defaultEquals;
    // 	if(!(other instanceof collections.Dictionary)){
    // 		return false;
    // 	}
    // 	if(this.size() !== other.size()){
    // 		return false;
    // 	}
    // 	return this.equalsAux(this.firstNode,other.firstNode,eqF);
    // }
    var MultiDictionary = (function () {
        /**
         * Creates an empty multi dictionary.
         * @class <p>A multi dictionary is a special kind of dictionary that holds
         * multiple values against each key. Setting a value into the dictionary will
         * add the value to an array at that key. Getting a key will return an array,
         * holding all the values set to that key.
         * You can configure to allow duplicates in the values.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to strings must be
         * provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
           *  return pet.name;
           * }
         * </pre>
         * <p>If the values are custom objects a function to check equality between values
         * must be provided. Example:</p>
         *
         * <pre>
         * function petsAreEqualByAge(pet1,pet2) {
           *  return pet1.age===pet2.age;
           * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         * @param {function(Object,Object):boolean=} valuesEqualsFunction optional
         * function to check if two values are equal.
         *
         * @param allowDuplicateValues
         */
        function MultiDictionary(toStrFunction, valuesEqualsFunction, allowDuplicateValues) {
            if (allowDuplicateValues === void 0) { allowDuplicateValues = false; }
            this.dict = new Dictionary(toStrFunction);
            this.equalsF = valuesEqualsFunction || collections.defaultEquals;
            this.allowDuplicate = allowDuplicateValues;
        }
        /**
        * Returns an array holding the values to which this dictionary maps
        * the specified key.
        * Returns an empty array if this dictionary contains no mappings for this key.
        * @param {Object} key key whose associated values are to be returned.
        * @return {Array} an array holding the values to which this dictionary maps
        * the specified key.
        */
        MultiDictionary.prototype.getValue = function (key) {
            var values = this.dict.getValue(key);
            if (collections.isUndefined(values)) {
                return [];
            }
            return collections.arrays.copy(values);
        };
        /**
         * Adds the value to the array associated with the specified key, if
         * it is not already present.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value the value to add to the array at the key
         * @return {boolean} true if the value was not already associated with that key.
         */
        MultiDictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return false;
            }
            if (!this.containsKey(key)) {
                this.dict.setValue(key, [value]);
                return true;
            }
            var array = this.dict.getValue(key);
            if (!this.allowDuplicate) {
                if (collections.arrays.contains(array, value, this.equalsF)) {
                    return false;
                }
            }
            array.push(value);
            return true;
        };
        /**
         * Removes the specified values from the array of values associated with the
         * specified key. If a value isn't given, all values associated with the specified
         * key are removed.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @param {Object=} value optional argument to specify the value to remove
         * from the array associated with the specified key.
         * @return {*} true if the dictionary changed, false if the key doesn't exist or
         * if the specified value isn't associated with the specified key.
         */
        MultiDictionary.prototype.remove = function (key, value) {
            if (collections.isUndefined(value)) {
                var v = this.dict.remove(key);
                return !collections.isUndefined(v);
            }
            var array = this.dict.getValue(key);
            if (collections.arrays.remove(array, value, this.equalsF)) {
                if (array.length === 0) {
                    this.dict.remove(key);
                }
                return true;
            }
            return false;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        MultiDictionary.prototype.keys = function () {
            return this.dict.keys();
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        MultiDictionary.prototype.values = function () {
            var values = this.dict.values();
            var array = [];
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                for (var j = 0; j < v.length; j++) {
                    array.push(v[j]);
                }
            }
            return array;
        };
        /**
         * Returns true if this dictionary at least one value associatted the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary at least one value associatted
         * the specified key.
         */
        MultiDictionary.prototype.containsKey = function (key) {
            return this.dict.containsKey(key);
        };
        /**
         * Removes all mappings from this dictionary.
         */
        MultiDictionary.prototype.clear = function () {
            this.dict.clear();
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        MultiDictionary.prototype.size = function () {
            return this.dict.size();
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        MultiDictionary.prototype.isEmpty = function () {
            return this.dict.isEmpty();
        };
        return MultiDictionary;
    })();
    collections.MultiDictionary = MultiDictionary; // end of multi dictionary 
    var Heap = (function () {
        /**
         * Creates an empty Heap.
         * @class
         * <p>A heap is a binary tree, where the nodes maintain the heap property:
         * each node is smaller than each of its children and therefore a MinHeap
         * This implementation uses an array to store elements.</p>
         * <p>If the inserted elements are custom objects a compare function must be provided,
         *  at construction time, otherwise the <=, === and >= operators are
         * used to compare elements. Example:</p>
         *
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * <p>If a Max-Heap is wanted (greater elements on top) you can a provide a
         * reverse compare function to accomplish that behavior. Example:</p>
         *
         * <pre>
         * function reverseCompare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return 1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return -1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two elements. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function Heap(compareFunction) {
            /**
             * Array used to store the elements od the heap.
             * @type {Array.<Object>}
             * @private
             */
            this.data = [];
            this.compare = compareFunction || collections.defaultCompare;
        }
        /**
         * Returns the index of the left child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the left child
         * for.
         * @return {number} The index of the left child.
         * @private
         */
        Heap.prototype.leftChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 1;
        };
        /**
         * Returns the index of the right child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the right child
         * for.
         * @return {number} The index of the right child.
         * @private
         */
        Heap.prototype.rightChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 2;
        };
        /**
         * Returns the index of the parent of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the parent for.
         * @return {number} The index of the parent.
         * @private
         */
        Heap.prototype.parentIndex = function (nodeIndex) {
            return Math.floor((nodeIndex - 1) / 2);
        };
        /**
         * Returns the index of the smaller child node (if it exists).
         * @param {number} leftChild left child index.
         * @param {number} rightChild right child index.
         * @return {number} the index with the minimum value or -1 if it doesn't
         * exists.
         * @private
         */
        Heap.prototype.minIndex = function (leftChild, rightChild) {
            if (rightChild >= this.data.length) {
                if (leftChild >= this.data.length) {
                    return -1;
                }
                else {
                    return leftChild;
                }
            }
            else {
                if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                    return leftChild;
                }
                else {
                    return rightChild;
                }
            }
        };
        /**
         * Moves the node at the given index up to its proper place in the heap.
         * @param {number} index The index of the node to move up.
         * @private
         */
        Heap.prototype.siftUp = function (index) {
            var parent = this.parentIndex(index);
            while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
                collections.arrays.swap(this.data, parent, index);
                index = parent;
                parent = this.parentIndex(index);
            }
        };
        /**
         * Moves the node at the given index down to its proper place in the heap.
         * @param {number} nodeIndex The index of the node to move down.
         * @private
         */
        Heap.prototype.siftDown = function (nodeIndex) {
            //smaller child index
            var min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            while (min >= 0 && this.compare(this.data[nodeIndex], this.data[min]) > 0) {
                collections.arrays.swap(this.data, min, nodeIndex);
                nodeIndex = min;
                min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            }
        };
        /**
         * Retrieves but does not remove the root element of this heap.
         * @return {*} The value at the root of the heap. Returns undefined if the
         * heap is empty.
         */
        Heap.prototype.peek = function () {
            if (this.data.length > 0) {
                return this.data[0];
            }
            else {
                return undefined;
            }
        };
        /**
         * Adds the given element into the heap.
         * @param {*} element the element.
         * @return true if the element was added or fals if it is undefined.
         */
        Heap.prototype.add = function (element) {
            if (collections.isUndefined(element)) {
                return undefined;
            }
            this.data.push(element);
            this.siftUp(this.data.length - 1);
            return true;
        };
        /**
         * Retrieves and removes the root element of this heap.
         * @return {*} The value removed from the root of the heap. Returns
         * undefined if the heap is empty.
         */
        Heap.prototype.removeRoot = function () {
            if (this.data.length > 0) {
                var obj = this.data[0];
                this.data[0] = this.data[this.data.length - 1];
                this.data.splice(this.data.length - 1, 1);
                if (this.data.length > 0) {
                    this.siftDown(0);
                }
                return obj;
            }
            return undefined;
        };
        /**
         * Returns true if this heap contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this Heap contains the specified element, false
         * otherwise.
         */
        Heap.prototype.contains = function (element) {
            var equF = collections.compareToEquals(this.compare);
            return collections.arrays.contains(this.data, element, equF);
        };
        /**
         * Returns the number of elements in this heap.
         * @return {number} the number of elements in this heap.
         */
        Heap.prototype.size = function () {
            return this.data.length;
        };
        /**
         * Checks if this heap is empty.
         * @return {boolean} true if and only if this heap contains no items; false
         * otherwise.
         */
        Heap.prototype.isEmpty = function () {
            return this.data.length <= 0;
        };
        /**
         * Removes all of the elements from this heap.
         */
        Heap.prototype.clear = function () {
            this.data.length = 0;
        };
        /**
         * Executes the provided function once for each element present in this heap in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Heap.prototype.forEach = function (callback) {
            collections.arrays.forEach(this.data, callback);
        };
        return Heap;
    })();
    collections.Heap = Heap;
    var Stack = (function () {
        /**
         * Creates an empty Stack.
         * @class A Stack is a Last-In-First-Out (LIFO) data structure, the last
         * element added to the stack will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Stack() {
            this.list = new LinkedList();
        }
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the element to be pushed onto this stack.
         * @return {boolean} true if the element was pushed or false if it is undefined.
         */
        Stack.prototype.push = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the element to be pushed onto this stack.
         * @return {boolean} true if the element was pushed or false if it is undefined.
         */
        Stack.prototype.add = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Removes the object at the top of this stack and returns that object.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.pop = function () {
            return this.list.removeElementAtIndex(0);
        };
        /**
         * Looks at the object at the top of this stack without removing it from the
         * stack.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.peek = function () {
            return this.list.first();
        };
        /**
         * Returns the number of elements in this stack.
         * @return {number} the number of elements in this stack.
         */
        Stack.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this stack contains the specified element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this stack contains the specified element,
         * false otherwise.
         */
        Stack.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this stack is empty.
         * @return {boolean} true if and only if this stack contains no items; false
         * otherwise.
         */
        Stack.prototype.isEmpty = function () {
            return this.list.isEmpty();
        };
        /**
         * Removes all of the elements from this stack.
         */
        Stack.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each element present in this stack in
         * LIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Stack.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Stack;
    })();
    collections.Stack = Stack; // End of stack 
    var Queue = (function () {
        /**
         * Creates an empty queue.
         * @class A queue is a First-In-First-Out (FIFO) data structure, the first
         * element added to the queue will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Queue() {
            this.list = new LinkedList();
        }
        /**
         * Inserts the specified element into the end of this queue.
         * @param {Object} elem the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        Queue.prototype.enqueue = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Inserts the specified element into the end of this queue.
         * @param {Object} elem the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        Queue.prototype.add = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Retrieves and removes the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.dequeue = function () {
            if (this.list.size() !== 0) {
                var el = this.list.first();
                this.list.removeElementAtIndex(0);
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.peek = function () {
            if (this.list.size() !== 0) {
                return this.list.first();
            }
            return undefined;
        };
        /**
         * Returns the number of elements in this queue.
         * @return {number} the number of elements in this queue.
         */
        Queue.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this queue contains the specified element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this queue contains the specified element,
         * false otherwise.
         */
        Queue.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this queue is empty.
         * @return {boolean} true if and only if this queue contains no items; false
         * otherwise.
         */
        Queue.prototype.isEmpty = function () {
            return this.list.size() <= 0;
        };
        /**
         * Removes all of the elements from this queue.
         */
        Queue.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each element present in this queue in
         * FIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Queue.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Queue;
    })();
    collections.Queue = Queue; // End of queue
    var PriorityQueue = (function () {
        /**
         * Creates an empty priority queue.
         * @class <p>In a priority queue each element is associated with a "priority",
         * elements are dequeued in highest-priority-first order (the elements with the
         * highest priority are dequeued first). Priority Queues are implemented as heaps.
         * If the inserted elements are custom objects a compare function must be provided,
         * otherwise the <=, === and >= operators are used to compare object priority.</p>
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two element priorities. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function PriorityQueue(compareFunction) {
            this.heap = new Heap(collections.reverseCompareFunction(compareFunction));
        }
        /**
         * Inserts the specified element into this priority queue.
         * @param {Object} element the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.enqueue = function (element) {
            return this.heap.add(element);
        };
        /**
         * Inserts the specified element into this priority queue.
         * @param {Object} element the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.add = function (element) {
            return this.heap.add(element);
        };
        /**
         * Retrieves and removes the highest priority element of this queue.
         * @return {*} the the highest priority element of this queue,
         *  or undefined if this queue is empty.
         */
        PriorityQueue.prototype.dequeue = function () {
            if (this.heap.size() !== 0) {
                var el = this.heap.peek();
                this.heap.removeRoot();
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the highest priority element of this queue.
         * @return {*} the highest priority element of this queue, or undefined if this queue is empty.
         */
        PriorityQueue.prototype.peek = function () {
            return this.heap.peek();
        };
        /**
         * Returns true if this priority queue contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this priority queue contains the specified element,
         * false otherwise.
         */
        PriorityQueue.prototype.contains = function (element) {
            return this.heap.contains(element);
        };
        /**
         * Checks if this priority queue is empty.
         * @return {boolean} true if and only if this priority queue contains no items; false
         * otherwise.
         */
        PriorityQueue.prototype.isEmpty = function () {
            return this.heap.isEmpty();
        };
        /**
         * Returns the number of elements in this priority queue.
         * @return {number} the number of elements in this priority queue.
         */
        PriorityQueue.prototype.size = function () {
            return this.heap.size();
        };
        /**
         * Removes all of the elements from this priority queue.
         */
        PriorityQueue.prototype.clear = function () {
            this.heap.clear();
        };
        /**
         * Executes the provided function once for each element present in this queue in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        PriorityQueue.prototype.forEach = function (callback) {
            this.heap.forEach(callback);
        };
        return PriorityQueue;
    })();
    collections.PriorityQueue = PriorityQueue; // end of priority queue
    var Set = (function () {
        /**
         * Creates an empty set.
         * @class <p>A set is a data structure that contains no duplicate items.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStringFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives a onject and returns a
         * unique string must be provided.
         */
        function Set(toStringFunction) {
            this.dictionary = new Dictionary(toStringFunction);
        }
        /**
         * Returns true if this set contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this set contains the specified element,
         * false otherwise.
         */
        Set.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
         * Adds the specified element to this set if it is not already present.
         * @param {Object} element the element to insert.
         * @return {boolean} true if this set did not already contain the specified element.
         */
        Set.prototype.add = function (element) {
            if (this.contains(element) || collections.isUndefined(element)) {
                return false;
            }
            else {
                this.dictionary.setValue(element, element);
                return true;
            }
        };
        /**
         * Performs an intersecion between this an another set.
         * Removes all values that are not present this set and the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.intersection = function (otherSet) {
            var set = this;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    set.remove(element);
                }
                return true;
            });
        };
        /**
         * Performs a union between this an another set.
         * Adds all values from the given set to this set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.union = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.add(element);
                return true;
            });
        };
        /**
         * Performs a difference between this an another set.
         * Removes from this set all the values that are present in the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.difference = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.remove(element);
                return true;
            });
        };
        /**
         * Checks whether the given set contains all the elements in this set.
         * @param {collections.Set} otherSet other set.
         * @return {boolean} true if this set is a subset of the given set.
         */
        Set.prototype.isSubsetOf = function (otherSet) {
            if (this.size() > otherSet.size()) {
                return false;
            }
            var isSub = true;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    isSub = false;
                    return false;
                }
                return true;
            });
            return isSub;
        };
        /**
         * Removes the specified element from this set if it is present.
         * @return {boolean} true if this set contained the specified element.
         */
        Set.prototype.remove = function (element) {
            if (!this.contains(element)) {
                return false;
            }
            else {
                this.dictionary.remove(element);
                return true;
            }
        };
        /**
         * Executes the provided function once for each element
         * present in this set.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one arguments: the element. To break the iteration you can
         * optionally return false.
         */
        Set.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                return callback(v);
            });
        };
        /**
         * Returns an array containing all of the elements in this set in arbitrary order.
         * @return {Array} an array containing all of the elements in this set.
         */
        Set.prototype.toArray = function () {
            return this.dictionary.values();
        };
        /**
         * Returns true if this set contains no elements.
         * @return {boolean} true if this set contains no elements.
         */
        Set.prototype.isEmpty = function () {
            return this.dictionary.isEmpty();
        };
        /**
         * Returns the number of elements in this set.
         * @return {number} the number of elements in this set.
         */
        Set.prototype.size = function () {
            return this.dictionary.size();
        };
        /**
         * Removes all of the elements from this set.
         */
        Set.prototype.clear = function () {
            this.dictionary.clear();
        };
        /*
        * Provides a string representation for display
        */
        Set.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        return Set;
    })();
    collections.Set = Set; // end of Set
    var Bag = (function () {
        /**
         * Creates an empty bag.
         * @class <p>A bag is a special kind of set in which members are
         * allowed to appear more than once.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to unique strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives an object and returns a
         * unique string must be provided.
         */
        function Bag(toStrFunction) {
            this.toStrF = toStrFunction || collections.defaultToString;
            this.dictionary = new Dictionary(this.toStrF);
            this.nElements = 0;
        }
        /**
        * Adds nCopies of the specified object to this bag.
        * @param {Object} element element to add.
        * @param {number=} nCopies the number of copies to add, if this argument is
        * undefined 1 copy is added.
        * @return {boolean} true unless element is undefined.
        */
        Bag.prototype.add = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                var node = {
                    value: element,
                    copies: nCopies
                };
                this.dictionary.setValue(element, node);
            }
            else {
                this.dictionary.getValue(element).copies += nCopies;
            }
            this.nElements += nCopies;
            return true;
        };
        /**
        * Counts the number of copies of the specified object in this bag.
        * @param {Object} element the object to search for..
        * @return {number} the number of copies of the object, 0 if not found
        */
        Bag.prototype.count = function (element) {
            if (!this.contains(element)) {
                return 0;
            }
            else {
                return this.dictionary.getValue(element).copies;
            }
        };
        /**
         * Returns true if this bag contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this bag contains the specified element,
         * false otherwise.
         */
        Bag.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
        * Removes nCopies of the specified object to this bag.
        * If the number of copies to remove is greater than the actual number
        * of copies in the Bag, all copies are removed.
        * @param {Object} element element to remove.
        * @param {number=} nCopies the number of copies to remove, if this argument is
        * undefined 1 copy is removed.
        * @return {boolean} true if at least 1 element was removed.
        */
        Bag.prototype.remove = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                return false;
            }
            else {
                var node = this.dictionary.getValue(element);
                if (nCopies > node.copies) {
                    this.nElements -= node.copies;
                }
                else {
                    this.nElements -= nCopies;
                }
                node.copies -= nCopies;
                if (node.copies <= 0) {
                    this.dictionary.remove(element);
                }
                return true;
            }
        };
        /**
         * Returns an array containing all of the elements in this big in arbitrary order,
         * including multiple copies.
         * @return {Array} an array containing all of the elements in this bag.
         */
        Bag.prototype.toArray = function () {
            var a = [];
            var values = this.dictionary.values();
            var vl = values.length;
            for (var i = 0; i < vl; i++) {
                var node = values[i];
                var element = node.value;
                var copies = node.copies;
                for (var j = 0; j < copies; j++) {
                    a.push(element);
                }
            }
            return a;
        };
        /**
         * Returns a set of unique elements in this bag.
         * @return {collections.Set<T>} a set of unique elements in this bag.
         */
        Bag.prototype.toSet = function () {
            var toret = new Set(this.toStrF);
            var elements = this.dictionary.values();
            var l = elements.length;
            for (var i = 0; i < l; i++) {
                var value = elements[i].value;
                toret.add(value);
            }
            return toret;
        };
        /**
         * Executes the provided function once for each element
         * present in this bag, including multiple copies.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element. To break the iteration you can
         * optionally return false.
         */
        Bag.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                var value = v.value;
                var copies = v.copies;
                for (var i = 0; i < copies; i++) {
                    if (callback(value) === false) {
                        return false;
                    }
                }
                return true;
            });
        };
        /**
         * Returns the number of elements in this bag.
         * @return {number} the number of elements in this bag.
         */
        Bag.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this bag contains no elements.
         * @return {boolean} true if this bag contains no elements.
         */
        Bag.prototype.isEmpty = function () {
            return this.nElements === 0;
        };
        /**
         * Removes all of the elements from this bag.
         */
        Bag.prototype.clear = function () {
            this.nElements = 0;
            this.dictionary.clear();
        };
        return Bag;
    })();
    collections.Bag = Bag; // End of bag 
    var BSTree = (function () {
        /**
         * Creates an empty binary search tree.
         * @class <p>A binary search tree is a binary tree in which each
         * internal node stores an element such that the elements stored in the
         * left subtree are less than it and the elements
         * stored in the right subtree are greater.</p>
         * <p>Formally, a binary search tree is a node-based binary tree data structure which
         * has the following properties:</p>
         * <ul>
         * <li>The left subtree of a node contains only nodes with elements less
         * than the node's element</li>
         * <li>The right subtree of a node contains only nodes with elements greater
         * than the node's element</li>
         * <li>Both the left and right subtrees must also be binary search trees.</li>
         * </ul>
         * <p>If the inserted elements are custom objects a compare function must
         * be provided at construction time, otherwise the <=, === and >= operators are
         * used to compare elements. Example:</p>
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two elements. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function BSTree(compareFunction) {
            this.root = null;
            this.compare = compareFunction || collections.defaultCompare;
            this.nElements = 0;
        }
        /**
         * Adds the specified element to this tree if it is not already present.
         * @param {Object} element the element to insert.
         * @return {boolean} true if this tree did not already contain the specified element.
         */
        BSTree.prototype.add = function (element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            if (this.insertNode(this.createNode(element)) !== null) {
                this.nElements++;
                return true;
            }
            return false;
        };
        /**
         * Removes all of the elements from this tree.
         */
        BSTree.prototype.clear = function () {
            this.root = null;
            this.nElements = 0;
        };
        /**
         * Returns true if this tree contains no elements.
         * @return {boolean} true if this tree contains no elements.
         */
        BSTree.prototype.isEmpty = function () {
            return this.nElements === 0;
        };
        /**
         * Returns the number of elements in this tree.
         * @return {number} the number of elements in this tree.
         */
        BSTree.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this tree contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this tree contains the specified element,
         * false otherwise.
         */
        BSTree.prototype.contains = function (element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            return this.searchNode(this.root, element) !== null;
        };
        /**
         * Removes the specified element from this tree if it is present.
         * @return {boolean} true if this tree contained the specified element.
         */
        BSTree.prototype.remove = function (element) {
            var node = this.searchNode(this.root, element);
            if (node === null) {
                return false;
            }
            this.removeNode(node);
            this.nElements--;
            return true;
        };
        /**
         * Executes the provided function once for each element present in this tree in
         * in-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.inorderTraversal = function (callback) {
            this.inorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in pre-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.preorderTraversal = function (callback) {
            this.preorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in post-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.postorderTraversal = function (callback) {
            this.postorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in
         * level-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.levelTraversal = function (callback) {
            this.levelTraversalAux(this.root, callback);
        };
        /**
         * Returns the minimum element of this tree.
         * @return {*} the minimum element of this tree or undefined if this tree is
         * is empty.
         */
        BSTree.prototype.minimum = function () {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.minimumAux(this.root).element;
        };
        /**
         * Returns the maximum element of this tree.
         * @return {*} the maximum element of this tree or undefined if this tree is
         * is empty.
         */
        BSTree.prototype.maximum = function () {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.maximumAux(this.root).element;
        };
        /**
         * Executes the provided function once for each element present in this tree in inorder.
         * Equivalent to inorderTraversal.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        BSTree.prototype.forEach = function (callback) {
            this.inorderTraversal(callback);
        };
        /**
         * Returns an array containing all of the elements in this tree in in-order.
         * @return {Array} an array containing all of the elements in this tree in in-order.
         */
        BSTree.prototype.toArray = function () {
            var array = [];
            this.inorderTraversal(function (element) {
                array.push(element);
                return true;
            });
            return array;
        };
        /**
         * Returns the height of this tree.
         * @return {number} the height of this tree or -1 if is empty.
         */
        BSTree.prototype.height = function () {
            return this.heightAux(this.root);
        };
        /**
        * @private
        */
        BSTree.prototype.searchNode = function (node, element) {
            var cmp = null;
            while (node !== null && cmp !== 0) {
                cmp = this.compare(element, node.element);
                if (cmp < 0) {
                    node = node.leftCh;
                }
                else if (cmp > 0) {
                    node = node.rightCh;
                }
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.transplant = function (n1, n2) {
            if (n1.parent === null) {
                this.root = n2;
            }
            else if (n1 === n1.parent.leftCh) {
                n1.parent.leftCh = n2;
            }
            else {
                n1.parent.rightCh = n2;
            }
            if (n2 !== null) {
                n2.parent = n1.parent;
            }
        };
        /**
        * @private
        */
        BSTree.prototype.removeNode = function (node) {
            if (node.leftCh === null) {
                this.transplant(node, node.rightCh);
            }
            else if (node.rightCh === null) {
                this.transplant(node, node.leftCh);
            }
            else {
                var y = this.minimumAux(node.rightCh);
                if (y.parent !== node) {
                    this.transplant(y, y.rightCh);
                    y.rightCh = node.rightCh;
                    y.rightCh.parent = y;
                }
                this.transplant(node, y);
                y.leftCh = node.leftCh;
                y.leftCh.parent = y;
            }
        };
        /**
        * @private
        */
        BSTree.prototype.inorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.rightCh, callback, signal);
        };
        /**
        * @private
        */
        BSTree.prototype.levelTraversalAux = function (node, callback) {
            var queue = new Queue();
            if (node !== null) {
                queue.enqueue(node);
            }
            while (!queue.isEmpty()) {
                node = queue.dequeue();
                if (callback(node.element) === false) {
                    return;
                }
                if (node.leftCh !== null) {
                    queue.enqueue(node.leftCh);
                }
                if (node.rightCh !== null) {
                    queue.enqueue(node.rightCh);
                }
            }
        };
        /**
        * @private
        */
        BSTree.prototype.preorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.rightCh, callback, signal);
        };
        /**
        * @private
        */
        BSTree.prototype.postorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.rightCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
        };
        /**
        * @private
        */
        BSTree.prototype.minimumAux = function (node) {
            while (node.leftCh !== null) {
                node = node.leftCh;
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.maximumAux = function (node) {
            while (node.rightCh !== null) {
                node = node.rightCh;
            }
            return node;
        };
        /**
          * @private
          */
        BSTree.prototype.heightAux = function (node) {
            if (node === null) {
                return -1;
            }
            return Math.max(this.heightAux(node.leftCh), this.heightAux(node.rightCh)) + 1;
        };
        /*
        * @private
        */
        BSTree.prototype.insertNode = function (node) {
            var parent = null;
            var position = this.root;
            var cmp = null;
            while (position !== null) {
                cmp = this.compare(node.element, position.element);
                if (cmp === 0) {
                    return null;
                }
                else if (cmp < 0) {
                    parent = position;
                    position = position.leftCh;
                }
                else {
                    parent = position;
                    position = position.rightCh;
                }
            }
            node.parent = parent;
            if (parent === null) {
                // tree is empty
                this.root = node;
            }
            else if (this.compare(node.element, parent.element) < 0) {
                parent.leftCh = node;
            }
            else {
                parent.rightCh = node;
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.createNode = function (element) {
            return {
                element: element,
                leftCh: null,
                rightCh: null,
                parent: null
            };
        };
        return BSTree;
    })();
    collections.BSTree = BSTree; // end of BSTree
})(collections || (collections = {})); // End of module  
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    var Color = (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 0; }
            if (g === void 0) { g = 0; }
            if (b === void 0) { b = 0; }
            if (a === void 0) { a = 0xff; }
            this._r = 0;
            this._g = 0;
            this._b = 0;
            this._float_a = 1;
            this._a = 0xff;
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Object.defineProperty(Color.prototype, "r", {
            get: function () {
                return this._r;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._r = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            get: function () {
                return this._g;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._g = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            get: function () {
                return this._b;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._b = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            get: function () {
                return this._b;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._a = value;
                this._float_a = value / 255;
            },
            enumerable: true,
            configurable: true
        });
        Color.prototype.toARGBInt = function () {
            var result = (this._a << 24) || (this._r << 16) | (this._g << 8) | (this._b);
            return result;
        };
        Color.prototype.toRGBAInt = function () {
            var result = (this._r << 24) | (this._g << 16) | (this._b << 8) || (this._a);
            return result;
        };
        Color.fromRGBInt = function (value) {
            var clr = new Color((value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff);
            return clr;
        };
        Color.prototype.toRGBStyle = function () {
            return "rgb(" + this._r.toFixed(0) + "," + this._g.toFixed(0) + "," + this._b.toFixed(0) + ")";
        };
        Color.prototype.toRGBAStyle = function () {
            return "rgba(" + this._r.toFixed(0) + "," + this._g.toFixed(0) + "," + this._b.toFixed(0) + "," + this._float_a.toString() + ")";
        };
        Color.fromARGBInt = function (value) {
            var clr = new Color((value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff, (value >> 24) & 0xff);
            return clr;
        };
        Color.fromRGBAInt = function (value) {
            var clr = new Color((value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff);
            return clr;
        };
        return Color;
    })();
    TSObeliskSimulator.Color = Color;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    //マップデータ保持クラス
    var MapData = (function () {
        function MapData() {
            // キープ設置可能距離
            this._keepSetDistance = TSObeliskSimulator.ObeSimConst.DEF_KEEP_SET_DISTANCE;
            // キャッスル座標
            this._defCastlePosition = new Array();
            // クリスタル座標
            this._crystalPosition = new Array();
        }
        Object.defineProperty(MapData.prototype, "mapID", {
            get: function () {
                return this._mapID;
            },
            set: function (value) {
                this._mapID = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapData.prototype, "mapName", {
            get: function () {
                return this._mapName;
            },
            set: function (value) {
                this._mapName = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapData.prototype, "imageUrl", {
            get: function () {
                return this._imageUrl;
            },
            set: function (value) {
                this._imageUrl = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapData.prototype, "keepSetDistance", {
            get: function () {
                return this._keepSetDistance;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._keepSetDistance = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapData.prototype, "defCastlePosition", {
            get: function () {
                return this._defCastlePosition;
            },
            set: function (value) {
                this._defCastlePosition = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapData.prototype, "crystalPosition", {
            get: function () {
                return this._crystalPosition;
            },
            set: function (value) {
                this._crystalPosition = value;
            },
            enumerable: true,
            configurable: true
        });
        return MapData;
    })();
    TSObeliskSimulator.MapData = MapData;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    //アプリ用定数
    var ObeSimConst = (function () {
        function ObeSimConst() {
        }
        ObeSimConst.MAX_OBELISK = 25; // 最大オベリスク数
        ObeSimConst.MAX_ECLIPSE = 5; // 最大エクリプス数
        ObeSimConst.MAX_ARROWTOWER = 10; // 最大アロータワー数
        ObeSimConst.MAX_BULLWORK = 3; // 最大ブルワーク数
        ObeSimConst.MAX_CRYSTAL = 10; // クリスタル数
        ObeSimConst.DEF_KEEP_SET_DISTANCE = 128; // キープ設置可能距離
        ObeSimConst.COLOR_ATK_TERRITORY = TSObeliskSimulator.Color.fromRGBInt(0xff7f00); // 攻撃側支配領域の色
        ObeSimConst.COLOR_DEF_TERRITORY = TSObeliskSimulator.Color.fromRGBInt(0x007fff); // 防衛側支配領域の色
        ObeSimConst.COLOR_KEEP_SET_DISTANCE = TSObeliskSimulator.Color.fromRGBInt(0xffffff); // キープ設置可能距離の円の色
        ObeSimConst.COLOR_CENTER_LINE = TSObeliskSimulator.Color.fromRGBInt(0x00ff00); // キープ設置可能距離の円の色
        ObeSimConst.COLOR_BUTTON_ON = "lemonchiffon"; // ボタンON時の色
        ObeSimConst.RANGE_CASTLE = 80;
        ObeSimConst.RANGE_OBELISK = 80;
        ObeSimConst.RANGE_ECLIPSE = 56;
        ObeSimConst.MAP_PATH = "mapdata/MapList.xml";
        return ObeSimConst;
    })();
    TSObeliskSimulator.ObeSimConst = ObeSimConst;
    /// <summary>
    /// 設置する建築物種別。
    /// </summary>
    (function (BuildingConst) {
        BuildingConst[BuildingConst["None"] = 0] = "None";
        BuildingConst[BuildingConst["AtkCastle"] = 1] = "AtkCastle";
        BuildingConst[BuildingConst["AtkObelisk"] = 2] = "AtkObelisk";
        BuildingConst[BuildingConst["AtkEclipse"] = 3] = "AtkEclipse";
        BuildingConst[BuildingConst["AtkArrowTower"] = 4] = "AtkArrowTower";
        BuildingConst[BuildingConst["AtkGateOfHades"] = 5] = "AtkGateOfHades";
        BuildingConst[BuildingConst["AtkWarCraft"] = 6] = "AtkWarCraft";
        BuildingConst[BuildingConst["AtkBullwork"] = 7] = "AtkBullwork";
        BuildingConst[BuildingConst["Crystal"] = 8] = "Crystal";
        BuildingConst[BuildingConst["DefCastle"] = 9] = "DefCastle";
        BuildingConst[BuildingConst["DefObelisk"] = 10] = "DefObelisk";
        BuildingConst[BuildingConst["DefEclipse"] = 11] = "DefEclipse";
        BuildingConst[BuildingConst["DefArrowTower"] = 12] = "DefArrowTower";
        BuildingConst[BuildingConst["DefGateOfHades"] = 13] = "DefGateOfHades";
        BuildingConst[BuildingConst["DefWarCraft"] = 14] = "DefWarCraft";
        BuildingConst[BuildingConst["DefBullwork"] = 15] = "DefBullwork";
        BuildingConst[BuildingConst["Delete"] = 16] = "Delete";
        BuildingConst[BuildingConst["MAX"] = BuildingConst.Delete] = "MAX";
    })(TSObeliskSimulator.BuildingConst || (TSObeliskSimulator.BuildingConst = {}));
    var BuildingConst = TSObeliskSimulator.BuildingConst;
    /// <summary>
    /// 領域種別定数。
    /// </summary>
    (function (TerritoryType) {
        TerritoryType[TerritoryType["Castle"] = 0] = "Castle";
        TerritoryType[TerritoryType["Obelisk"] = 1] = "Obelisk";
        TerritoryType[TerritoryType["Eclipse"] = 2] = "Eclipse";
    })(TSObeliskSimulator.TerritoryType || (TSObeliskSimulator.TerritoryType = {}));
    var TerritoryType = TSObeliskSimulator.TerritoryType;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    //座標保持用クラス
    var Point = (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this._x = -1;
            this._y = -1;
            this._x = x;
            this._y = y;
        }
        Point.prototype.clone = function () {
            return new Point(this._x, this._y);
        };
        Object.defineProperty(Point.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._y = value;
            },
            enumerable: true,
            configurable: true
        });
        return Point;
    })();
    TSObeliskSimulator.Point = Point;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    var Slider = (function () {
        function Slider(elm) {
            this._drugging = false;
            this._min = 0;
            this._max = 100;
            var _this = this;
            this._elmBody = elm;
            this._elmGage = document.createElement("div");
            this._elmGage.className = "tso-slider-gage";
            this._elmGage.style.position = "absolute";
            this._elmGage.style.left = "0px";
            this._elmGage.style.top = "0px";
            $(this._elmGage).width(0);
            $(this._elmGage).height($(elm).height());
            elm.appendChild(this._elmGage);
            elm.onmousemove = function (ev) {
                _this.onmousemove(ev);
            };
            elm.onmousedown = function (ev) {
                _this.onmousedown(ev);
            };
            elm.onmouseup = function (ev) {
            };
            var oldDocMouseUp = document.onmouseup;
            document.onmouseup = function (ev) {
                if (!TSObeliskSimulator.isEmpty(oldDocMouseUp)) {
                    oldDocMouseUp(ev);
                }
                _this.onmouseup(ev);
            };
            this.max = Number(elm.getAttribute("max"));
            this.min = Number(elm.getAttribute("min"));
            this.value = Number(elm.getAttribute("value"));
        }
        Slider.prototype.getInstance = function () {
            return this._instance;
        };
        Object.defineProperty(Slider.prototype, "min", {
            get: function () {
                return this._min;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._min = value;
                this._elmBody.setAttribute("min", value.toString());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slider.prototype, "max", {
            get: function () {
                return this._max;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                this._max = value;
                this._elmBody.setAttribute("max", value.toString());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slider.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                if (isNaN(value)) {
                    return;
                }
                else if (value > this.max) {
                    value = this.max;
                }
                else if (value < this.min) {
                    value = this.min;
                }
                this._value = Math.floor(value);
                this._elmBody.setAttribute("value", value.toString());
                this.setGage(value);
                this.onchange(value);
            },
            enumerable: true,
            configurable: true
        });
        Slider.prototype.onmousemove = function (ev) {
            var x = 0;
            if (!ev) {
                x = window.event.offsetX;
            }
            else {
                x = Number(ev.offsetX);
            }
            if (this._drugging) {
                var bodyWidth = $(this._elmBody).width();
                var value = this.min + ((this.max - this.min) * (x / bodyWidth));
                this.value = value;
            }
        };
        Slider.prototype.onmouseup = function (ev) {
            this._drugging = false;
        };
        Slider.prototype.onmousedown = function (ev) {
            this._drugging = true;
            this.onmousemove(ev);
        };
        Slider.prototype.setGage = function (value) {
            var bodyWidth = $(this._elmBody).width();
            var valueWidth = this.max - this.min;
            var valuePos = (value - this.min) / valueWidth * bodyWidth;
            $(this._elmGage).width(valuePos);
        };
        Slider.prototype.onchange = function (value) {
        };
        return Slider;
    })();
    TSObeliskSimulator.Slider = Slider;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    /// <summary>
    /// スプライト円表示クラス。
    /// </summary>
    var SpriteEllipse = (function () {
        function SpriteEllipse(width) {
            if (width === void 0) { width = 0; }
            this._width = 0;
            this._center = new TSObeliskSimulator.Point(0, 0); // スプライトの中心座標
            this._position = new TSObeliskSimulator.Point(0, 0); // 現在座標
            this._opacity = 1;
            this._visible = false;
            this._strokeColor = new TSObeliskSimulator.Color(0xff, 0xff, 0xff); // 線の色
            this._fill = false; // 塗りつぶし
            this._lineWidth = 1;
            if (width > 0) {
                this._width = width;
            }
        }
        Object.defineProperty(SpriteEllipse.prototype, "visible", {
            get: function () {
                return this._visible;
            },
            set: function (value) {
                this._visible = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteEllipse.prototype, "strokeColor", {
            get: function () {
                return this._strokeColor;
            },
            set: function (value) {
                this._strokeColor = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteEllipse.prototype, "fill", {
            get: function () {
                return this._fill;
            },
            set: function (value) {
                this._fill = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteEllipse.prototype, "opacity", {
            get: function () {
                return this._opacity;
            },
            /// <summary>
            /// 透明度。
            /// </summary>
            set: function (value) {
                this._opacity = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteEllipse.prototype, "width", {
            get: function () {
                return this._width;
            },
            /// <summary>
            /// 幅。
            /// </summary>
            set: function (value) {
                this._width = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteEllipse.prototype, "height", {
            get: function () {
                return this.width;
            },
            /// <summary>
            /// 高さ。
            /// </summary>
            set: function (value) {
                this.width = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteEllipse.prototype, "center", {
            get: function () {
                return this._center;
            },
            /// <summary>
            /// 中心座標。
            /// </summary>
            set: function (value) {
                this._center = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteEllipse.prototype, "position", {
            get: function () {
                return this._position;
            },
            /// <summary>
            /// 座標。
            /// </summary>
            set: function (value) {
                this._position = value;
            },
            enumerable: true,
            configurable: true
        });
        /// <summary>
        /// 点との命中判定。
        /// </summary>
        /// <param name="pt">判定対象の座標。</param>
        /// <returns>true:当たっている false:当たっていない</returns>
        SpriteEllipse.prototype.isHit = function (pt) {
            var length = TSObeliskSimulator.Util.pointDistance(pt, this._position);
            if (length <= (this._width / 2)) {
                return true;
            }
            return false;
        };
        SpriteEllipse.prototype.draw = function (ctxDst) {
            if (!this.visible || this._opacity == 0) {
                return;
            }
            ctxDst.globalAlpha = this._opacity;
            ctxDst.beginPath();
            ctxDst.lineWidth = this._lineWidth;
            ctxDst.arc(this._position.x, this._position.y, this._width / 2, 0, Math.PI * 2);
            if (this._fill) {
                ctxDst.fillStyle = this._strokeColor.toRGBAStyle();
                ctxDst.fill();
            }
            else {
                ctxDst.strokeStyle = this._strokeColor.toRGBAStyle();
                ctxDst.stroke();
            }
            ctxDst.globalAlpha = 1;
        };
        return SpriteEllipse;
    })();
    TSObeliskSimulator.SpriteEllipse = SpriteEllipse;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    /// <summary>
    /// スプライト画像表示用クラス。
    /// </summary>
    var SpriteImage = (function () {
        function SpriteImage(width, height) {
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this._center = new TSObeliskSimulator.Point(); // スプライトの中心座標
            this._position = new TSObeliskSimulator.Point(); // 現在座標
            this._opacity = 1;
            this._canvas = document.createElement("canvas");
            this._canvas.width = width;
            this._canvas.height = height;
            this._ctx = this._canvas.getContext("2d");
            //this.visible = false;
            this.onload = function () {
            };
        }
        Object.defineProperty(SpriteImage.prototype, "visible", {
            get: function () {
                return this._canvas.style.visibility == "visible";
            },
            set: function (value) {
                if (value) {
                    this._canvas.style.visibility = "visible";
                }
                else {
                    this._canvas.style.visibility = "hidden";
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteImage.prototype, "opacity", {
            get: function () {
                return this._opacity;
            },
            /// <summary>
            /// 透明度。
            /// </summary>
            set: function (value) {
                this._opacity = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteImage.prototype, "width", {
            get: function () {
                return this._canvas.width;
            },
            /// <summary>
            /// 幅。
            /// </summary>
            set: function (value) {
                this._canvas.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteImage.prototype, "height", {
            get: function () {
                return this._canvas.height;
            },
            /// <summary>
            /// 高さ。
            /// </summary>
            set: function (value) {
                this._canvas.height = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteImage.prototype, "center", {
            get: function () {
                return this._center;
            },
            /// <summary>
            /// 中心座標。
            /// </summary>
            set: function (value) {
                this._center = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteImage.prototype, "position", {
            get: function () {
                return this._position;
            },
            /// <summary>
            /// 座標。
            /// </summary>
            set: function (value) {
                this._position = value;
            },
            enumerable: true,
            configurable: true
        });
        /// <summary>
        /// 点との命中判定。
        /// </summary>
        /// <param name="pt">判定対象の座標。</param>
        /// <returns>true:当たっている false:当たっていない</returns>
        SpriteImage.prototype.isHit = function (pt) {
            var x = this._position.x;
            var y = this._position.y;
            if (pt.x >= (x - (this.width / 2))) {
                if (pt.x <= x + (this.width / 2)) {
                    if (pt.y >= y - (this.height / 2)) {
                        if (pt.y <= y + (this.height / 2)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        SpriteImage.prototype.getPixel = function (x, y) {
            var imgData = this.Context.getImageData(x, y, 1, 1);
            var pixel = (imgData.data[0] << 24) | (imgData.data[1] << 16) | (imgData.data[2] << 8) | imgData.data[3];
            return pixel;
        };
        Object.defineProperty(SpriteImage.prototype, "Canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpriteImage.prototype, "Context", {
            get: function () {
                return this._ctx;
            },
            enumerable: true,
            configurable: true
        });
        /// <summary>
        /// 指定色で全体を塗りつぶす。
        /// </summary>
        SpriteImage.prototype.clear = function (color) {
            if (color === void 0) { color = new TSObeliskSimulator.Color(0, 0, 0, 0); }
            var imgData = this.Context.createImageData(this.width, this.height);
            var pixels = imgData.data;
            var len = imgData.data.length;
            var r = color.r;
            var g = color.g;
            var b = color.b;
            var a = color.a;
            for (var i = 0; i < len; i++) {
                pixels[i] = r;
                pixels[i + 1] = g;
                pixels[i + 2] = b;
                pixels[i + 3] = a;
            }
            this.Context.putImageData(imgData, 0, 0);
        };
        SpriteImage.fromImage = function (img) {
            var spr = new SpriteImage(img.width, img.height);
            spr._ctx.drawImage(img, 0, 0);
            return spr;
        };
        SpriteImage.loadFile = function (url, ptCenter, onloadFunc) {
            if (ptCenter === void 0) { ptCenter = new TSObeliskSimulator.Point(); }
            if (onloadFunc === void 0) { onloadFunc = null; }
            var img = new Image();
            img.src = url;
            img.onload = function () {
                var spr = SpriteImage.fromImage(img);
                spr.center = ptCenter;
                if (!TSObeliskSimulator.isEmpty(onloadFunc)) {
                    onloadFunc(spr);
                }
            };
        };
        SpriteImage.prototype.draw = function (ctxDst) {
            if (!this.visible || this._opacity == 0) {
                return;
            }
            ctxDst.globalAlpha = this._opacity;
            ctxDst.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height, this._position.x - this._center.x, this._position.y - this._center.y, this.width, this.height);
            ctxDst.globalAlpha = 1;
        };
        return SpriteImage;
    })();
    TSObeliskSimulator.SpriteImage = SpriteImage;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    /// <summary>
    /// 支配領域表示用Imageクラス。
    /// </summary>
    var TerritoryImage = (function (_super) {
        __extends(TerritoryImage, _super);
        /// <summary>
        /// コンストラクタ。
        /// </summary>
        /// <param name="owner">親となるオブジェクト。(Canvas、Gridなど)</param>
        /// <param name="territoryColor">支配領域の描画色。</param>
        function TerritoryImage(territoryColor) {
            _super.call(this, 256, 256);
            var _this = this;
            this._territoryColor = territoryColor;
            TSObeliskSimulator.SpriteImage.loadFile("image/building/field_obelisk.png", new TSObeliskSimulator.Point(0, 0), function (spr) {
                var centerPos = Math.ceil(spr.width / 2);
                spr.center = new TSObeliskSimulator.Point(centerPos, centerPos);
                spr.visible = true;
                _this._sprObelisk = spr;
                _this.setTerritoryColor(spr, _this._territoryColor);
            });
            TSObeliskSimulator.SpriteImage.loadFile("image/building/field_eclipse.png", new TSObeliskSimulator.Point(0, 0), function (spr) {
                var centerPos = Math.ceil(spr.width / 2);
                spr.center = new TSObeliskSimulator.Point(centerPos, centerPos);
                spr.visible = true;
                _this._sprEclipse = spr;
                _this.setTerritoryColor(spr, _this._territoryColor);
            });
        }
        TerritoryImage.prototype.setTerritoryColor = function (spr, color) {
            var img = spr.Context.getImageData(0, 0, spr.width, spr.height);
            var pixels = img.data;
            var len = pixels.length;
            var r = color.r;
            var g = color.g;
            var b = color.b;
            for (var i = 0; i < len; i += 4) {
                if (pixels[i + 3] != 0) {
                    pixels[i] = r;
                    pixels[i + 1] = g;
                    pixels[i + 2] = b;
                }
            }
            spr.Context.putImageData(img, 0, 0);
        };
        /// <summary>
        /// 指定座標が支配領域かどうかを判定する。
        /// </summary>
        /// <param name="pt">判定対象の座標。</param>
        /// <returns>true:支配領域である false:支配領域ではない</returns>
        TerritoryImage.prototype.isTerritory = function (pt) {
            var x = pt.x;
            var y = pt.y;
            if (x < 0 || x > this.width || y < 0 || y > this.height) {
                return false;
            }
            var pixel = this.getPixel(pt.x, pt.y);
            if (pixel != 0) {
                return true;
            }
            return false;
        };
        /// <summary>
        /// 指定した座標に支配領域をセット。
        /// </summary>
        /// <param name="pt">座標。</param>
        /// <param name="fieldType">領域種別。</param>
        TerritoryImage.prototype.setTerritory = function (pt, territoryType) {
            var spr = this._sprObelisk;
            switch (territoryType) {
                case 0 /* Castle */:
                    break;
                case 2 /* Eclipse */:
                    spr = this._sprEclipse;
                    break;
                case 1 /* Obelisk */:
                    break;
            }
            spr.position = pt.clone();
            spr.draw(this.Context);
        };
        Object.defineProperty(TerritoryImage.prototype, "TerritoryPercent", {
            /// <summary>
            /// 支配率。
            /// </summary>
            get: function () {
                var areaAll = this.width * this.height;
                var areaTerritory = 0;
                var imgData = this.Context.getImageData(0, 0, this.width, this.height);
                var pixels = imgData.data;
                var len = pixels.length;
                for (var i = 0; i < len; i += 4) {
                    if (pixels[i + 3] != 0) {
                        areaTerritory++;
                    }
                }
                return areaTerritory / areaAll * 100.0;
            },
            enumerable: true,
            configurable: true
        });
        return TerritoryImage;
    })(TSObeliskSimulator.SpriteImage);
    TSObeliskSimulator.TerritoryImage = TerritoryImage;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
// <reference path="Scripts/typings/FileSaver/FileSaver.d.ts" />
// <reference path="Scripts/typings/html2canvas/html2canvas.d.ts" />
var TSObeliskSimulator;
(function (TSObeliskSimulator) {
    function isUndefined(value) {
        var undef;
        return value == undef;
    }
    TSObeliskSimulator.isUndefined = isUndefined;
    function isNull(value) {
        return value == null;
    }
    TSObeliskSimulator.isNull = isNull;
    function isEmpty(value) {
        return (isUndefined(value) || isNull(value));
    }
    TSObeliskSimulator.isEmpty = isEmpty;
    var Util = (function () {
        function Util() {
        }
        Util.getDocumentUrl = function () {
            var url = document.location.href.split("?")[0];
            return url;
        };
        Util.hexToPoint = function (hex) {
            var val = parseInt(hex, 16);
            var x = (val >> 8) & 0xff;
            var y = (val) & 0xff;
            return new TSObeliskSimulator.Point(x, y);
        };
        Util.pointToHex = function (pt) {
            var posInt = (pt.x << 8) + pt.y;
            return posInt.toString(16);
        };
        Util.pointDistance = function (pt1, pt2) {
            var xDistance = Math.max(pt1.x, pt2.x) - Math.min(pt1.x, pt2.x);
            var yDistance = Math.max(pt1.y, pt2.y) - Math.min(pt1.y, pt2.y);
            var distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
            return distance;
        };
        Util.saveElementImage = function (elm, fileName) {
            html2canvas(elm, {
                onrendered: function (canvas) {
                    var imgType = "image/png";
                    var url = canvas.toDataURL(imgType);
                    // DataURL のデータ部分を抜き出し、Base64からバイナリに変換  
                    var bin = atob(url.split(',')[1]);
                    // 空の Uint8Array ビューを作る  
                    var buffer = new Uint8Array(bin.length);
                    for (var i = 0; i < bin.length; i++) {
                        buffer[i] = bin.charCodeAt(i);
                    }
                    // Uint8Array ビューのバッファーを抜き出し、それを元に Blob を作る  
                    var blob = new Blob([buffer.buffer], { type: imgType });
                    saveAs(blob, fileName);
                }
            });
        };
        return Util;
    })();
    TSObeliskSimulator.Util = Util;
})(TSObeliskSimulator || (TSObeliskSimulator = {}));
//# sourceMappingURL=App.js.map