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
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0",
            "Accept": "application/json",
            "Accept-Language": "ko",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "device-type": "pc",
            "x-apigw-partnerid": "papago",
            "Timestamp": "1620385743197",
            "Authorization": "PPG 8580801c-3987-4344-bcaf-ab385b3bd994:4b/sTtaj6j3/id8AYyZ6oQ=="
        },
        "referrer": "https://papago.naver.com/",
        "body": "deviceId=8580801c-3987-4344-bcaf-ab385b3bd994&locale=ko&dict=true&dictDisplay=30&honorific=false&instant=false&paging=false&source=en&target=ko&text="+desc+"&authroization=PPG%208580801c-3987-4344-bcaf-ab385b3bd994%3A4b%2FsTtaj6j3%2Fid8AYyZ6oQ%3D%3D&timestamp=1620385743197",
        "method": "POST",
        "mode": "cors"
    });
    const data = await rs.json();
    return data.translatedText;
}


async function papago(key) {
    // var reqQuery = {"source":"en","target":"ko","text":key,"locale":"ko"};
    // var reqQueryStr = qs.escape(JSON.stringify(reqQuery));
    const rs = await fetch("https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text="+key+"&locale=ko", {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0",
            "Accept": "application/json",
            "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-apigw-partnerid": "papago",
            "Timestamp": "1620385778668",
            "Authorization": "PPG 8580801c-3987-4344-bcaf-ab385b3bd994:EIe9HjezTRHASiM0VGVDag=="
        },
        "referrer": "https://papago.naver.com/",
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

// papago('word');
// papagoStartFromDic();


//dictionary에서 audio없으면 가져오기.
// papagoAudio();

