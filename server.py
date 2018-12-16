#!/usr/bin/env python
# -*- coding: utf-8 -*-

import base64
from io import BytesIO

import pytesseract
from flask import Flask, jsonify, request

from tasks import ocr_tesseract


app = Flask(__name__)


@app.route("/ocr/tesseract", methods=["GET", "POST"])
def handler_tesseract():
    result_bucket = []

    if request.method == "GET":

        html = "<title>Tesseract</title>" \
               "<h2>Hello, Tesseract Server!</h2>" \
               "<i>Current Ver: %s </i>" % pytesseract.get_tesseract_version()

        return html

    elif request.method == "POST":
        b64_img = request.form.get("b64_img")
        files = request.files

        if not b64_img and not files:
            result_bucket.append(dict(result=0, err="Missing params: b64_img or files ."))

        elif files:
            for fk in files:
                file = files[fk]

                async_result = ocr_tesseract.apply_async(
                    kwargs=dict(
                        im_buff=BytesIO(file.read())
                    ),
                    serializer="pickle",
                )

                response = dict(origin_name=fk)
                if async_result.status == "SUCCESS":
                    response["result"] = 1
                    response["txt"] = async_result.result

                else:
                    response["result"] = 0

                response["celery_id"] = async_result.task_id
                response["celery_st"] = async_result.status

                result_bucket.append(response)

        elif b64_img:
            decode_data = base64.b64decode(b64_img)

            async_result = ocr_tesseract.apply_async(
                kwargs=dict(
                    im_buff=BytesIO(decode_data)
                ),
                serializer="pickle",
            )

            response = dict()
            if async_result.status == "SUCCESS":
                response["result"] = 1
                response["txt"] = async_result.result

            else:
                response["result"] = 0

            response["celery_id"] = async_result.task_id
            response["celery_st"] = async_result.status

            result_bucket.append(response)

        return jsonify(result_bucket)
