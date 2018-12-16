#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pytesseract
from PIL import Image

from ext.celeryapp import app


@app.task
def ocr_tesseract(im_buff):
    im = Image.open(im_buff)

    txt = pytesseract.image_to_string(im)
    return txt


@app.task
def add(x, y):
    return x + y
