const axios = require('axios')
const querystring = require('querystring')
const fs = require('fs')
const util = require('util')
const appendFile = util.promisify(fs.appendFile)

const obj = require('./language.js')
const file = './lang.js'

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function t (word) {
    try {
        const res =  await axios.post('https://translate.googleapis.com/translate_a/single', querystring.stringify({
            client: 'gtx',
            sl: 'zh_CN',
            tl: 'en',
            dt: 't',
            hl: 'zh_CN',
            ie: 'UTF-8',
            oe: 'UTF-8',
            q: word
        }))
        return res.data[0][0][0]
    } catch (e) {
        console.log(e)
        return false
    }
}

async function save (key, word) {
    await appendFile(file, `    '${key}': '${word}',\n`)
}

!async function () {
    console.log('脚本开始')
    // await appendFile(file, 'module.exports = {\n')
    let n = 0
    const l = Object.keys(obj).length

    for (let i in obj) {
        // console.log(`${i}`)

        let res = await t(i)

        if (!res) break

        n++
        await save(i, res)
        const p = ((n / l) * 100).toFixed(3) + '%'
        console.log(`${i}: ${res} (${p})`)

        await sleep(1000)
    }

    // await appendFile(file, '}')
}()