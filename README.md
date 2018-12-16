# Run OCR Server

+ ` git clone && cd `
+ ` dk build -t tesseract -f prod.dkp . `
+ ` dk run -it --rm -p 0.0.0.0:80:8080 -v $PWD:/app:ro -v /tmp/falsk:/tmp/flask -w /app --name ocr tesseract sh /app/entrypoint.sh `


# Run Celery
+ ` dk run -it --rm -v $PWD:/app:ro -w /app --name ocr_celery tesseract sh /app/celery.sh`


## Routers

+ `/ocr/tesseract`
    + GET
        + pdf => `0` or `1`

    + POST
        + files => `[file1, file2]` 
        + b64_img => `str`
        + extra_data => `json.dumps`, 用于信息传递

        
## TODO

+ 使用 Celery
+ 使用其他 OCR 手法
