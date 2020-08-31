const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

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
    makeRequest(method, data, headers = {}) {
        const url = `https://api.telegram.org/bot${this.token}/${method}`;
        process.stdout.write(`Request to api: ${method} - `);
        return axios.post(url, data, {
                headers: { ...headers },
            })
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

    /**
     * 
     * @param {string[]} photos Pathes to photos
     * @param {string} text Post caption
     * @returns {Promise<object[]>} Responses from Telegram API
     */
    broadcastMedia(photos, text) {
        const method = 'sendMediaGroup';
        let responses = [];
        const data = new FormData();
        let photosGroup = []
        let i = 0;
        photos.forEach(photo => {
            const name = String(i++);
            data.append(name, fs.readFileSync(photo), name);
            photosGroup.push({
                type: 'photo',
                media: 'attach://' + name,
            });
        });
        photosGroup[0].caption = text;
        photosGroup[0].parse_mode = 'HTML';
        data.append('media', JSON.stringify(photosGroup));

        for (let subscriber of this.subscribers) {
            data.append('chat_id', subscriber);
            const response = this.makeRequest(method, data.getBuffer(), data.getHeaders())
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