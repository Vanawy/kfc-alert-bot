require('dotenv').config();
const TelegramApi = require('./telegram');
const kfc = require('./kfc');
const fs = require('fs');
const path = require('path');
const DATA_FILENAME = path.dirname(require.main.filename) + '\/..\/ids.data';

const subscribers = process.env.BOT_SUBSCRIBERS.split(',');
const telegram = new TelegramApi(process.env.BOT_TOKEN, subscribers);

let ids = [];
if (fs.existsSync(DATA_FILENAME)) {
    ids = fs.readFileSync(DATA_FILENAME, "utf8").split(",");
} else {
    fs.writeFileSync(DATA_FILENAME, "");
}

let queue = [];

const main = () => {
    kfc.getPromoUrls()
        .then(promo_urls => {
            const new_promos_urls = promo_urls.filter(promo_url => {
                const id = promo_url.split("/").pop();
                return ids.indexOf(id) == -1 && queue.indexOf(id) == -1
            });
            console.log(`There is ${new_promos_urls.length} new promo(s)`);
            queue.push(...new_promos_urls);
            while (queue.length != 0) {
                notify(queue.shift());
            }
        })
        .catch(err => console.error(err));
};

main();
const check_interval = parseInt(process.env.CHECK_INTERVAL);
const interval = (check_interval || 60) * 60 * 1000;
setInterval(main, interval);
console.log(`Bot started with interval of ${interval / 60 / 1000} minutes`);

function notify(promo_url) {
    const id = promo_url.split("/").pop();
    if (ids.indexOf(id) == -1) {
        kfc.getPromoInfo(promo_url)
            .then(function(info) {
                return telegram.broadcastMessage(info.image, info.text);
            }).then(_ => {
                fs.appendFile(DATA_FILENAME, id + ",", 'utf8', (err) => {
                    if (err) throw err;
                });
                ids.push(id);
                console.log(`${id} - success`);
            })
            .catch(
                err => {
                    queue.push(promo_url);
                    console.error(err);
                }
            );
    }
}