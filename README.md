# Feature

### multiple page
```
https://github.com/GoogleChrome/puppeteer/pull/554
```


### load html
```
https://github.com/GoogleChrome/puppeteer/issues/581
https://github.com/GoogleChrome/puppeteer/issues/2913#issuecomment-406299135
```


### extend image (control clip)
```
http://sharp.pixelplumbing.com/en/stable/api-resize/#extend
```


### page under proxy
```
https://github.com/GoogleChrome/puppeteer/issues/678
https://github.com/GoogleChrome/puppeteer/issues/1948
```


## 接口介绍

> api: `/html2img` method: `POST`
+ html: `整个页面的 html`
+ dom: `传入 dom selector`

> api: `/url2img` method: `POST`
+ url: `传入 url`
+ dom: `传入 dom selector`

> api: `/get_html` method: `POST`
+ url: `传入 url`

> api: `/get_cookie` method: `POST`
+ url: `传入 url`

## Run & Test
+ ` dk run -it --rm -v $PWD:/app -w /app -p 0.0.0.0:8081:8081 --cap-add SYS_ADMIN puppeteer node server.js`
