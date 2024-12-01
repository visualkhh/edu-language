const fetch = require('node-fetch');
var qs = require('querystring');
const fs = require('fs');
// import utf8 from 'utf8';
// const dic = require('../../english/dictionary');
const source = require('./source.json');
const {encode} = require('querystring');
const newDic = {
    "is": {},
    "it": {},
    "for": {},
    "to": {},
    "about": {},
    "of": {},
    "as": {},
    "because": {},
    "that": {},
    "with": {},
    "and": {},
    "when": {},
    "was": {},
    "is was": {},
    "Where": {},
    "which": {},
    "there": {},
    "through": {},
    "might": {},
    "both": {},
    "would": {},
    "instead": {},
    "Our": {},
    "let": {},
    "other": {},
    "afraid": {},
    "helpful": {},
    "these": {},
    "recommended": {},
    "breed": {},
    "blessd": {},
    "poor": {},
    "maintain": {},
    "just as": {},
    "as in": {},
    "infer": {},
    "passage": {},
    "Since": {},
    "compatibility": {},
    "close": {},
    "period": {},
    "listen up": {},
    "we got a keep movin": {},
    "rescue": {},
    "got": {},
    "Flood": {},
    "ever": {},
    "make": {},
    "Blow": {},
    "itch": {},
    "bring": {},
    "dish": {},
    "wear": {},
    "Disaster": {},
    "mercy": {},
    "bottle": {},
    "Standardized": {},
    "Kneel": {},
    "He'll": {},
    "we've": {},
    "scapes": {},
    "either": {},
    "consists": {},
    "several": {},
    "tremulous": {},
    "hedges": {},
    "bushy": {},
    "all right": {},
    "l'll": {},
    "grass": {},
    "then": {},
    "guess": {},
    "are": {},
    "much": {},
    "more": {},
    "liking": {},
    "your": {},
    "approval": {},
    "them": {},
    "floor": {},
    "That's": {},
    "dear": {},
    "says": {},
    "lying": {},
    "doing": {},
    "gowns": {},
    "chariot": {},
    "washed": {},
    "sleepy": {},
    "thirsty": {},
    "strike": {},
    "accident": {},
    "experiencing": {},
    "predecessor": {},
    "did": {},
    "knew": {},
    "stayed": {},
    "stayed  in the black": {},
    "purchased": {},
    "Of course.": {},
    "formal introduction": {},
    "journalism": {},
    "require": {},
    "cause": {},
    "firing": {},
    "should": {},
    "discuss": {},
    "bitch": {},
    "amimal rights advocate": {},
    "tireless": {},
    "passed away last night": {},
    "wrote": {},
    "gossiping": {},
    "jewelry": {},
    "bear": {},
    "spoke": {},
    "were": {},
    "polite": {},
    "being": {},
    "not just in his heart": {},
    "lips": {},
    "obituary": {},
    "illness": {},
    "away": {},
    "left an ": {},
    "indelible": {},
    "syphilis": {},
    "memorialize": {},
    "losses": {},
    "awful": {},
    "though": {},
    "magnificent.": {},
    "their": {},
    "sound full": {},
    "achievement": {},
    "That's what I want": {},
    "wrong": {},
    "question": {},
    "reasonable": {},
    "surprise": {},
    "I've": {},
    "couldn't": {},
    "handle": {},
    "thought": {},
    "completely": {},
    "unreasonable": {},
    "what everybody does": {},
    "had": {},
    "motivated": {},
    "achieved": {},
    "deal": {},
    "here's": {},
    "few": {},
    "potential": {},
    "post-mortem ": {},
    "incident": {},
    "happened": {},
    "shall": {},
    "caused": {},
    "corrected": {},
    "resolved": {},
    "insight": {},
    "westerner’s": {},
    "will": {},
    "Would": {},
    "Should": {},
    "Had": {},
    "ridiculous": {},
    "humor": {},
    "recognition": {},
    "honestly": {},
    "absolutely": {},
    "opportunity": {},
    "along": {},
    "another": {},
    "could": {},
    "our": {},
    "reach": {},
    "us": {},
    "24/7": {},
    "nearby": {},
    "recommend": {},
    "famous": {},
    "itinerary": {},
    "certainly": {},
    "suggestion": {},
    "went": {},
    "somebody": {},
    "confuse": {},
    "someone": {},
    "confuse A with B": {},
    "look like N": {},
    "By the Way": {},
    "along with": {},
    "by": {},
    "on": {},
    "At": {},
};

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}


