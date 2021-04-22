# -*- coding:utf-8 -*-
"""
訓練所のマッププレビューが入ったキャプチャ画像からマップ部分のみを切り抜く。
キャプチャ画像のサイズは2560x1440前提の作りです。
その他のサイズの場合は、適宜切り抜く位置を変更する必要があります。
"""

import cv2
import os
import numpy as np
import glob

output_dir = "./clip"

def imread(filename, flags=cv2.IMREAD_COLOR, dtype=np.uint8):
    try:
        n   = np.fromfile(filename, dtype)
        img = cv2.imdecode(n, flags)
        return img
    except Exception as e:
        print(e)
        return None

def imwrite(filename, img, params=None):
    try:
        ext = os.path.splitext(filename)[1]
        result, n = cv2.imencode(ext, img, params)

        if result:
            with open(filename, mode='w+b') as f:
                n.tofile(f)
            return True
        else:
            return False
    except Exception as e:
        print(e)
        return False

# 出力先ディレクトリ作成
os.mkdir(output_dir)

# 元ファイルを取得
image_file_pathes = glob.glob("./map/*.png")

for path in image_file_pathes:
    new_path = os.path.join(output_dir, os.path.basename(path))
    print(path)

    img     = imread(path)
    h, w, c = img.shape
    centerX = int(w / 2)
    centerY = int(h / 2)
    clipped = img[centerY - 200 : centerY, centerX + 74 : centerX + 274]        # 地図部分のみ切り出し(200x200)
    zoomed  = cv2.resize(clipped, (256, 256), interpolation = cv2.INTER_CUBIC)  # 256x256に拡大

    imwrite(new_path, zoomed)
