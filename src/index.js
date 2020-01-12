require('custom-env').env() 
const telegram = require('./telegram')
const kfc = require('./kfc');
const fs = require('fs');
const path = require('path');
const DATA_FILENAME = path.dirname(require.main.filename) + '\\..\\ids.data';
console.log(DATA_FILENAME);

let ids = [];
if(fs.existsSync(DATA_FILENAME)){
    ids = fs.readFileSync(DATA_FILENAME, "utf8").split(",");
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
    const id = url.split("/").pop();
    if(ids.indexOf(id) == -1){
        kfc.getPromoInfo(url)
        .then(function(info){
            telegram.broadcastMessage(info.image, info.text);
        });
        fs.appendFile(DATA_FILENAME, id + ",", 'utf8', (err) => {
            if (err) throw err;
        });
    }
}
