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
            await timer(100);
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
            "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:vM9Ar1U99y4hRFKyzxUpRg==",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "device-type": "pc",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "timestamp": "1732977550942",
            "x-apigw-partnerid": "papago",
            "cookie": "NNB=SKQQ5PAP27UGM; NAC=Q5TrBUwO2AC3; ASID=dd9176920000019214f43d6200000066; NID_AUT=ZbWsF4vWnP/Zb1v/0XgvQSMPHRNsZisOS2WsFLafLx6xZt51oU3GymJSCQC1/FFk; NID_JKL=jNyMaTQ4LBDEKswuwL7EYibhNQAvwMfK6K/cqFkwjUA=; _ga_451MFZ9CFM=GS1.1.1730869723.1.1.1730870528.0.0.0; _ga=GA1.2.1229246194.1730869723; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; ba.uuid=aa2262cd-3425-4887-af58-23af953e3916; papago_skin_locale=ko; NACT=1; NID_SES=AAABxbPSJ5cTb7L2H29gfpung12o9OXkyrsMNrLMv7/BhvqwJLI6zUyP9fdymdsderF6eyBQWa0xMI2p+iVGu2CS49JM33DnpkBm+qPsO5B4ilqJHnYSl8Hb9qom5BW/j+aDlgXz/pDtaTPcVW1/EaikO7I1c+YZ6wA/Fp01X6fEcrm4Ej+vwPmKx8V4xmQxQZtJjDSa9Ze3SusolHG+b404OWQSniFOw36Ub0nvo9kbY2MnKfhoQJn0BC+33+Fr4ZLbXigyPXhQKBETfK/a24+yfW12WsP9PPlHkgtaQqk4nJ3CWA4LzIQdJTp5tC2JKl/lmnGjjSQa0D1nBCtxTGMQK53EdjXUsfxHiZ2+kRn9fkWxKNSDt7tZAURwk2o5l9BnZy3Xxu+opOmOlexq9fpvGDxs1LiUdS3n10x26Em/MzUlzI2LXkaH/cHJrxZAA9hKffKHwhbxAD7V0S2WiNu1OXFYoLTn7N2xjxcn4lAzemPHfj55MiKUlr07fxeMt6uKcQyK1sd8HmdtQjq7qXaVgnsHsVrh3ZfP7Xpo+eMVAeksTwnsOBhRDaECtTtQywXCv37v0KraER2dqtFoKTcjwhy870mLHeLCIFZbqKQBJUgG; JSESSIONID=C139ABCA1437B3A747516C20C6E76850; BUC=WGMdfL7pOkC-doY-Cw9CNO4KxGLfzdFlH7IjyEQf668=",
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
        "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:VqQX+CBcM5RLh+tx9N3tog==",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "timestamp": "1732978606703",
        "x-apigw-partnerid": "papago",
        "cookie": "NNB=SKQQ5PAP27UGM; NAC=Q5TrBUwO2AC3; ASID=dd9176920000019214f43d6200000066; NID_AUT=ZbWsF4vWnP/Zb1v/0XgvQSMPHRNsZisOS2WsFLafLx6xZt51oU3GymJSCQC1/FFk; NID_JKL=jNyMaTQ4LBDEKswuwL7EYibhNQAvwMfK6K/cqFkwjUA=; _ga_451MFZ9CFM=GS1.1.1730869723.1.1.1730870528.0.0.0; _ga=GA1.2.1229246194.1730869723; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; ba.uuid=aa2262cd-3425-4887-af58-23af953e3916; papago_skin_locale=ko; NACT=1; NID_SES=AAABxbPSJ5cTb7L2H29gfpung12o9OXkyrsMNrLMv7/BhvqwJLI6zUyP9fdymdsderF6eyBQWa0xMI2p+iVGu2CS49JM33DnpkBm+qPsO5B4ilqJHnYSl8Hb9qom5BW/j+aDlgXz/pDtaTPcVW1/EaikO7I1c+YZ6wA/Fp01X6fEcrm4Ej+vwPmKx8V4xmQxQZtJjDSa9Ze3SusolHG+b404OWQSniFOw36Ub0nvo9kbY2MnKfhoQJn0BC+33+Fr4ZLbXigyPXhQKBETfK/a24+yfW12WsP9PPlHkgtaQqk4nJ3CWA4LzIQdJTp5tC2JKl/lmnGjjSQa0D1nBCtxTGMQK53EdjXUsfxHiZ2+kRn9fkWxKNSDt7tZAURwk2o5l9BnZy3Xxu+opOmOlexq9fpvGDxs1LiUdS3n10x26Em/MzUlzI2LXkaH/cHJrxZAA9hKffKHwhbxAD7V0S2WiNu1OXFYoLTn7N2xjxcn4lAzemPHfj55MiKUlr07fxeMt6uKcQyK1sd8HmdtQjq7qXaVgnsHsVrh3ZfP7Xpo+eMVAeksTwnsOBhRDaECtTtQywXCv37v0KraER2dqtFoKTcjwhy870mLHeLCIFZbqKQBJUgG; JSESSIONID=C139ABCA1437B3A747516C20C6E76850; BUC=M2bXdlfuzPv8hqmVEuve3MiFb-VpdjAxXTFqYf0akCI=",
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

