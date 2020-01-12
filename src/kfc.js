const axios = require('axios');
const striptags = require('striptags');

class Kfc {
    PROMO_PAGE = "https://www.kfc.by/promo";
    async getPromoUrls()
    {
        const pattern = /https?:\/\/www\.kfc\.by\/promo\/\d+/g;
        let promise = axios.get(this.PROMO_PAGE);
        return await promise.then((response) => {
            const urls = String(response.data).match(pattern);
            let unique = [];
            for(let url of urls){
                if(unique.indexOf(url) == -1){
                    unique.push(url);
                }
            }
            return unique;
        });
    }

    async getPromoInfo(url)
    {
        return await axios.get(url)
        .then((response) => {
            console.log(url);
            const html = response.data;
            let info = {};
            info.image = this.getPromoImageSrc(html);
            info.text = this.getPromoText(html);
            info.text += "\n" + this.getPromoLink(url);
            return info;
        });
    }

    getPromoImageSrc(html)
    {
        const pattern = /class="product-photo-wrp">\s+<img.+src="(.+?)"/;
        return html.match(pattern)[1];
    }

    getPromoText(html)
    {
        const pattern = /class="product-info-wrp">([\S\s]+?)<\/div>/;
        let text = html.match(pattern)[1];
        text = striptags(text, ["h2"]);
        text = text.replace(/(?:[\\r\r])/g, "");
        text = text.replace(/<h2>/i, "<b>");
        text = text.replace(/<\/h2>/i, "</b>\n");
        text = text.replace(/ {2,}/, " ");
        text = text.replace(/^\s+/mg, "");
        return text;
    }

    getPromoLink(url){
        return `<a href="${url}">KFC.by</a>`
    }
}

module.exports = new Kfc();