//딕셔널이에 없는값들만 골라서 파파고에 물어본다.
async function papagoStart() {

    let keys = Object.keys(newDic);
    for (let i = 0; i < keys.length; i++) {
        var key = keys[i];
            await timer(1000);
            papago(key);
    }
    console.log('done');
}


async function papago(key) {
    // var reqQuery = {"source":"en","target":"ko","text":key,"locale":"ko"};
    // var reqQueryStr = qs.escape(JSON.stringify(reqQuery));
    const header = {
        "accept": "application/json",
        "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:AcFgkjf2IYZmo0+a3G8QJQ==",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "timestamp": "1733051097848",
        "x-apigw-partnerid": "papago",
        "Referer": "https://papago.naver.com/",
        "Referrer-Policy": "origin"
    };

    const url = `https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text=${encodeURIComponent(key)}&locale=ko`;
    console.log('url-->',url)
    const rs = await fetch(`https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text=${encodeURIComponent(key)}&locale=ko`, {
        "headers": header,
        "method": "GET"
    });
    // const rs = await fetch("https://papago.naver.com/apis/dictionary/search?source=en&target=ko&text=live&locale=ko", {
    //     "headers": {
    //         "accept": "application/json",
    //         "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    //         "authorization": "PPG bd769290-8a5f-437a-910e-498c14ccca9f:+2fOsHa8c77KTgPVyrHWfw==",
    //         "cache-control": "no-cache",
    //         "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    //         "pragma": "no-cache",
    //         "priority": "u=1, i",
    //         "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
    //         "sec-ch-ua-mobile": "?0",
    //         "sec-ch-ua-platform": "\"macOS\"",
    //         "sec-fetch-dest": "empty",
    //         "sec-fetch-mode": "cors",
    //         "sec-fetch-site": "same-origin",
    //         "timestamp": "1733051292815",
    //         "x-apigw-partnerid": "papago",
    //         "cookie": "NNB=SKQQ5PAP27UGM; NAC=Q5TrBUwO2AC3; ASID=dd9176920000019214f43d6200000066; NID_AUT=ZbWsF4vWnP/Zb1v/0XgvQSMPHRNsZisOS2WsFLafLx6xZt51oU3GymJSCQC1/FFk; NID_JKL=jNyMaTQ4LBDEKswuwL7EYibhNQAvwMfK6K/cqFkwjUA=; _ga_451MFZ9CFM=GS1.1.1730869723.1.1.1730870528.0.0.0; _ga=GA1.2.1229246194.1730869723; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; ba.uuid=aa2262cd-3425-4887-af58-23af953e3916; NID_SES=AAAB0XT4FQHG96GX6cJIFfRTYPo5jt6AMKNk0ZEXLU9H7/XyAWdK58TaU98rAEtLU82Tbib1g49sNSUL/g51p66rUGkkFMZ4RdvPPgY28I6+jHPVLFqbuy7bMo5F+AQ11xN4Bmws15MomTg56Ks+0e9JAXqGwexV7ZSaBc17Ro+KuUbqADNr1y3wASByRTV1vc6Ju0AJy8G7Espi4Cwgshsv9VuonzVzWqan8T/d68AM0PB36IIaGn767zbbga4jT0XXasbUZ0hxa1ySI8zobvfZwSOLD9E8aNb43z4abGalpkwPCSrngCrwzQs2eE94trGuUkYp1NlCLTQA58/TnEhZ7tJVkxwfcnAVLEB4azSNMOVUjm5w5C+zjTqCVGshLPozRF9sNOshK9UXbAJ5dxNwXbpAnAfhSxXzFiZhNlKnQs9CwWDcedpG579RaBbU74kpnMCwCLSiHbMZejQEZTaEYGD5Fh5Bx93IGo87J9e9lTdBZdVMlZ3/9E4OhsumobbAevyXr0PQPI5xqlaRoklL0dksYsrfnRWmvT5QYr43oHTIcHmVdGT9uq5mh7C87fptpeFb+Icx/AgxMYE1tigwRXfp8DNjQ19mzdgCU4L/oFi3mLaOQCaJaOcWHJq3Th6UlA==; papago_skin_locale=ko; NACT=1; JSESSIONID=ED0ABB4BB90252E0D9FC6C75BC850FC8; BUC=NR2I8Uw6C1XpwkyGeXaOHsYJRC6sdQaPlcNjoaTKTIE=",
    //         "Referer": "https://papago.naver.com/",
    //         "Referrer-Policy": "origin"
    //     },
    //     "method": "GET"
    // });
    //
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

