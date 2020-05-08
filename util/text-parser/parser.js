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

async function start() { // We need to wrap the loop into an async function for this to work
    var sw = true;
    for (var i = 0; i < source.length; i += 3) {
        console.log('<div class="sentence-container">\n' +
            '    <div class="sentence first-language ' + (sw ? 'maleBeforeIcon' : 'femaleBeforeIcon') + '">')
        console.log(source[i + 1]);
        console.log("</div>\n" +
            "    <div class=\"sentence second-language hide\">");
        console.log(source[i + 2]);
        console.log("</div>\n" +
            "</div>");
        sw = !sw;
        // console.log(source[i+2]);
        // console.log(source[i], source[i+1], source[i+2]);
        await timer(100); // then the created Promise can be awaited
    }
}

// start();


async function papagoStart() { // We need to wrap the loop into an async function for this to work
    var sw = true;

    for (var i = 0; i < source.length; i += 3) {
        var content = source[i + 1];
        console.log(content);
        content = content.replace(/[\{\}\[\]\/?.,;:|\)*~!^\-_+<>@\#$%&\\\=\(\"]/gi, ' ');
        content = content.toLowerCase();
        content = content.trim();
        let split = content.split(" ");
        split.forEach(it => {
            if (it && isNaN(it) && !dic.dictionary[it]) {
                newDic[it] = {}
            }
        });
    }



    let keys = Object.keys(newDic);
    for (let i = 0; i < keys.length; i++) {
        var key = keys[i];
        await timer(100);
        papago(key);

    }
}
async function papagoStartFromDic() { // We need to wrap the loop into an async function for this to work
    let dicKeys = Object.keys(dic.dictionary);
    dicKeys.forEach(it => {
        if(Object.keys(dic.dictionary[it]).length == 0){
            newDic[it] = {}
        }
    })

    console.log(newDic);

    let keys = Object.keys(newDic);
    for (let i = 0; i < keys.length; i++) {
        var key = keys[i];
        await timer(100);
        papago(key);

    }
}




function papago(key) {
    var reqQuery = {"source":"en","target":"ko","text":key,"locale":"ko"};
    var reqQueryStr = qs.escape(JSON.stringify(reqQuery));

    fetch("https://papago.naver.com/apis/dictionary/search?data="+reqQueryStr, {
        "headers": {
            "accept": "application/json",
                "accept-language": "ko,en-US;q=0.9,en;q=0.8,ja;q=0.7,ru;q=0.6,ko-KR;q=0.5",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "pragma": "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-apigw-partnerid": "papago",
                "cookie": "NNB=I7NSCC3WFFRV2; ASID=70d97a1c0000016daa89c8800000005a; _ga_EP5X7Y3XQ9=GS1.1.1572412237.1.1.1572412241.56; NFS=1; MM_NEW=1; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; _ga_4BKHBFKFK0=GS1.1.1587111219.2.0.1587111219.60; nx_ssl=2; NRTK=ag#30s_gr#4_ma#-2_si#0_en#0_sp#-2; _gid=GA1.2.420595960.1588228640; nid_inf=-1189952384; NID_AUT=nazGx3cvUXAHdoRwOjepSh7bK4xKpnM4Eii8nomUF6sdHqhTBGIJIX4VS7XEvf5H; NID_JKL=gsy1xP/9XkLTVvTcUnPuczSvotsvSvc2cVAUG3zrS9A=; page_uid=Uqp34dp0JXVsst+UpL0ssssssBs-193850; BMR=s=1588248909838&r=https%3A%2F%2Fm.blog.naver.com%2FPostView.nhn%3FblogId%3Dchandong83%26logNo%3D220787148340%26proxyReferer%3Dhttps%3A%252F%252Fwww.google.com%252F&r2=https%3A%2F%2Fwww.google.com%2F; NID_SES=AAABjik9//gGaX0jahPpnZrDcCzfYsGKOUB6VB6UZ7x+GGP21HoGOB6vYyMRqOE4y531DZRWEzRK1VFKL39trwDhNV0T5IM5siz+guC55C0cEJCODa2BjcwoNIReht3Qg/4rkT7qxbddMimWy4bTj2+6FZ22EMMMTA0UbZbakr8hLIajImeaUsITC9S9D2+zTCPJMa/c3m5D7yUFqv8gH7Ddyl1LVc393SQTYryj/JTbT3QZPleXu1VVJsBQ1VBOI7R1r6Cnt3Pn8LjQEc4WvkwgUE6fSzeiQKaKuIhCPgduSGpu80H6w9D+Ep1KYdF0MEIwQolZj3UERZzX45ExupYwGPsOGy7BWb6Q8mLW0gm8T/mjQWW5awJlm93HrFpKFBZQ1fy2zO3BpToipW2Rr5w5qOW5IW/ts+ot5Mdzba8fDS2rD/lV7SU/NedTMlVAAZiwQxvA+OK7Q23xJOIJGjPF/gA88yBVC93Ze9i/l0nHhVdPHY3jI8gmslfAoDyRfCXZtd9mJTDj0obDzFHpfK61rdE=; _ga=GA1.1.751489791.1566779766; _ga_7VKFYR6RV1=GS1.1.1588255753.165.1.1588255766.47; JSESSIONID=0EC279487C01520F11FC57639B8D350A"
        },
        "referrer": "https://papago.naver.com/",
            "referrerPolicy": "origin",
            "body": null,
            "method": "GET",
            "mode": "cors"
    }).then((rs) => {
        rs.json().then(data => {
            let entry = data.items[0].entry;
            entry = entry.replace("<b>", "").replace("</b>","").toLowerCase();
            console.log(entry)

            if(key != entry) {
                newDic[key].ref=[entry];
            }
            newDic[entry] = {};

            let phoneticSigns = data.items[0].phoneticSigns;
            if (phoneticSigns && phoneticSigns.length>0){
                newDic[entry].phonetic = phoneticSigns[0].sign;
            }
            let poss = data.items[0].pos;
            if (poss && poss.length>0) {
                newDic[entry].means = new Array();
                poss.forEach(poit => {
                    var mean = {}
                    if (poit.type){
                        mean.type = poit.type;
                    }

                    if(poit.meanings && poit.meanings.length>0) {
                        mean.mean = new Array();
                        poit.meanings.forEach(pmit=>{
                            mean.mean.push(pmit.meaning);
                        });
                    }

                    newDic[entry].means.push(mean);
                });
            }

            fs.writeFileSync('data.json', JSON.stringify(newDic), (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });
            // console.log(JSON.stringify(newDic[entry]));
        })
    });
}

function makeID(key) {
    var reqQuery = {"alpha":0,"pitch":0,"speaker":"clara","speed":0,"text":key};
    var reqQueryStr = qs.escape(JSON.stringify(reqQuery));
    return fetch("https://papago.naver.com/apis/tts/makeID", {
        "headers": {
            "accept": "application/json",
                "accept-language": "ko",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "pragma": "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": "NNB=I7NSCC3WFFRV2; ASID=70d97a1c0000016daa89c8800000005a; _ga_EP5X7Y3XQ9=GS1.1.1572412237.1.1.1572412241.56; NFS=1; MM_NEW=1; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; _ga_4BKHBFKFK0=GS1.1.1587111219.2.0.1587111219.60; nx_ssl=2; NRTK=ag#30s_gr#4_ma#-2_si#0_en#0_sp#-2; _gid=GA1.2.420595960.1588228640; nid_inf=-1189952384; NID_AUT=nazGx3cvUXAHdoRwOjepSh7bK4xKpnM4Eii8nomUF6sdHqhTBGIJIX4VS7XEvf5H; NID_JKL=gsy1xP/9XkLTVvTcUnPuczSvotsvSvc2cVAUG3zrS9A=; page_uid=Uqp34dp0JXVsst+UpL0ssssssBs-193850; BMR=s=1588248909838&r=https%3A%2F%2Fm.blog.naver.com%2FPostView.nhn%3FblogId%3Dchandong83%26logNo%3D220787148340%26proxyReferer%3Dhttps%3A%252F%252Fwww.google.com%252F&r2=https%3A%2F%2Fwww.google.com%2F; NID_SES=AAABjiWp2TXCt3+scymtdmNEmqEJh2M+JagL/BEnEpePyX1XMm66x9UEz27YYTswi2mUZPTtMwjjsmN+oQp7X0/TnQjM2bfaAfpA1DhGyB4FEJkC1loaRriABY4kgigz7jqZpyUQnej9gHoOkqB5tuyFOXkrP23Ezm9q8EToP7QiCorPL+iqRdv/tIsKGXy+NNXb012EP5TjkrkrItws6oRNpigNxjxCIDnPg/2C4AXdxjxJaZrLgAMCUAl3OR/ZHQ35l7w0ZWcGt2G7vEtxt5f0E2rRNcMmfSM4w6NBDPW/vJFTTn7TJQPXSv5NqVy+Mi0ajCAqnTQTESeXGhbEnOtszlC2pTsg8jnZHWbCv3BNX8cy1YqAxUZeNqmcoLi3B+K9EC2DqOaT0Kh3f94ZmSZtPdKWqjRmb3baHcoQwFpw8/Zy2/NOj2koozwhB3NJR1jnh+mWcjiKoPraxzLOh8YMRhIopD7lkDM1WcpowTZsfX8SKRBCQBO6YNhcWCaSguyi8Qr/O/ZQUp055M6ZCx2p5m0=; _dc_gtm_UA-143406770-1=1; JSESSIONID=F5F1C5DA93144D06B7AC1062135D3C06; _ga=GA1.1.751489791.1566779766; _ga_7VKFYR6RV1=GS1.1.1588255753.165.1.1588259466.59"
        },
        "referrer": "https://papago.naver.com/",
            "referrerPolicy": "origin",
            "body": "data="+reqQueryStr,
            "method": "POST",
            "mode": "cors"
    });
}

async function papagoAudio() {
    let keys = Object.keys(dic.dictionary);
    for (let i = 0; i < keys.length; i++) {
        var key = keys[i];
        let at = dic.dictionary[key];
        if (!at.audio) {
            // await timer(600);
            let rs = await makeID(key);
            let json = await rs.json();
            at.audio = "https://papago.naver.com/apis/tts/"+json.id;
            console.log(key, json.id);
            // console.log(key);
        }
    }

    console.log(JSON.stringify(dic.dictionary));

}

// papagoStart();

// papago('that’s');
// papagoStartFromDic();
papagoAudio();

