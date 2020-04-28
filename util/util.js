function play(url) {
    var audio = new Audio();
    audio.src = url;
    audio.play();
}


window.addEventListener('DOMContentLoaded', function(){

    document.querySelectorAll('[audio]').forEach(it => {
        it.addEventListener('click', evt => play(it.getAttribute('audio')));
    });

    let firstLanguages = document.querySelectorAll('.sentence-container>.first-language');
    firstLanguages.forEach(it => {
        let content = (it.textContent||"").trim();
        content = content.replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, ' ');
        content = content.toLowerCase();
        let contents = content.split(" ");
        let find = {};

        // dictionary
        contents.forEach(key => {
            if (dictionary[key]) {
                find[key] = dictionary[key];
                for (let i = 0; find[key].ref && i < find[key].ref.length; i++) {
                    let refKey = find[key].ref[i];
                    if (!find[refKey] && dictionary[refKey]) {
                        find[refKey] = dictionary[refKey];
                    }
                }
            }
        });

        // idiomDictionary 숙어
        Object.keys(idiomDictionary).forEach(key => {
            if (new RegExp(key+"[ \r\nsly]").test(content)) {
                find[key] = idiomDictionary[key];
                for (let i = 0; find[key].ref && i < find[key].ref.length; i++) {
                    let refKey = find[key].ref[i];
                    if (!find[refKey] && idiomDictionary[refKey]) {
                        find[refKey] = idiomDictionary[refKey];
                    }
                }
            }
        });



        // viewing
        let parentElement = it.parentElement;

        // input
        let inputDiv = document.createElement("div");
        inputDiv.className = "sentence input-language-container hide";
        let inputText = document.createElement("input");
        inputText.setAttribute("type", "text");
        inputText.className = "input";
        inputText.setAttribute("placeholder", content);

        inputText.addEventListener("input", evt => {
            if (content.startsWith(evt.target.value)) {
                inputText.setAttribute("style", "border: none");
            } else {
                inputText.setAttribute("style", "border: 2px solid red");
            }
           console.log(content.startsWith(evt.target.value), evt.target.value);
        });
        inputDiv.append(inputText);
        parentElement.append(inputDiv);


        let findKeys = Object.keys(find);
        if (findKeys.length > 0) {
            let containDiv = document.createElement("div");
            containDiv.className = "explain-container hide";
            findKeys.forEach(fkit => {
                let f = find[fkit];

                let wordDiv = document.createElement("div");
                wordDiv.className = "explain word";
                wordDiv.textContent = fkit + (f.phonetic?(" [" + f.phonetic+ "]"):"");

                if (f.audio) {
                    wordDiv.addEventListener('click', evt => play(f.audio));
                }
                containDiv.appendChild(wordDiv);

                let meanDiv = document.createElement("div");
                meanDiv.className = "explain mean-container";


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
            parentElement.appendChild(containDiv);
        }
    });





    let sentenceContainers = document.querySelectorAll('.sentence-container');
    const list = ['-','🐵', '🐧', '🐱', '🦊', '🐔', '🦄'];

    for (let i = 0; i < sentenceContainers.length; i++) {
        var sentenceContainer = sentenceContainers[i];
        var btns = [];
        for (let j = 0; j < sentenceContainer.children.length; j++) {
            var cit = sentenceContainer.children[j];
            if (cit.nodeType === 1 && cit.className.indexOf("hide")>=0) {
                let div = document.createElement("span");
                div.textContent = list[j];
                div.className = 'toggle';
                (function (at) {
                    div.addEventListener("click", event => {
                        if (at.getAttribute("style") && at.getAttribute("style").indexOf("display:block") >= 0 ){
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
});
