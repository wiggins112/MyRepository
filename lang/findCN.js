const { getFiles, findCNWithoutComment } = require('./utils.js')
const fs = require('fs')
const util = require('util')

const appendFile = util.promisify(fs.appendFile)
const writeFile = util.promisify(fs.writeFile)

// 目录
const src = [
  '../ganlan_bc_app/src',
  // '../ganlan_bc_xcx_api/app'
]
let saveFile = './api-lang.js'

// 所有文件
let files = []
// 中文数组
let res = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// 注释或排除 数组
let comment = ['月']

async function resetFile () {
  await appendFile(saveFile, '')
  await writeFile(saveFile, '')
}

// 保存文件
async function save() {
  await Promise.all(files.map(async f => {
    res.push(...await findCNWithoutComment(f))
    return 
  }))

  res = [...new Set(res)]
  let data = `module.exports = {\n`

  res.map(x => {
    data += `    '${x}': '',\n`
  })

  data += `}`
  console.log(data)
  // await writeFile(saveFile, data)
}

async function saveTxt() {
  await Promise.all(files.map(async f => {
    res.push(...await findCNWithoutComment(f))
    return 
  }))

  res = [...new Set(res)]
  saveFile = './language.txt'
  
  let data = ''

  res.map(x => {
    data += `${x}:\r\n`
  })

  await writeFile(saveFile, data)
}

// 保存时附带文件名
async function saveAddFilename() {
  let data = `module.exports = {\n`

  await Promise.all(files.map(async f => {
    const cnData = await findCNWithoutComment(f)

    if (cnData.length) data += `\n    // ${f}\n`
    cnData.map(x => {
      data += `    '${x}': '',\n`
      res.push(x)
    })

    return 
  }))
  data += `}`
  await writeFile(saveFile, data)
}

async function main () {
  await Promise.all(src.map(async x => {
    files.push(...await getFiles(x))
  }))
  files = files.filter(f => f.includes('.vue') || f.includes('.js'))
  console.log(files)
  console.log('文件列表读取完毕')

  // await saveAddFilename()
  await save()
  res = [...new Set(res)]
  let words = 0
  res.map(x => {
    words += x.length
  })
  console.log(`总数: ${res.length}, 总字数: ${words}, 已保存在${saveFile}`)
}

main()