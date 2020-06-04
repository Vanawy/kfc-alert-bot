const axios = require('axios');

class TelegramApi {
    token = process.env.BOT_TOKEN
    makeRequest(method, data, callback = null) {
        const url = `https://api.telegram.org/bot${this.token}/${method}`;
        console.log("Request to api: " + method);
        axios.post(url, data)
            .then((res) => {
                console.log(`Status: ${res.status}`);
                if (callback) {
                    callback(res.data);
                }
            })
            .catch((error) => {
                console.error(error)
            });
    }
    broadcastMessage(photo, text, callback) {
        const subscribers = process.env.BOT_SUBSCRIBERS.split(",");
        for (let subscriber of subscribers) {
            const data = {
                chat_id: subscriber,
                photo: photo,
                parse_mode: "HTML",
                caption: text,
            }
            this.makeRequest("sendPhoto", data, callback);
        }
    }
}
module.exports = new TelegramApi();