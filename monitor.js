const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const $ = require('cheerio');

const ps5_url = 'https://www.amazon.co.uk/Sony-PlayStation-500GB-Console-Black/dp/B01GVQVQH2/ref=sr_1_1?dchild=1&keywords=ps4&qid=1615979341&sr=8-1';

async function initBrowser() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(ps5_url);
    return page;
}

async function sendNotification() {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '',
            pass: ''
        }
    });

    let textToSend = 'Go get that playstation 5';
    let htmlText = `<a href=\"${ps5_url}\">Link</a>`

    let info = await transporter.sendMail({
        from: '"amazon monitor" <robertsanins@gmail.com',
        to: 'robertsanins@gmail.com',
        subject: 'PLAYSTATION 5 BACK IN STOCK',
        text: textToSend,
        html: htmlText
    });

    console.log('message send: ', info.messageId);
}

async function checkStock(page) {
    await page.reload();
    let content = await page.evaluate(() => document.body.innerHTML);
    $("#add-to-cart-button", content).each(function() {
        sendNotification();
    })
}

async function monitor() {
    let page = await initBrowser();
    let job = new CronJob("15 * * * * *", function () {
        checkStock(page);
    }, null, true, null, null, true);
    job.start();
}

monitor();