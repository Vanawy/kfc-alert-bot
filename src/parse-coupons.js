require('dotenv').config();

const glue = require('./glue.js');
const TelegramApi = require('./telegram');
const kfc = require('./kfc.js');
const subscribers = process.env.BOT_SUBSCRIBERS.split(',');
const telegram = new TelegramApi(process.env.BOT_TOKEN, subscribers);

kfc.getPromoInfo('https://www.kfc.by/promo/182')
.then(info => {
    let combinedPhotos = [];
    for (let i = 0; i < info.photos.length; i += 2) {
        let photos = [info.photos[i]];
        if (info.photos[i + 1]) {
            photos.push(info.photos[i + 1]);
        } 
        combinedPhotos.push(glue(photos));
    }
    return Promise.all(combinedPhotos).then(photos => {
        console.log(photos);
        telegram.broadcastMedia(photos, info.text);
    });
})
;