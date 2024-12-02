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
        "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:VNddQLZVaiXDChkAUBIWPw==",
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
        "timestamp": "1733114274591",
        "x-apigw-partnerid": "papago",
        "cookie": "NNB=SKQQ5PAP27UGM; NAC=Q5TrBUwO2AC3; ASID=dd9176920000019214f43d6200000066; NID_AUT=ZbWsF4vWnP/Zb1v/0XgvQSMPHRNsZisOS2WsFLafLx6xZt51oU3GymJSCQC1/FFk; NID_JKL=jNyMaTQ4LBDEKswuwL7EYibhNQAvwMfK6K/cqFkwjUA=; _ga_451MFZ9CFM=GS1.1.1730869723.1.1.1730870528.0.0.0; _ga=GA1.2.1229246194.1730869723; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; ba.uuid=aa2262cd-3425-4887-af58-23af953e3916; NACT=1; papago_skin_locale=ko; NID_SES=AAAByfysAJnPTEo18R3UQz3uI7ddmaqiyLmFMdpGjo7rW5QrUeVLEhGyO2NOlVS15qN77sDm4S4ztOuYqlpG066vGJoaY2OanaivaJR2UvWg80Ie+LqSDwXYKwxEWRgUmw1R84xz4n778ki9NfYmFB0g4ThawXLD/CZ0cO8s3uEvMfbRdVWwtiaFP4ZO4BOfh/qH+H/WX/QMg1yzwBS7QOzu/9R7JoJD9QK4ka5Iq5707uot2b8bXnBBLw+rq5ad/bIsEWAgBYdWTRZS0/7BtTRYOWvItf77J25+8U7EqfyVl536cchix6lblc3yc3OIt5Vjmg/o9l1x/sjcr95Ci2KfJOUuL83m5cSJMPOQZknvYFFFfL3iKOmfvClF4rCsoTMigJg8g20+N2s8OuxxNe0c7Alei4M2/pWE6K0exRews2HmBE8n6WrOz08jn9wgBOV9icEMXsvnJxIMFAa419nGoZ4EWQmhFeoscWI/Ps5yoAjMRKQDf5BPB04lS0oLYryue9py57L+AtXVr3DuNKmFib+3uTdK4qUJVs0sopOTYOMH7Qt7tNXhkdBBnjT9iAX927smtaXuX/dfoxG/otMcOmJnE0xU1a7veU9/L5T/EFXG; JSESSIONID=8B0BCC936F1DE069E2FB0D8AA540EEB3; BUC=23dVqMq1chbiuIkAD3E4YL7xDSO2wubaP9eaLMGslow=",
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
        "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:02y4DLo+ruGxiBCTY08OGw==",
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
        "timestamp": "1733110889928",
        "x-apigw-partnerid": "papago",
        "cookie": "NNB=SKQQ5PAP27UGM; NAC=Q5TrBUwO2AC3; ASID=dd9176920000019214f43d6200000066; NID_AUT=ZbWsF4vWnP/Zb1v/0XgvQSMPHRNsZisOS2WsFLafLx6xZt51oU3GymJSCQC1/FFk; NID_JKL=jNyMaTQ4LBDEKswuwL7EYibhNQAvwMfK6K/cqFkwjUA=; _ga_451MFZ9CFM=GS1.1.1730869723.1.1.1730870528.0.0.0; _ga=GA1.2.1229246194.1730869723; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; ba.uuid=aa2262cd-3425-4887-af58-23af953e3916; NACT=1; NID_SES=AAAB1dwM9Dvz5aR3MQ4O19XE1hvoplf8HU8faMuEanqXuK3MXJ53H8i6yzFEko4sjGMAR4ND0/FABEkdjD+ElhUwnIMrjLpVWQP0ezJiVcSKuf5Z0jkaMHuECLUduod5gs/McM2pa8nkCNu5dklPIyFxNoxtt1h078ktwox5+/u9iYI284fzf9kD1kelUV/f5dW7AUzLqYmPwubWdCe0oEY/d3WptE0Y09wP1D/eEWv1yM4W/2PZ/phhzoLwhshmm8t5jxx8m5DuatCkPeWjntFibMTKggfE+t3Pn18Y0Wq2H2+rL730kBv2wY2kNDo/8lECd2TmsGyQCHpze3/ICSTRntog36CGMD1E+4nAwS0cPYeVqu/kO4hAvwsov4F6YZ3J6lTeTGxC1gX7wuw9lNV6xHBrNzSYzbYasAff7k4A6Qt+axBZMtOcMi55uELuWbL+mwIaHcL2tHRGH03HArM+cydt8XcDRT9tlN2yKBge2E5BdrKMjZaT82x1s6ILZ0f4kAMMEOHgSgkbfZWZYq31bLd3+VPwx3SsBacScoZEQiwZA4O1bWcZEaH0ns3I4uHKQqlVXhtoGb5XKxyr0yjbKMDDQAfzTqvSWle63rleXnIxV+08Pyv8g1OuERz0bGgzqA==; papago_skin_locale=ko; JSESSIONID=00446EF26A245FBEA2284F8E34E6B77B; BUC=qDwCp_WUSgLNUGB8ltuLeKIjWDpHnhOJif3C7z0fsLw=",
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

