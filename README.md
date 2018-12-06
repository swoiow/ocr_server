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

+ 参数方式一：
    > api: `/html2img` method: `POST`
    + html: `整个页面的 html`
    + dom: `传入 dom selector`

+ 参数方式二：
    > api: `/ud` method: `POST`
    + url: `传入 url`
    + dom: `传入 dom selector`


## Run & Test
+ `dk run -it --rm -v /home/me/gitlab/fonts/ocr_version/nodejs:/app -u root puppeteer:prod node p.js`
+ ``
