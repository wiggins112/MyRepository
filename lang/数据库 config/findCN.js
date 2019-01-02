const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const appendFile = util.promisify(fs.appendFile)
const writeFile = util.promisify(fs.writeFile)

let saveFile = './db-language.txt'

// 所有文件
let files = ['./zh-CN.txt']
// 中文数组
let res = []
// 注释或排除 数组
let comment = []

async function resetFile () {
  await appendFile(saveFile, '')
  await writeFile(saveFile, '')
}

async function findCNInVal (file) {
  let doc = await readFile(file, 'utf8')
  let arr = []
  let _doc = []
  const RE = /\"[\s\S]*?\"/g
  const cnRE = /[\u4e00-\u9fa5]+/g
  while ((arr = RE.exec(doc)) !== null) {
    _doc.push(arr[0])
  }
  _doc = _doc.filter(x => cnRE.test(x))
  return _doc
}

// 保存文件
async function saveTxt() {
  await resetFile()

  await Promise.all(files.map(async f => {
    res.push(...await findCNInVal(f))
    return
  }))

  res = [...new Set(res)]

  let data = ''

  res.map(x => {
    data += `${x}:\r\n`
  })

  await writeFile(saveFile, data)
}

async function main () {
  files = files.filter(f => f.includes('.txt'))
  console.log('文件列表读取完毕')

  await saveTxt()
  res = [...new Set(res)]
  let words = 0
  res.map(x => {
    words += x.length
  })
  console.log(`总数: ${res.length}, 总字数: ${words}, 已保存在${saveFile}`)
}

main()