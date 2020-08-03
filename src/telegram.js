const axios = require('axios');

class TelegramApi {
    constructor(token, subscribers) {
        this.token = token;
        this.subscribers = subscribers;
    }
    /**
     * Make request to telegram api
     * @param {string} method Telegram API method name
     * @param {object} data Telegram API method parameters
     * @returns {Promise} Promise with Telegram API response data
     */
    makeRequest(method, data) {
        const url = `https://api.telegram.org/bot${this.token}/${method}`;
        process.stdout.write(`Request to api: ${method} - `);
        return axios.post(url, data)
            .then((res) => {
                console.log(`Status: ${res.status}`);
                return res.data;
            });
    }
    /**
     * 
     * @param {object} data 
     * @returns {Promise} Promise with Telegram API response data
     */
    getUpdates(data = {}){
        const method = 'getUpdates';
        return this.makeRequest(method, data);
    }

    /**
     * 
     * @param {string} photo Photo url or Telegram file_id
     * @param {string} text Post caption/
     * @returns {Promise<object[]>}
     */
    broadcastMessage(photo, text) {
        const method = 'sendPhoto';
        let responses = [];
        for (let subscriber of this.subscribers) {
            const data = {
                chat_id: subscriber,
                photo: photo,
                parse_mode: 'HTML',
                caption: text,
            }
            const response = this.makeRequest(method, data)
            .catch(err => {
                console.error(err);
                return {};
            });
            responses.push(response);
        }
        return Promise.all(responses);
    }
}
module.exports = TelegramApi;