#!/usr/bin/env python
# -*- coding: utf-8 -*-

from io import BytesIO

import pytesseract
from PIL import Image
from flask import Flask, jsonify, request


app = Flask(__name__)


def ocr_tesseract(im_buff):
    im = Image.open(im_buff)

    txt = pytesseract.image_to_string(im)
    return txt


@app.route("/ocr", methods=["GET", "POST"])
def hello():
    result_bucket = []

    if request.method == "GET":

        html = "<title>Tesseract</title>" \
               "<h2>Hello, Tesseract Server!</h2>" \
               "<i>Current Ver: %s </i>" % pytesseract.get_tesseract_version()

        return html

    elif request.method == "POST":
        files = request.files

        for fk in files:
            file = files[fk]

            ocr_result = ocr_tesseract(BytesIO(file.read()))

            if ocr_result:
                result_bucket.append(dict(result=1, txt=ocr_result))
            else:
                result_bucket.append(dict(result=0, txt=None))

        return jsonify(result_bucket)
