const axios = require('axios');
const striptags = require('striptags');

const kfc_logo = 'https://www.kfc.by/assets/img/desktop/logo.png';

class Kfc {
    PROMO_PAGE = "https://www.kfc.by/promo";
    async getPromoUrls() {
        const pattern = /https?:\/\/www\.kfc\.by\/promo\/\d+/g;
        let getPromoPage = axios.get(this.PROMO_PAGE);
        return await getPromoPage.then((response) => {
            const urls = String(response.data).match(pattern);
            let unique = [];
            for (let url of urls) {
                if (unique.indexOf(url) == -1) {
                    unique.push(url);
                }
            }
            console.log(`${unique.length} unique promos found`)
            return unique;
        });
    }

    async getPromoInfo(url) {
        return await axios.get(url)
            .then((response) => {
                console.log(`Parsing: ${url}`);
                const html = response.data;
                let info = {};
                let type = this.getPromoType(html);
                info.type = type;
                if (type == "product") {
                    info.image = this.getProductImageSrc(html);
                    info.text = this.getProductText(html);
                } else if (type == "coupons") {
                    info.image = kfc_logo;
                    info.file = this.getCouponsFile(html);
                    info.text = this.getCouponsText(html);
                    info.text += "\n" + this.getCouponsLink(info.file, url);
                }
                info.text += "\n" + this.getPromoLink(url);
                return info;
            })
            .catch(err => console.error(err));
    }

    getPromoType(html) {
        let product_pattern = /class="product-info-wrp">/i;
        let coupons_pattern = /class="coupon-description coupon-description__smart">/i;
        if (html.search(product_pattern) != -1) {
            return "product"
        }
        if (html.search(coupons_pattern) != -1) {
            return "coupons"
        }
        return undefined;
    }

    getProductImageSrc(html) {
        const pattern = /class="product-photo-wrp">\s+<img.+src="(.+?)"/i;
        const images = html.match(pattern);
        return images ? images[1] : kfc_logo;
    }

    getProductText(html) {
        const pattern = /class="product-info-wrp">([\S\s]+?)<\/div>/i;
        let text = html.match(pattern)[1];
        text = this.fixText(text);
        return text;
    }

    getCouponsFile(html) {
        const pattern = /<a href="([^\"]+)" class="breakfast-download">/i;
        let file = html.match(pattern)[1];
        return file;
    }

    getCouponsText(html) {
        const pattern = /class="coupon-description coupon-description__smart">([\S\s]+?)<\/div>/i;
        let text = html.match(pattern)[1];
        text = this.fixText(text);
        return text;
    }

    getPromoLink(url) {
        return `<a href="${url}">KFC.by</a>`
    }

    getCouponsLink(file, url) {
        return `Скачать <a href="${file}">купоны PDF</a> или смотреть <a href="${url}">на сайте</a>`;
    }

    fixText(text) {
        text = striptags(text, ["h1", "h2"]);
        text = text.replace(/(?:[\\r\r])/g, "");
        text = text.replace(/<h\d>/gi, "<b>");
        text = text.replace(/<\/h\d>/gi, "</b>\n");
        text = text.replace(/ {2,}/g, " ");
        text = text.replace(/<b>\n/gi, "<b>");
        text = text.replace(/\n<\\b>/gi, "<\\b>");
        text = text.replace(/[\\n]{2,}/g, " ");
        text = text.replace(/^\s+/mg, "");
        return text;
    }
}

module.exports = new Kfc();