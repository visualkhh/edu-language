const fetch = require('node-fetch');
var qs = require('querystring');
const fs = require('fs');
// import utf8 from 'utf8';
const dictionary = require('../../english/dictionary')
const newDic = {};
const sleep = (ms) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
// console.log(dictionary)
const dataMap = new Map();
fetch("https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8", {
    "headers": {
        "accept": "*/*",
        "accept-language": "ko,en-US;q=0.9,en;q=0.8,ja;q=0.7,ru;q=0.6,ko-KR;q=0.5",
        "authorization": "SAPISIDHASH 1588233868_7c544d27702038f4891bdc7af333600ebf848c7e",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "same-origin",
        "sec-fetch-site": "same-origin",
        "x-client-data": "CJW2yQEIprbJAQjEtskBCKmdygEIzavKAQjQr8oBCLywygEI7bXKAQiOusoB",
        "x-goog-authuser": "0",
        "x-goog-visitor-id": "CgtjV3J1ZjZVcUlTVSiOhar1BQ%3D%3D",
        "x-origin": "https://www.youtube.com",
        "cookie": "VISITOR_INFO1_LIVE=cWruf6UqISU; CONSENT=YES+KR.ko+201908; HSID=AIjYBQAsHwx2x3OEk; SSID=Aj2tcmvt6w6xk_tnq; APISID=cL1hn31xz8MFfWxW/Ao6PBc3r_Fa5HBZFy; SAPISID=_w818Ns-q3eAudmH/AhvEFZ1YDTOfH4gY-; __Secure-HSID=AIjYBQAsHwx2x3OEk; __Secure-SSID=Aj2tcmvt6w6xk_tnq; __Secure-APISID=cL1hn31xz8MFfWxW/Ao6PBc3r_Fa5HBZFy; __Secure-3PAPISID=_w818Ns-q3eAudmH/AhvEFZ1YDTOfH4gY-; LOGIN_INFO=AFmmF2swRQIgNctBdQ_IwCAh3RGO72gpvFNbuq0-j_VlblxmIEdTy90CIQCAuVYQRl-4lpHtjSUbBMA5DYZE8RBM5U6DAHL8MvTt1w:QUQ3MjNmeXliX1QwUnJOWjZuWTE4RXp0OG1QWDFvT216NnVQLVFpaUVnZHN1MnJoaU16MFVQbS1ZVEJEQUhEVTRpajU1UTZCU2ZvVE5IQXV0ZWRtMmp5Z3d2OWNvRFBiSkVNSkpxeFNIQmNhZGJWbnMxVDFNdkgtRnhWcENvczZobmY3dkJibk9POVowOTF3dkZReVhKWjJrOVo3dkFaR1JhaklrS0hGRG8tbXRSWFVqWEo1Qy00; SID=vAdrtAImlMTX9fCCav3TgxlGf_JOimGMNXjqa9rLjavCckPz7ev19OlTsK7rI_D2fjIS6w.; __Secure-3PSID=vAdrtAImlMTX9fCCav3TgxlGf_JOimGMNXjqa9rLjavCckPzmkU_NT18ycLinpB7j7ftjw.; PREF=al=ko&f1=50000000&f5=30&f4=4000000; YSC=nNsFLB8Jqts; SIDCC=AJi4QfFKzxRuTxi6nUvCoBeY8qc-I0I5cIuNWQYRmixCWBfXxudlNdWuI8K-9oC6Sf619aczHWRb"
    },
    "referrer": "https://www.youtube.com/watch?v=FlQYOZFnWRM",
    "referrerPolicy": "origin-when-cross-origin",
    "body": "{\"context\":{\"client\":{\"hl\":\"ko\",\"gl\":\"KR\",\"visitorData\":\"CgtjV3J1ZjZVcUlTVSiOhar1BQ%3D%3D\",\"userAgent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36,gzip(gfe)\",\"clientName\":\"WEB\",\"clientVersion\":\"2.20200429.03.00\",\"osName\":\"Macintosh\",\"osVersion\":\"10_15_4\",\"browserName\":\"Chrome\",\"browserVersion\":\"81.0.4044.129\",\"screenWidthPoints\":798,\"screenHeightPoints\":948,\"screenPixelDensity\":2,\"utcOffsetMinutes\":540,\"userInterfaceTheme\":\"USER_INTERFACE_THEME_LIGHT\"},\"request\":{\"sessionId\":\"6821168405059736507\",\"internalExperimentFlags\":[],\"consistencyTokenJars\":[]},\"user\":{},\"clientScreenNonce\":\"joKqXrntHcq3qQGr0ryIBw\",\"clickTracking\":{\"clickTrackingParams\":\"CAQQxqYCIhMIh_3cmtiP6QIVbleFCh2snAAP\"}},\"params\":\"CgtGbFFZT1pGbldSTRIOQ2dBU0FtVnVHZ0ElM0Q%3D\"}",
    "method": "POST",
    "mode": "cors"
})
    .then((rs) => rs.json())
    .then((data) => {
        console.log(data);
        let cueGroups = data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.body.transcriptBodyRenderer.cueGroups;
        // console.log(data.actions[0]);
        for (let i = 0; i < cueGroups.length; i++) {
            let cueGroup = cueGroups[i];
            let simpleText = cueGroup.transcriptCueGroupRenderer.formattedStartOffset.simpleText.trim();
            let cue = cueGroup.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer.cue.simpleText;
            dataMap.set(simpleText, {"en": cue});
        }
    })
    .then(_ => fetch("https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8", {
        "headers": {
            "accept": "*/*",
            "accept-language": "ko,en-US;q=0.9,en;q=0.8,ja;q=0.7,ru;q=0.6,ko-KR;q=0.5",
            "authorization": "SAPISIDHASH 1588234545_159d06b26bc6d4a8f0c87fe3928e278819d5855b",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "same-origin",
            "sec-fetch-site": "same-origin",
            "x-client-data": "CJW2yQEIprbJAQjEtskBCKmdygEIzavKAQjQr8oBCLywygEI7bXKAQiOusoB",
            "x-goog-authuser": "0",
            "x-goog-visitor-id": "CgtjV3J1ZjZVcUlTVSiOhar1BQ%3D%3D",
            "x-origin": "https://www.youtube.com",
            "cookie": "VISITOR_INFO1_LIVE=cWruf6UqISU; CONSENT=YES+KR.ko+201908; HSID=AIjYBQAsHwx2x3OEk; SSID=Aj2tcmvt6w6xk_tnq; APISID=cL1hn31xz8MFfWxW/Ao6PBc3r_Fa5HBZFy; SAPISID=_w818Ns-q3eAudmH/AhvEFZ1YDTOfH4gY-; __Secure-HSID=AIjYBQAsHwx2x3OEk; __Secure-SSID=Aj2tcmvt6w6xk_tnq; __Secure-APISID=cL1hn31xz8MFfWxW/Ao6PBc3r_Fa5HBZFy; __Secure-3PAPISID=_w818Ns-q3eAudmH/AhvEFZ1YDTOfH4gY-; LOGIN_INFO=AFmmF2swRQIgNctBdQ_IwCAh3RGO72gpvFNbuq0-j_VlblxmIEdTy90CIQCAuVYQRl-4lpHtjSUbBMA5DYZE8RBM5U6DAHL8MvTt1w:QUQ3MjNmeXliX1QwUnJOWjZuWTE4RXp0OG1QWDFvT216NnVQLVFpaUVnZHN1MnJoaU16MFVQbS1ZVEJEQUhEVTRpajU1UTZCU2ZvVE5IQXV0ZWRtMmp5Z3d2OWNvRFBiSkVNSkpxeFNIQmNhZGJWbnMxVDFNdkgtRnhWcENvczZobmY3dkJibk9POVowOTF3dkZReVhKWjJrOVo3dkFaR1JhaklrS0hGRG8tbXRSWFVqWEo1Qy00; SID=vAdrtAImlMTX9fCCav3TgxlGf_JOimGMNXjqa9rLjavCckPz7ev19OlTsK7rI_D2fjIS6w.; __Secure-3PSID=vAdrtAImlMTX9fCCav3TgxlGf_JOimGMNXjqa9rLjavCckPzmkU_NT18ycLinpB7j7ftjw.; PREF=al=ko&f1=50000000&f5=30&f4=4000000; YSC=nNsFLB8Jqts; SIDCC=AJi4QfE5T75W8NubTfqhyi1FB7dOp2nObFJeeu-cuGD13O_SPpmZap-JB9K6Rf6Y3ErfDsteWonp"
        },
        "referrer": "https://www.youtube.com/watch?v=FlQYOZFnWRM",
        "referrerPolicy": "origin-when-cross-origin",
        "body": "{\"context\":{\"client\":{\"hl\":\"ko\",\"gl\":\"KR\",\"visitorData\":\"CgtjV3J1ZjZVcUlTVSiOhar1BQ%3D%3D\",\"userAgent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36,gzip(gfe)\",\"clientName\":\"WEB\",\"clientVersion\":\"2.20200429.03.00\",\"osName\":\"Macintosh\",\"osVersion\":\"10_15_4\",\"browserName\":\"Chrome\",\"browserVersion\":\"81.0.4044.129\",\"screenWidthPoints\":798,\"screenHeightPoints\":948,\"screenPixelDensity\":2,\"utcOffsetMinutes\":540,\"userInterfaceTheme\":\"USER_INTERFACE_THEME_LIGHT\"},\"request\":{\"sessionId\":\"6821168405059736507\",\"internalExperimentFlags\":[],\"consistencyTokenJars\":[]},\"user\":{},\"clientScreenNonce\":\"joKqXrntHcq3qQGr0ryIBw\",\"clickTracking\":{\"clickTrackingParams\":\"CAMQxqYCIhMIv8CjnNiP6QIVZUL1BR0zLg12\"}},\"params\":\"CgtGbFFZT1pGbldSTRIOQ2dBU0FtdHZHZ0ElM0Q%3D\"}",
        "method": "POST",
        "mode": "cors"
    }))
    .then((rs) => rs.json())
    .then((data) => {
        let cueGroups = data.actions[0].updateEngagementPanelAction.content.transcriptRenderer.body.transcriptBodyRenderer.cueGroups;
        for (let i = 0; i < cueGroups.length; i++) {
            let cueGroup = cueGroups[i];
            let simpleText = cueGroup.transcriptCueGroupRenderer.formattedStartOffset.simpleText.trim();
            let cue = cueGroup.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer.cue.simpleText;
            let newVar = dataMap.get(simpleText);
            if (newVar) {
                newVar.ko = cue;
            }
        }
    })
    .then(_ => {
        dataMap.forEach((v, k) => {
            console.log(v, k);
        })

    })
    .then(_ => {
        var di = 0;
        dataMap.forEach((v, k) => {
            // if (k != '00:06') {
            //     return;
            // }
            di++;
            let split = v.en.split(" ");
            // console.log(split);

            // split = split.slice(0,1);

            var si = 0;
            split.forEach((it) => {


                it = it.replace(/[\{\}\[\]\/?.,;:|\)*~!^\-_+<>@\#$%&\\\=\(\"]/gi, ' ');
                it = it.toLowerCase();
                it = it.trim();
                if (dictionary.dictionary[it] || newDic[it]) {
                    console.log(k+"pass=>"+di +"=>"+si);
                    return;
                } else {
                    console.log(k+"go=>"+di +"=>"+si);
                }
                si++;
                setTimeout(()=>{

                    if (dictionary.dictionary[it] || newDic[it]) {
                        console.log(k+"pass=>"+di +"=>"+si);
                        return;
                    } else {
                        console.log(k+"go=>"+di +"=>"+si);
                    }

                    var reqQuery = {"source":"en","target":"ko","text":it,"locale":"ko"};

                    var reqQueryStr = qs.escape(JSON.stringify(reqQuery));
                    console.log(reqQueryStr);

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
                            "cookie": "NNB=I7NSCC3WFFRV2; ASID=70d97a1c0000016daa89c8800000005a; _ga_EP5X7Y3XQ9=GS1.1.1572412237.1.1.1572412241.56; NFS=1; MM_NEW=1; NV_WETR_LAST_ACCESS_RGN_M=\"MDkxNDAxMDQ=\"; NV_WETR_LOCATION_RGN_M=\"MDkxNDAxMDQ=\"; _ga_4BKHBFKFK0=GS1.1.1587111219.2.0.1587111219.60; nx_ssl=2; NRTK=ag#30s_gr#4_ma#-2_si#0_en#0_sp#-2; _gid=GA1.2.420595960.1588228640; BMR=s=1588229249747&r=https%3A%2F%2Fm.blog.naver.com%2FPostView.nhn%3FblogId%3Dvgod%26logNo%3D221069251547%26proxyReferer%3Dhttps%3A%252F%252Fwww.google.com%252F&r2=https%3A%2F%2Fwww.google.com%2F; nid_inf=-1189952384; NID_AUT=nazGx3cvUXAHdoRwOjepSh7bK4xKpnM4Eii8nomUF6sdHqhTBGIJIX4VS7XEvf5H; NID_JKL=gsy1xP/9XkLTVvTcUnPuczSvotsvSvc2cVAUG3zrS9A=; page_uid=Uqp34dp0JXVsst+UpL0ssssssBs-193850; NID_SES=AAABjaw/Eawh8om/Ucq+PJ/pUiCt+IzQUWJyzQzTuPJMJN6jmofsTELQEHcprpMfUfsZ3zZWRGD5kbDStzrtvGW4h/zDvF4X3hW7VzyknPA6lxZiJpPpjDaCaw2ScAzcWIhu6lEvzLafPaHe5Q+nPiY7PCkN5C2r/2rJVBTJeNrNYpcjrkP5ZkIJnYhnMAfGnf6Ll3TqnAQzQIJy4KK6wTgxDjz4L5EeSf8xPrGySSJQ6rofSqEo5gk00vyjTVSfqK5ZcBV/glFM0kXDdQ9My41Il+D2Mj+rSkz9TO8EjmYDm/M+Z3n2CBiWdNRUWUb8QMQUnaUTbQjTeVGBNibskBqu8+ds/DupoujQPf9i1gt4OY61Njbw3KSy0Jgu7KHo8ZNDZVcI+V8EqW+0vaO9dfjbhJZNmb7TVRu+ffEcPB2F0MMuvK+7ddghpgJIRfIoawM6qK0ekztuBiaNL7O89w4m5HwjsN767yRdtpR2euzA1boiqJ4RNIc+w+jpUCzJAVOfllNWMH8ZB/LBzBuRvj5VPhs=; _dc_gtm_UA-143406770-1=1; _ga=GA1.1.751489791.1566779766; JSESSIONID=ECA1C8CB5BFF522B9615EDAE492E4209; _ga_7VKFYR6RV1=GS1.1.1588240200.162.1.1588243971.56"
                        },
                        "referrer": "https://papago.naver.com/",
                        "referrerPolicy": "origin",
                        "body": null,
                        "method": "GET",
                        "mode": "cors"
                    }).then((rs) => {
                        rs.json().then(data => {
                            let entry = data.items[0].entry;
                            entry = entry.replace("<b>", "").replace("</b>","");
                            console.log(entry)



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
                }, 500 * di * si);


            })
        })
    });





// fetch("https://papago.naver.com").then((rs)=> {
//     rs.json().then((data)=> {
//         console.log(data);
//     })
// });
