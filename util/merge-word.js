
// file read
const fs = require('fs')
const path = require('path')
const dictionaryPath = path.join(__dirname, '../english/dictionary.js')
// file read full
const dictionaryStr = fs.readFileSync(dictionaryPath, { encoding: 'utf8', flag: 'r' });
// file read eval
//
const dictionary = Function(`${dictionaryStr}; return dictionary;`)()

// const z = eval(`${data};` )


const wordPath = path.join(__dirname, './text-parser/words.js')
const wordStr = fs.readFileSync(wordPath, { encoding: 'utf8', flag: 'r' });
const words = Function(`${wordStr}; return WORDS;`)()
console.log('-----', dictionary, words)

// console.log('------',dictionary.dictionary)

Object.entries(words).filter(([key, value]) => {
    return key && !value['ref'] && Object.keys(value).length > 0
}).forEach(([word, value]) => {
    // console.log('word', word)
    const key = word.trim();
    let exist = dictionary[key];
    if (!exist) {
        dictionary[key] = value
        console.log('not exist', word)
    }
})

// dictionary.dictionary['wow'] = 'wow';
// file write
fs.writeFileSync(dictionaryPath, `const dictionary = ${JSON.stringify(dictionary, null, 2)}`)
console.log('-----')