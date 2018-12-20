"use strict";

const PORT = process.env.SERVER_PORT || 8081;
const HOST = process.env.SERVER_HOST || "127.0.0.1";

// express config
const express = require("express");
// const bodyParser = require("body-parser");

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// puppeteer config
const puppeteer = require("puppeteer");
const sharp = require("sharp");

const run_args = {
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
        // "--proxy-server=127.0.0.1:10800",

        // 临时解决沙盒报错
        "--no-sandbox",
        "--disable-setuid-sandbox",

        "--disable-gpu",
        "--disable-dev-shm-usage",
    ]
};

if (process.env.CHROMIUM_BIN) {
    run_args.executablePath = process.env.CHROMIUM_BIN
}

if (process.env.EXPRESS_LOG) {
    let morgan = require('morgan');
    app.use(morgan('short'));
}

const BROWSER = puppeteer.launch(run_args);

// other config
const DEF_PADDING = 2;
const DEF_IMG_W = 150;
const DEF_IMG_H = 50;
const DEF_UA = `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36"`;


// ===== utils.js

async function paddingImg(img, width, height, w_cmp, h_cmp) {
    return await sharp(img)
        .resize(width, height)
        .extend({
            top: 1,
            bottom: h_cmp,
            left: 1,
            right: w_cmp,
            background: {r: 255, g: 255, b: 255, alpha: 255}
        })
        // .toFormat("png")
        .toBuffer();
}

// =====


app.all("/", async (req, res) => {
    res.write("<title>Puppeteer Server</title>");
    res.write("<h2>Hello, Puppeteer Server!</h2>");

    await BROWSER.then(async (browser) => {
        res.write("<i>Using browser ver: " + await browser.version() + "/<i>");
    });

    res.end()
});

app.route("/html2img")

    .get(async function (req, res) {
        let doc = `
        Method: POST
        Params:
            :html
            :dom
            :[optional]is_pad
            :[optional]extra_data
        `;
        res.send(doc.split("\n").join("</p>"))
    })

    .post(async function (req, res) {
        let resp = {};
        let req_body = req.body;

        // get params
        let html = req_body.html;
        let dom_selector = req_body.dom;
        let is_pad = req_body.is_pad || 0;
        let extra_data = req_body.extra_data;

        if (!html) {
            resp.success = 0;
            resp.msg = "missing param: html";

            // resp.extra_data = extra_data;
            // return res.json(resp)

        } else if (!dom_selector) {
            resp.success = 0;
            resp.msg = "missing param: dom";

            // resp.extra_data = extra_data;
            // return res.json(resp)

        } else {
            await BROWSER.then(async (browser) => {
                // new a page
                const page = await browser.newPage();
                await page.setUserAgent(DEF_UA);
                await page.setContent(html);

                // get clip
                await page.evaluate((selector) => {
                    let {x, y, width, height} = document.querySelector(selector).getBoundingClientRect();
                    return {x, y, width, height}
                }, dom_selector)
                // screen shot
                    .then(async (clip) => {
                        let im = await page.screenshot({
                            clip: clip,
                            // encoding: "base64",
                        });

                        if (is_pad === "1") {
                            // fix error: Expected positive integer
                            clip.width = Math.ceil(clip.width);
                            clip.height = Math.ceil(clip.height);

                            let w_cmp = DEF_IMG_W - DEF_PADDING - clip.width;
                            let h_cmp = DEF_IMG_H - DEF_PADDING - clip.height;

                            if (w_cmp > 0 && h_cmp > 0) {
                                im = await paddingImg(im, clip.width, clip.height, w_cmp, h_cmp)
                            }
                        }

                        let base64_im = im.toString("base64");

                        resp.success = 1;
                        resp.msg = base64_im;
                    })

                    // handle exception
                    .catch(error => {
                        resp.success = 0;
                        resp.msg = error.message;
                    })

                    .then(
                        async () => await page.close()
                    );

            });
        }

        resp.extra_data = extra_data;
        res.json(resp)
    });

