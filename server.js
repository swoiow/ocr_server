"use strict";
const PORT = 8081;
const HOST = "127.0.0.1";

const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
// const sharp = require('sharp');

// puppeteer config
const run_args = {
    headless: true,
    executablePath: "extra_tools/chrome-win/chrome.exe",
    ignoreHTTPSErrors: true,
    args: [
        // "--proxy-server=127.0.0.1:10800",
        '--no-sandbox', '--disable-setuid-sandbox' // 临时解决沙盒报错
    ]
};
let BROWSER = puppeteer.launch(run_args);

// other config
const DEF_IMG_W = 150;
const DEF_IMG_H = 50;

// express config
const express = require('express');

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.all("/", (req, res) => {
    res.write("<title>Puppeteer Server</title>");
    res.write("<h2>Hello, Puppeteer Server!</h2>");

    BROWSER.then(async (browser) => {
        res.end("<i>Using browser ver: " + await browser.version() + "/<i>");
    });
});

app.post('/html2img', function (req, res) {
    let req_body = req.body;

    // get params
    let html = req_body.html;
    let dom_selector = req_body.dom;
    let is_pad = req_body.is_pad;

    if (!html) {
        return res.send("missing param: html")

    } else if (!dom_selector) {
        return res.send("missing param: dom_selector")
    }

    BROWSER.then(async (browser) => {
        // new a page
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36");
        await page.setContent(html);

        // get clip
        await page.evaluate((selector) => {
            let {x, y, width, height} = document.querySelector(selector).getBoundingClientRect();
            return {x, y, width, height}
        }, dom_selector)

            .then(async (clip) => {
                let im = await page.screenshot({
                    clip: clip,
                    encoding: "base64",
                });

                if (is_pad === 1) {
                    let w_cmp = DEF_IMG_W - clip.width;
                    let h_cmp = DEF_IMG_H - clip.height;
                }

                await page.close();
                res.send(im)
            })

            .catch(error => {
                res.send(error.message)
            });
    })

});

app.post('/url2img', function (req, res) {
    let req_body = req.body;

    // get params
    let url = req_body.url;
    let dom_selector = req_body.dom;
    let is_pad = req_body.is_pad;
    // let png_name = url.split("/").slice(-1).pop().replace(".", "_");

    if (!url) {
        return res.send("missing param: url")
    }

    // test: "https://hz.58.com/pinpaigongyu/36349009871261x.shtml";

    BROWSER.then(async function (browser) {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36");
        await page.goto(url, {waitUntil: 'domcontentloaded'});

        // get clip
        await page.evaluate((selector) => {
            let {x, y, width, height} = document.querySelector(selector).getBoundingClientRect();
            return {x, y, width, height}
        }, dom_selector)

            .then(async (clip) => {
                let im = await page.screenshot({
                    clip: clip,
                    encoding: "base64",
                });

                if (is_pad === 1) {
                    let w_cmp = DEF_IMG_W - clip.width;
                    let h_cmp = DEF_IMG_H - clip.height;

                    im = im.then((img) => {
                        if (w_cmp > 0 && h_cmp > 0) {
                            return sharp(img)
                                .resize(clip.width, clip.height)
                                .extend({
                                    top: 3,
                                    bottom: h_cmp,
                                    left: 0,
                                    right: w_cmp,
                                    background: {r: 255, g: 255, b: 255, alpha: 255}
                                })
                            // .toFile(png_name + ".png")
                        } else {
                            return img
                        }
                    }, im)
                }

                await page.close();
                res.send(im)
            })

            .catch(error => {
                res.send(error.message)
            });

        // .then(function (im) {
        //     if (w_cmp > 0 && h_cmp > 0) {
        //         sharp(im)
        //             .resize(clip.width, clip.height)
        //             .extend({
        //                 top: 3,
        //                 bottom: h_cmp,
        //                 left: 0,
        //                 right: w_cmp,
        //                 background: {r: 255, g: 255, b: 255, alpha: 255}
        //             })
        //             .toFile(png_name + ".png")
        //     }
        // });

    })
});

app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}`));
