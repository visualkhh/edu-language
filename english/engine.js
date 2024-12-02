// var audio = new Audio();
const synth = window.speechSynthesis;
let voices = synth.getVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceList;
}
function play(data) {
    const url = data.audio;
    const desc = data.text;

    const utterThis = new SpeechSynthesisUtterance(desc);
    const voiceSelect = document.querySelector(".voice-select");
    const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for (const voice of voices) {
        if (voice.name === selectedOption) {
            utterThis.voice = voice;
        }
    }
    utterThis.pitch = document.querySelector('.pitch').value;
    utterThis.rate = document.querySelector('.rate').value;
    synth.cancel();
    synth.speak(utterThis);
    // console.log('play', url, desc);
    // audio.pause();
    // audio.src = url;
    // audio.play();
}

function populateVoiceList() {
    voices = synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase();
        const bname = b.name.toUpperCase();

        if (aname < bname) {
            return -1;
        } else if (aname == bname) {
            return 0;
        } else {
            return +1;
        }
    }).filter(it => it.lang === 'en-US');
    const voiceSelect = document.querySelector(".voice-select");
    if (voiceSelect) {
        voiceSelect.innerHTML = "";
        for (let i = 0; i < voices.length; i++) {
            const option = document.createElement("option");
            option.textContent = `${voices[i].name} (${voices[i].lang})`;

            if (voices[i].default) {
                option.textContent += " -- DEFAULT";
            }

            option.setAttribute("data-lang", voices[i].lang);
            option.setAttribute("data-name", voices[i].name);
            voiceSelect.appendChild(option);
        }
    }
    // voiceSelect.selectedIndex = selectedIndex;
}

// descriptions = [];
function makeAudioController() {
    const voiceContainer = document.createElement('div');
    voiceContainer.classList.add('voice-container');
    const voiceSelect = document.createElement('select');
    voiceSelect.classList.add('voice-select');
    voiceContainer.appendChild(voiceSelect);
    const rate = document.createElement('input')
    rate.classList.add('rate');
    rate.setAttribute('type', 'range');
    rate.setAttribute('min', 0.5);
    rate.setAttribute('max', 2);
    rate.setAttribute('step', 0.1);
    rate.setAttribute('value', 1);
    voiceContainer.appendChild(rate);
    const pitch = document.createElement('input')
    pitch.classList.add('pitch');
    pitch.setAttribute('type', 'range');
    pitch.setAttribute('min', 0);
    pitch.setAttribute('max', 2);
    pitch.setAttribute('step', 0.1);
    pitch.setAttribute('value', 1);
    voiceContainer.appendChild(pitch);
    voiceContainer.appendChild(pitch);
    return voiceContainer;
}
function start() {

    const body = document.querySelector('body');
    const voiceContainer = makeAudioController();
    body.appendChild(voiceContainer);

    populateVoiceList();



    DESCRIPTIONS.forEach((data, idx, i) => {
        const div = document.createElement("div");
        div.classList.add('sentence-container');

        const enDiv = document.createElement("div");
        enDiv.classList.add('sentence');
        enDiv.classList.add('first-language');
        // enDiv.classList.add('listen');
        enDiv.appendChild(document.createTextNode(data.en.desc));
        // if(data.en.audio) {
        enDiv.addEventListener('click', evt => play({audio: data.en.audio, text: data.en.desc}));
        // }

        const koDiv = document.createElement("div");
        koDiv.classList.add('sentence');
        koDiv.classList.add('second-language');
        koDiv.classList.add('hide');
        koDiv.appendChild(document.createTextNode(data.ko.desc));

        //typing
        const typingDiv = document.createElement("div");
        typingDiv.classList.add('sentence');
        typingDiv.classList.add('input-language-container');
        typingDiv.classList.add('hide');

        const typingInput = document.createElement("input");
        typingInput.setAttribute('type', 'text');
        typingInput.setAttribute('placeholder', data.en.desc);
        typingInput.classList.add('input');
        typingDiv.appendChild(typingInput);
        ///

        //explain
        let words = findWords(data.en.desc);
        let wordKeys = Object.keys(words);
        const explainDiv = makeExplainContainer(idx, words);


        //slider
        const sliderDiv = document.createElement("div");
        sliderDiv.classList.add('hide');
        //  <input type="range" min="1" max="100" value="50" class="slider" id="myRange">
        const slider = document.createElement("input");
        slider.setAttribute('type', 'range')
        slider.setAttribute('min', 0)
        slider.setAttribute('max', wordKeys.length)
        slider.value = 0;
        slider.classList.add('slider');
        let oldValue = 0;
        // slider.addEventListener('change', evt => {
        //     console.log('-->', slider.value, wordKeys[slider.value]);
        //     // play(data.en.audio)
        // });
        slider.addEventListener('mousemove', e => {
            oldValue = attention(oldValue, slider, idx, wordKeys, enDiv, data);
        });
        slider.addEventListener('touchmove', e => {
            oldValue = attention(oldValue, slider, idx, wordKeys, enDiv, data);
        });
        slider.addEventListener('change', e => {
            oldValue = attention(oldValue, slider, idx, wordKeys, enDiv, data);
        });
        // sliderDiv.classList.add('second-language');
        // sliderDiv.classList.add('hide');
        sliderDiv.appendChild(slider);


        div.appendChild(explainDiv);
        div.appendChild(enDiv);
        div.appendChild(koDiv);
        div.appendChild(typingDiv);
        div.appendChild(sliderDiv);

        body.appendChild(div);
    });
    // body.append()
    // return;
    // document.querySelectorAll('[audio]').forEach(it => {
    //     it.addEventListener('click', evt => play(it.getAttribute('audio')));
    // });
    settingToggleBtn();
};