app.route("/url2img")

    .get(async function (req, res) {
        let doc = `
        Method: POST
        Params:
            :url
            :dom
            :[optional]is_pad
            :[optional]extra_data
        `;
        res.send(doc.split("\n").join("</p>"))
    })

    .post(async function (req, res) {
        let resp = {};
        let req_body = req.body;

        // get params
        let url = req_body.url;
        let dom_selector = req_body.dom;
        let is_pad = req_body.is_pad;
        let extra_data = req_body.extra_data;

        if (!url) {
            resp.success = 0;
            resp.msg = "missing param: url";

        } else {
            await BROWSER.then(async function (browser) {
                // new a page
                const page = await browser.newPage();
                await page.setUserAgent(DEF_UA);
                await page.goto(url, {waitUntil: "domcontentloaded"});

                // get clip
                await page.evaluate((selector) => {
                    let {x, y, width, height} = document.querySelector(selector).getBoundingClientRect();
                    return {x, y, width, height}
                }, dom_selector)

                // screen shot
                    .then(async (clip) => {
                        let im = await page.screenshot({
                            clip: clip,
                            // encoding: "base64",
                        });

                        if (is_pad === "1") {
                            // fix error: Expected positive integer
                            clip.width = Math.ceil(clip.width);
                            clip.height = Math.ceil(clip.height);

                            let w_cmp = DEF_IMG_W - clip.width;
                            let h_cmp = DEF_IMG_H - clip.height;

                            if (w_cmp > 0 && h_cmp > 0) {
                                im = await paddingImg(im, clip.width, clip.height, w_cmp, h_cmp)
                            }
                        }

                        let base64_im = im.toString("base64");
                        resp.success = 1;
                        resp.msg = base64_im;
                    })

                    // handle exception
                    .catch(error => {
                        resp.success = 0;
                        resp.msg = error.message;
                    })

                    .finally(
                        async () => await page.close()
                    )
            })
        }

        resp.extra_data = extra_data;
        return res.json(resp)
    });

app.route("/get_html")

    .get(async function (req, res) {
        let doc = `
        Method: POST
        Params:
            :url
            :[optional]wait_time
            :[optional]time_out
        `;
        res.send(doc.split("\n").join("</p>"))
    })

    .post(async function (req, res) {
        let resp = {};
        let req_body = req.body;

        let url = req_body.url;
        let wait_time = req_body.wait_time;
        wait_time = wait_time && parseInt(wait_time) || 0;

        if (!url) {
            resp.success = 0;
            resp.msg = "missing param: url";

        } else {
            await BROWSER.then(async function (browser) {
                const page = await browser.newPage();
                await page.setUserAgent(DEF_UA);
                await page.goto(url, {timeout: time_out, waitUntil: "domcontentloaded"});

                if (wait_time !== -1) {
                    await page.waitFor(wait_time);
                }

                let html = await page.$eval("html", function (el) {
                    return el.outerHTML;
                });

                resp.success = 1;
                resp.msg = html;

                await page.close()
            })
        }

        return res.json(resp)
    });

app.route("/get_cookie")

    .get(async function (req, res) {
        let doc = `
        Method: POST
        Params:
            :url
            :[optional]wait_time
            :[optional]time_out
        `;
        res.send(doc.split("\n").join("</p>"))
    })

    .post(async function (req, res) {
        let resp = {};
        let req_body = req.body;

        let url = req_body.url;
        let wait_time = req_body.wait_time;
        wait_time = wait_time && parseInt(wait_time) || -1;

        let time_out = req_body.time_out || 3000;

        if (!url) {
            resp.success = 0;
            resp.msg = "missing param: url";

        } else {
            await BROWSER.then(async function (browser) {
                const page = await browser.newPage();
                await page.setUserAgent(DEF_UA);
                await page.goto(url, {timeout: time_out, waitUntil: "domcontentloaded"});

                if (wait_time !== -1) {
                    await page.waitFor(wait_time);
                }

                let cookies = await page.cookies();

                // clear cookie
                for (let i = 0; i < cookies.length; i++) {
                    await page.deleteCookie(cookies[i])
                }

                resp.success = 1;
                resp.msg = cookies;

                await page.close()
            })
        }

        return res.json(resp)
    });

app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}`));
