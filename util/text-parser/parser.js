const fetch = require('node-fetch');
var qs = require('querystring');
const fs = require('fs');
// import utf8 from 'utf8';
// const dic = require('../../english/dictionary');
const source = require('./source.json');
const {encode} = require('querystring');
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
            await timer(1000);
            papago(key);
    }
    console.log('done');
}

// 키안에 자식이 없으면 만들어서 물어본다
async function papagoTranslate(desc) {
    desc = qs.escape(desc);
    const header =         {
        "accept": "application/json",
        "accept-language": "ko",
        "authorization": "PPG 2322572d-999d-46b0-a664-4156f133d4b1:5IeLHxLDClnqdZdNvd7zOQ==",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "device-type": "pc",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "timestamp": "1733285106123",
        "x-apigw-partnerid": "papago",
        "cookie": "ba.uuid=0; papago_skin_locale=ko; nid_inf=62332034; NID_JKL=XmMx/LDo/NNWL6QNlrL0LXmLJEsSORiL6KwryHOg+0s=; BUC=pZ2_zStVG47An9vekOtjnsjmZ6uyifRRyPDOGkglql4=; JSESSIONID=69FA72FB3C18EE7D9EBA4E3F9E0E3082",
        "Referer": "https://papago.naver.com/",
        "Referrer-Policy": "origin"
    }
    const rs = await fetch("https://papago.naver.com/apis/n2mt/translate", {
        "headers": header,
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
    const header = {
        "accept": "application/json",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "authorization": "PPG 2322572d-999d-46b0-a664-4156f133d4b1:xYZkeP5shYMZQh+n9PfetA==",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "timestamp": "1733285145157",
        "x-apigw-partnerid": "papago",
        "cookie": "ba.uuid=0; papago_skin_locale=ko; nid_inf=62332034; NID_JKL=XmMx/LDo/NNWL6QNlrL0LXmLJEsSORiL6KwryHOg+0s=; JSESSIONID=69FA72FB3C18EE7D9EBA4E3F9E0E3082; BUC=h8VcNr2C6vgp7awsjz1HKF7xCyBWdUxM7Gy4-yDhep8=",
        "Referer": "https://papago.naver.com/",
        "Referrer-Policy": "origin"
    };

    const url = `https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text=${encodeURIComponent(key)}&locale=ko`;
    console.log('url-->',url)
    const rs = await fetch(`https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text=${encodeURIComponent(key)}&locale=ko`, {
        "headers": header,
        "body": null,
        "method": "GET"
    });

    const data = await rs.json();
    if (data.items === undefined || data.items.length == 0) {
        console.log('no data-->',key)
        return;

    }
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

