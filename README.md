# tesseract_server

+ `git clone && cd`
+ `dk build -t tesseract .`
+ `dk run -it --rm -p 0.0.0.0:80:8080 -v $PWD:/app:ro -w /app tesseract sh /app/entrypoint.sh`
