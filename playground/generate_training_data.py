#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import string

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from sklearn.externals import joblib

IMG_SIZE = 40
FONT_SIZE = 50
NORMAL_SIZE = 40
CUT_SIZE = 32

XY_SET = [
    (x, y)
    for x in range(NORMAL_SIZE + 1 - CUT_SIZE)
    for y in range(NORMAL_SIZE + 1 - CUT_SIZE)
]

FONT_DIR = "/usr/share/fonts/"
FONTS = {
    "sh": {"path": "dejavu/DejaVuSerif.ttf", "config": (6, -3), "jlb": "font-sh.jlb"},
    "yh": {"path": "wqy-microhei/wqy-microhei.ttc", "config": (1, -8), "jlb": "font-yh.jlb"},
}
FONT = FONTS["yh"]

BUCKET = []


def generate_data():
    hans = list(string.digits)
    for han in hans:
        img = __generate_img__(han, path=None)
        img_8x8 = img.resize((CUT_SIZE, CUT_SIZE))
        cut_data = list(__generate_cut_img__(img))

        BUCKET.append(dict(label=han, data=covert(img_8x8)))
        [BUCKET.append(dict(label=han, data=covert(cut_img))) for cut_img in cut_data]

    # joblib.dump(BUCKET, FONT["jlb"])
    # return BUCKET


def __generate_img__(text, path=None, saving=False, remove_block=True):
    im = Image.new("RGB", (IMG_SIZE, IMG_SIZE), (255, 255, 255))
    dr = ImageDraw.Draw(im)

    font_path = os.path.join(FONT_DIR, FONT["path"])
    font = ImageFont.truetype(font_path, FONT_SIZE)

    dr.text(xy=FONT["config"], text=text, font=font, fill="#000000")

    new_im = im

    # 移除空白
    if remove_block:
        l_im = im.convert("L")
        np_img = np.asarray(l_im)  # .reshape(IMG_SIZE, IMG_SIZE)
        delete_list = []

        # 移除 y 轴空白
        for idx, y in enumerate(np_img):
            if set(y) == {255}:
                delete_list.append(idx)
        np_img = np.delete(np_img, (delete_list,), axis=0)
        delete_list.clear()

        # 移除 x 轴空白
        np_img = np_img.T
        for idx, x in enumerate(np_img):
            if set(x) == {255}:
                delete_list.append(idx)
        np_img = np.delete(np_img, (delete_list,), axis=0)
        delete_list.clear()

        aim = np.asarray(np_img.T)
        new_im = Image.fromarray(aim)

        # if all([new_im.height != NORMAL_SIZE, new_im.width != NORMAL_SIZE]):
        #     new_im = new_im.resize((NORMAL_SIZE, NORMAL_SIZE))

        # new_im.show()

    if saving:
        assert path is not None
        img_path = os.path.join(path, "a%s.png" % text)
        new_im.save(img_path)

    return new_im


def __generate_cut_img__(img):
    for xy in XY_SET:
        bx, by = xy
        bx2, by2 = bx + CUT_SIZE, by + CUT_SIZE
        cut_img = img.crop((bx, by, bx2, by2))

        yield cut_img


def covert(obj):
    if isinstance(obj, (str, bytes)):
        img = Image.open(obj, mode='r')

    elif isinstance(obj, Image.Image):
        img = obj

    else:
        raise ValueError

    img = img.convert("L")

    # to array
    d = np.array(img)

    # feature
    d = d.reshape(1, 32 * 32).tolist()[0]
    d = list(map(lambda x: 0 if x == 255 else 1, d))
    # with open(obj[:-4] + ".txt", "w") as wf:
    #     ls = []
    #     for l in d:
    #         res = list(map(lambda x: 0 if x == 255 else 1, l))
    #         ls.append("".join(list(map(str, res))))
    #     wf.write("\n".join(ls))
    return d


if __name__ == '__main__':
    src_dir = "/home/lab/Documents/gitlab/fonts/ocr/knn/example/train_data"
    dst_dir = "/home/lab/Documents/gitlab/fonts/ocr/knn/example/train_img"

    yh_xy = [(x, y) for x in range(1, 14) for y in range(-10, -7)]
    for x, y in yh_xy:
        #        FONTS = {
        #            "yh": {"path": "wqy-zenhei/wqy-zenhei.ttc", "config": (x, y), "jlb": "font-zh-data.jlb"},
        #        }
        FONT = FONTS["sh"]

        generate_data()
        joblib.dump(BUCKET, FONT["jlb"])
        break
        print()

# for label in list(string.digits):
#     test_im = __generate_img__(
#         str(label), remove_block=False,
#         saving=True, path=dst_dir,
#     )
#     test_ims = __generate_cut_img__(test_im)
#     test_ims = list(test_ims)
#     for ix, f in enumerate(test_ims):
#         f.save(os.path.join(dst_dir, "a%s_ix%s.png" % (label, ix)))

# src_dir ="/home/lab/Documents/gitlab/fonts/ocr/knn/example/train_data"
# for item in os.listdir(src_dir):
#     if item.endswith(".png"):
#         covert(os.path.join(src_dir,item))
