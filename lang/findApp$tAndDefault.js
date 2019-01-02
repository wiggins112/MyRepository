const { getFiles } = require('./utils.js')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const appendFile = util.promisify(fs.appendFile)
const writeFile = util.promisify(fs.writeFile)

// 目录
const src = [
  '../ganlan_bc_app/src'
]
let saveFile = './CN$tDefault.js'

// 所有文件
let files = []
// 中文数组
let res = []

async function resetFile () {
  await appendFile(saveFile, '')
  await writeFile(saveFile, '')
}

// 保存文件
async function save() {
  const RE = /\$t\('.*'\)/g
  const RE2 = /default: '[\u4e00-\u9fa5]+'/g
  await Promise.all(files.map(async f => {
    let doc = await readFile(f, 'utf8')
    let arr = []
    while ((arr = RE.exec(doc)) !== null) {
      let a = arr[0].split("'")
      res.push(a[1])
    }
    while ((arr = RE2.exec(doc)) !== null) {
      let a = arr[0].split("'")
      res.push(a[1])
      console.log(f)
    }
    return 
  }))

  res = [...new Set(res)]
  let data = `module.exports = {\n`

  res.map(x => {
    data += `    '${x}': '',\n`
  })

  data += `}`
  console.log(data)
  await writeFile(saveFile, data)
}

async function main () {
  await Promise.all(src.map(async x => {
    files.push(...await getFiles(x))
  }))
  files = files.filter(f => f.includes('.vue') || f.includes('.js'))
  console.log(files)
  console.log('文件列表读取完毕')

  await save()
  res = [...new Set(res)]
  let words = 0
  res.map(x => {
    words += x.length
  })
  console.log(`总数: ${res.length}, 总字数: ${words}, 已保存在${saveFile}`)
}

main()