attention = function (oldValue, slider, idx, wordKeys, enDiv, data) {
    if (oldValue != slider.value) {
        let number = slider.value - 1;
        let id = '#explain_' + idx + '_' + number;
        location.hash = id;
        document.querySelector(id).click();
        let regExp = new RegExp('(' + wordKeys[number] + ')', 'gmi');
        enDiv.innerHTML = data.en.desc.replace(regExp, "<span class='attention'>$1</span>")
    }
    oldValue = slider.value
    return oldValue;
}


findWords = function (content) {
    content = content.replace(/[\{\}\[\]\/?.,;:|\)*~'!^\-_+<>@\#$%&\\\=\(\"]/gi, ' ');
    content = content.toLowerCase();
    let contents = content.split(" ");
    let find = {};
    // dictionary
    contents.forEach(key => {
        if (WORDS[key]) {
            find[key] = WORDS[key];
            for (let i = 0; find[key].ref && i < find[key].ref.length; i++) {
                let refKey = find[key].ref[i];
                if (!find[refKey] && WORDS[refKey]) {
                    find[refKey] = WORDS[refKey];
                }
                if (!find[refKey] && WORDS[refKey]) {
                    find[refKey] = WORDS[refKey];
                }
            }
        }
    });
    return find;
}

makeExplainContainer = function (idx, words) {
    let containDiv = document.createElement("div");
    containDiv.classList.add("explain-container");
    containDiv.classList.add("hide");
    let findKeys = Object.keys(words);
    if (findKeys.length > 0) {
        findKeys.forEach((fkit, sidx, a) => {
            let f = words[fkit];

            let wordDiv = document.createElement("div");
            wordDiv.className = "explain word";
            wordDiv.textContent = fkit + (f.phonetic ? (" [" + f.phonetic + "]") : "");
            wordDiv.id = 'explain_' + idx + '_' + sidx;
            // if (f.audio) {
            wordDiv.addEventListener('click', evt => play({audio: f.audio, text: fkit}));
            // }
            containDiv.appendChild(wordDiv);

            let meanDiv = document.createElement("div");
            meanDiv.classList.add("explain");
            meanDiv.classList.add("mean-container");


            for (let i = 0; f.means && i < f.means.length; i++) {
                let mean = f.means[i];
                let meanAtDiv = document.createElement("div");

                if (mean.type) {
                    let typeDiv = document.createElement("div");
                    typeDiv.className = "type";
                    typeDiv.textContent = "[" + mean.type + "]";
                    meanAtDiv.appendChild(typeDiv);
                }

                for (let j = 0; mean.mean && j < mean.mean.length; j++) {
                    let meanSubDiv = document.createElement("div");
                    meanSubDiv.className = "mean";
                    // meanSubDiv.textContent = (j+1)+') '+mean.mean[j];
                    meanSubDiv.textContent = mean.mean[j];
                    meanAtDiv.appendChild(meanSubDiv);
                }
                meanDiv.appendChild(meanAtDiv);
            }
            containDiv.appendChild(meanDiv);
        });
    }
    return containDiv;
}


settingToggleBtn = function () {
    let sentenceContainers = document.querySelectorAll('.sentence-container');
    const list = ['🐳', '🐵', '🐧', '🐱', '🦊', '🐔', '🦄'];

    for (let i = 0; i < sentenceContainers.length; i++) {
        var sentenceContainer = sentenceContainers[i];
        var btns = [];
        for (let j = 0; j < sentenceContainer.children.length; j++) {
            var cit = sentenceContainer.children[j];
            // if (cit.nodeType === 1 && cit.className.indexOf("hide")>=0) {
            if (cit.nodeType === 1) {
                let div = document.createElement("span");
                div.textContent = list[j];
                div.className = 'toggle';
                (function (at) {
                    div.addEventListener("click", event => {
                        // console.log(window.getComputedStyle(at).display, at.style.visibility,'---');
                        // if (at.getAttribute("style") && at.getAttribute("style").indexOf("display:block") >= 0 ){
                        if (window.getComputedStyle(at).display === 'block') {
                            at.setAttribute("style", "display:none")
                        } else {
                            at.setAttribute("style", "display:block")
                        }
                    });
                })(cit);
                btns.push(div);
            }
        }

        for (let j = 0; j < btns.length; j++) {
            sentenceContainer.appendChild(btns[j]);
        }
    }
}
