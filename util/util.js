function play(url) {
    var audio = new Audio();
    audio.src = url;
    audio.play();
    // let audio = document.querySelector("#audio");
    // audio.src=url;
    // setTimeout(function () {
    //     audio.play();
    // }, 3000)
}

function childVisibleToggle(it) {
    it.firstChild.style="display:none";


}
function action(target) {
    document.getElementById("--");
    it.firstChild.style="display:none";


}


window.addEventListener('DOMContentLoaded', function(){

    document.querySelectorAll('[audio]').forEach(it => {
        it.addEventListener('click', evt => play(it.getAttribute('audio')));
    });


    let elementById = document.getElementById("--");
    // elementById.after()
    // elementById.inse


    let firstLanguages = document.querySelectorAll('.sentence-container>.first-language');
    firstLanguages.forEach(it => {
        let content = (it.textContent||"").trim();
        content = content.replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, '');
        // content = content.replace(/[\r\n]/gi, '');
        content = content.toLowerCase();

        let find = {};
        Object.keys(dictionary).forEach(key => {
            if (new RegExp(key+"[ \r\nsly]").test(content)) {
                console.log(key);
                find[key] = dictionary[key];
            }
        })

        let parentElement = it.parentElement;
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
                // meanDiv.textContent = fkit;
                containDiv.appendChild(meanDiv);
            });
            parentElement.appendChild(containDiv);
        }
        // content.
        // let contents = content.split(" ");
        // console.log(content, contents);
    })





    let sentenceContainers = document.querySelectorAll('.sentence-container');
    const list = ['-','🐵', '🐧', '🐱', '🦊', '🐔', '🦄'];

    for (let i = 0; i < sentenceContainers.length; i++) {
        var sentenceContainer = sentenceContainers[i];
        console.log(sentenceContainer);
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

        console.log(btns);
        for (let j = 0; j < btns.length; j++) {
            sentenceContainer.appendChild(btns[j]);
        }

    }


    // for (let i = 0; i < sentenceContainers.length; i++) {
    //     var sentenceContainer = sentenceContainers[i];
    //     console.log(sentenceContainer);
    //     var btns = [];
    //     for (let j = 0; j < sentenceContainer.children.length; j++) {
    //         var cit = sentenceContainer.children[j];
    //         if (cit.nodeType === 1) {
    //             console.log(cit);
    //             let div = document.createElement("span");
    //             div.textContent = list[j];
    //             div.className = 'toggle';
    //             (function (at) {
    //                 div.addEventListener("click", event => {
    //                     if (at.getAttribute("style") && at.getAttribute("style").indexOf("display:block") >= 0 ){
    //                         at.setAttribute("style", "display:none")
    //                     } else {
    //                         at.setAttribute("style", "display:block")
    //                     }
    //                 });
    //             })(cit);
    //             btns.push(div);
    //         }
    //     }
    //
    //     console.log(btns);
    //     for (let j = 0; j < btns.length; j++) {
    //         sentenceContainer.appendChild(btns[j]);
    //     }
    //
    // }



});
