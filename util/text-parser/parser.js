const fetch = require('node-fetch');
var qs = require('querystring');
const fs = require('fs');
// import utf8 from 'utf8';
// const dic = require('../../english/dictionary');
const source = require('./source.json');
const newDic = {};

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}


//딕셔널이에 없는값들만 골라서 파파고에 물어본다.
async function papagoStart() {
    const descriptions = [];
    for (var i = 0; i < source.length; i += 1) {
        var content = source[i];
        if(!content) {
            continue;
        }
        var description = await papagoTranslate(content);
        var content_audio = ''; //await papagoAudio(content)
        // console.log('11')
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
        await papago(key);
    }
    console.log('done');
}

// 키안에 자식이 없으면 만들어서 물어본다
async function papagoTranslate(desc) {
    desc = qs.escape(desc);
    const rs = await fetch("https://papago.naver.com/apis/n2mt/translate", {
        "headers": {
            "accept": "application/json",
            "accept-language": "ko",
            "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:MN3Q69s+661+pxUsJxcDFA==",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "device-type": "pc",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "timestamp": "1732868114157",
            "x-apigw-partnerid": "papago",
            "Referer": "https://papago.naver.com/",
            "Referrer-Policy": "origin"
        },
        "body": "deviceId=bd769290-8a5f-437a-910e-498c14ccca9f&locale=ko&dict=true&dictDisplay=30&honorific=true&instant=false&paging=false&source=en&target=ko&text="+desc+"&usageAgreed=true",
        "method": "POST"
    });


    const data = await rs.json();
    console.log('------>',data)
    return data.translatedText;
}


async function papago(key) {
    // var reqQuery = {"source":"en","target":"ko","text":key,"locale":"ko"};
    // var reqQueryStr = qs.escape(JSON.stringify(reqQuery));
    const rs = await fetch("https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text="+key+"&locale=ko", {
        "headers": {
            "accept": "application/json",
            "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:pVWZzUbbvBuPMT5qK0vZOw==",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "timestamp": "1732865948526",
            "x-apigw-partnerid": "papago",
            "Referer": "https://papago.naver.com/",
            "Referrer-Policy": "origin"
        },
        "body": null,
        "method": "GET"
    });

    const data = await rs.json();
    let entry = data.items[0].entry;
    entry = entry.replace("<b>", "").replace("</b>", "").toLowerCase();
    console.log('-->',entry)
    if (key != entry) {
        newDic[key].ref = [entry];
    }
    newDic[entry] = {};
    newDic[entry].audio = ''; //await papagoAudio(entry);
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
            "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:dTuYJQGx04QOj0CSOecgHg==",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "timestamp": "1732865934440",
            "Referer": "https://papago.naver.com/",
            "Referrer-Policy": "origin"
        },
        "body": "alpha=0&pitch=0&speaker=clara&speed=0&text=hi"+ key,
        "method": "POST"
    });
}

//딕셔널이에서 audio없으면 가져와라.
async function papagoAudio(desc) {
    let rs = await makeID(desc);
    let json = await rs.json();
    return "https://papago.naver.com/apis/tts/" + json.id;
}

console.log('start!!!!!')
//데이터 가져오기.
papagoStart();

// papago('word');
// papagoStartFromDic();


//dictionary에서 audio없으면 가져오기.
// papagoAudio();

