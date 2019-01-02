// 整理 json，包括排序、找出 en 和 ind 语言中字段差异（未翻译会放到前方）
const json = require('./common.json')
const fs = require('fs')
const util = require('util')

const writeFile = util.promisify(fs.writeFile)

!function () {

    // 检查 json 格式是否合法
    if (typeof json === 'string') {
        try {
            JSON.parse(str)
        } catch(e) {
            console.log('JSON 格式不合法')
            return
        }
    }

    enArr = Object.keys(json.en)
        .sort((a, b) => {
            if (!json.en[a]) return -1
            if (!json.en[b]) return 1
            return 0
        })

    indArr = Object.keys(json.ind)
        .sort((a, b) => {
            if (!json.ind[a]) return -1
            if (!json.ind[b]) return 1
            return 0
        })

    console.log(indArr)
    indArr = enArr.filter(x => !indArr.includes(x)).concat(indArr)
    enArr = indArr.filter(x => !enArr.includes(x)).concat(enArr)

    const obj = {
        en: {},
        ind: {},
        'zh-CN': {}
    }

    for (let i = 0, l = enArr.length; i < l; i++) {
        const x = enArr[i]
        obj.en[x] = json.en[x] || ''
    }

    for (let i = 0, l = indArr.length; i < l; i++) {
        const x = indArr[i]
        obj.ind[x] = json.ind[x] || ''
    }

    obj['zh-CN'] = json['zh-CN']

    writeFile('./common.json', JSON.stringify(obj, null, 2))
}()