require('custom-env').env()
const telegram = require('./telegram')
const kfc = require('./kfc');
const fs = require('fs');
const path = require('path');
const DATA_FILENAME = path.dirname(require.main.filename) + '\/..\/ids.data';

let ids = [];
if (fs.existsSync(DATA_FILENAME)) {
    ids = fs.readFileSync(DATA_FILENAME, "utf8").split(",");
} else {
    fs.writeFileSync(DATA_FILENAME, "");
}

const main = () => {
    kfc.getPromoUrls()
        .then(promos => {
            promos.forEach(promo_url => {
                notify(promo_url);
            });
        })
        .catch(err => console.error(err));
};

main();

const interval = 60 * 60 * 1000;
setInterval(main, interval);

function notify(promo_url) {
    const id = promo_url.split("/").pop();
    if (ids.indexOf(id) == -1) {
        kfc.getPromoInfo(promo_url)
            .then(function(info) {
                telegram.broadcastMessage(info.image, info.text, _ => {
                    fs.appendFile(DATA_FILENAME, id + ",", 'utf8', (err) => {
                        if (err) throw err;
                    });
                    ids.push(id);
                })
            })
            .catch(err => console.error(err));
    }
}