const fetch = require('node-fetch');
var qs = require('querystring');
const fs = require('fs');
// import utf8 from 'utf8';
const dic = require('../../english/dictionary');
const source = require('./source.json');
const newDic = {};

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}


//딕셔널이에 없는값들만 골라서 파파고에 물어본다.
async function papagoStart() {
    const descriptions = [];
    for (var i = 0; i < source.length; i += 1) {
        if(!content) {
            continue;
        }
        var content = source[i];
        var description = await papagoTranslate(content);
        var content_audio = await papagoAudio(content)
        // var description_audio = await papagoAudio(description)
        descriptions.push({
            en: {desc: content, audio: content_audio},
            ko: {desc: description}
        });
        console.log(content);
        content = content.replace(/[\{\}\[\]\/?.,;:|\)*~'!^\-_+<>@\#$%&\\\=\(\"]/gi, ' ');
        content = content.toLowerCase();
        content = content.trim();
        let split = content.split(" ");
        split.forEach(it => {
            if (it && isNaN(it)) {
                newDic[it] = {}
            }
        });
    }

    fs.writeFileSync('descriptions.js', 'const DESCRIPTIONS = ' + JSON.stringify(descriptions), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });


    let keys = Object.keys(newDic);
    for (let i = 0; i < keys.length; i++) {
        var key = keys[i];
        await timer(100);
        papago(key);
    }
}

// 키안에 자식이 없으면 만들어서 물어본다
async function papagoTranslate(desc) {
    desc = qs.escape(desc);
    const rs = await fetch("https://papago.naver.com/apis/n2mt/translate", {
        "headers": {
            "accept": "application/json",
            "accept-language": "ko",
            "authorization": "PPG de6416b3-21d7-4642-a2a3-0d9e458f10f6:p+UfLB/8uu5IhES1AySfqg==",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "device-type": "pc",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "timestamp": "1612933360691",
            "x-apigw-partnerid": "papago",
            "cookie": "NNB=MMUTUFGDLONF6; NRTK=ag#30s_gr#2_ma#-2_si#2_en#0_sp#0; ASID=70d97a1c00000175c05a8c8b00005e56; nx_ssl=2; _gid=GA1.2.1311689521.1612847211; papago_skin_locale=ko; JSESSIONID=001DDC44ECB967DCF439B1012CF41363; _ga=GA1.2.594285439.1598922588; _ga_7VKFYR6RV1=GS1.1.1612933345.222.0.1612933345.60"
        },
        "referrer": "https://papago.naver.com/",
        "referrerPolicy": "origin",
        "body": "deviceId=de6416b3-21d7-4642-a2a3-0d9e458f10f6&locale=ko&dict=true&dictDisplay=30&honorific=false&instant=false&paging=false&source=en&target=ko&text="+desc+"&authroization=PPG%20de6416b3-21d7-4642-a2a3-0d9e458f10f6%3Ap%2BUfLB%2F8uu5IhES1AySfqg%3D%3D&timestamp=1612933360691",
        "method": "POST",
        "mode": "cors"
    });
    const data = await rs.json();
    return data.translatedText;
}


async function papago(key) {
    // var reqQuery = {"source":"en","target":"ko","text":key,"locale":"ko"};
    // var reqQueryStr = qs.escape(JSON.stringify(reqQuery));

    const rs = await fetch("https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text=" + key + "&locale=ko", {
        "headers": {
            "accept": "application/json",
            "accept-language": "ko,en-US;q=0.9,en;q=0.8,ja;q=0.7,ru;q=0.6,ko-KR;q=0.5",
            "authorization": "PPG de6416b3-21d7-4642-a2a3-0d9e458f10f6:6wixW5Lp/HB/pozu5lHtJg==",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "timestamp": "1612919793648",
            "x-apigw-partnerid": "papago",
            "cookie": "NNB=MMUTUFGDLONF6; NRTK=ag#30s_gr#2_ma#-2_si#2_en#0_sp#0; ASID=70d97a1c00000175c05a8c8b00005e56; nx_ssl=2; _gid=GA1.2.1311689521.1612847211; JSESSIONID=DBABF9FCBC267C161B1CEA81CBA03FEB; _ga=GA1.2.594285439.1598922588; papago_skin_locale=ko; _ga_7VKFYR6RV1=GS1.1.1612919710.219.1.1612919770.60"
        },
        "referrer": "https://papago.naver.com/",
        "referrerPolicy": "origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    });

    const data = await rs.json();
    let entry = data.items[0].entry;
    entry = entry.replace("<b>", "").replace("</b>", "").toLowerCase();
    console.log(entry)
    if (key != entry) {
        newDic[key].ref = [entry];
    }
    newDic[entry] = {};
    newDic[entry].audio = await papagoAudio(entry);
    let phoneticSigns = data.items[0].phoneticSigns;
    if (phoneticSigns && phoneticSigns.length > 0) {
        newDic[entry].phonetic = phoneticSigns[0].sign;
    }
    let poss = data.items[0].pos;
    if (poss && poss.length > 0) {
        newDic[entry].means = new Array();
        poss.forEach(poit => {
            var mean = {}
            if (poit.type) {
                mean.type = poit.type;
            }

            if (poit.meanings && poit.meanings.length > 0) {
                mean.mean = new Array();
                poit.meanings.forEach(pmit => {
                    mean.mean.push(pmit.meaning);
                });
            }

            newDic[entry].means.push(mean);
        });
    }
    fs.writeFileSync('words.js', 'const WORDS = ' + JSON.stringify(newDic), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}

//audio make id
function makeID(key) {
    // var reqQuery = {"alpha":0,"pitch":0,"speaker":"clara","speed":0,"text":key};
    // var reqQueryStr = qs.escape(JSON.stringify(reqQuery));
    return fetch("https://papago.naver.com/apis/tts/makeID", {
        "headers": {
            "accept": "application/json",
            "accept-language": "ko",
            "authorization": "PPG de6416b3-21d7-4642-a2a3-0d9e458f10f6:E3ijiBtJQp7Bm+xbdNDYUA==",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "timestamp": "1612927204110",
            "cookie": "NNB=MMUTUFGDLONF6; NRTK=ag#30s_gr#2_ma#-2_si#2_en#0_sp#0; ASID=70d97a1c00000175c05a8c8b00005e56; nx_ssl=2; _gid=GA1.2.1311689521.1612847211; papago_skin_locale=ko; JSESSIONID=001DDC44ECB967DCF439B1012CF41363; _ga=GA1.2.594285439.1598922588; _ga_7VKFYR6RV1=GS1.1.1612921669.220.1.1612924577.60"
        },
        "referrer": "https://papago.naver.com/",
        "referrerPolicy": "origin",
        "body": "alpha=0&pitch=0&speaker=clara&speed=0&text=" + key,
        "method": "POST",
        "mode": "cors"
    });
}

//딕셔널이에서 audio없으면 가져와라.
async function papagoAudio(desc) {
    let rs = await makeID(desc);
    let json = await rs.json();
    return "https://papago.naver.com/apis/tts/" + json.id;
}

//데이터 가져오기.
papagoStart();

// papago('that’s');
// papagoStartFromDic();


//dictionary에서 audio없으면 가져오기.
// papagoAudio();

