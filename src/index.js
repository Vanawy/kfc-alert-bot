require('custom-env').env() 
const telegram = require('./telegram')
const kfc = require('./kfc');
const fs = require('fs');
const DATA_FILENAME = '../ids.data';

let ids = [];
if(fs.existsSync(DATA_FILENAME)){
    ids = fs.readFileSync(DATA_FILENAME, "utf8").split("\r\n");
}else{
    fs.writeFileSync(DATA_FILENAME, "");
}
kfc.getPromoUrls()
.then(urls => { 
    urls.forEach(url => {
        notify(url);
    });
})

function notify(url) {
    kfc.getPromoInfo(url)
    .then(function(info){
        console.log(info);
        // telegram.broadcastMessage(info.image, info.text);
    });
}

// api.makeRequest("getUpdates", null, (data) => { console.log(data.result[1].channel_post); });
// api.broadcastMessage("test");
// api.sendMessage("test");
