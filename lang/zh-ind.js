const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const lang = require('./lang.js')

const { getFiles } = require('./utils.js')

let files = []

// 目录
const src = [
'../ganlan_bc_app/src',
// '../ganlan_bc_xcx_api/app'
]

function t (key) {
  if (!lang[key]) return key
  if (lang[key].includes('|')) return lang[key].split('|')[1].trim() || lang[key].split('|')[0].trim()
  return lang[key]
}

// 找出中文，根据 lang.js 替换
async function replace (file) {
  let doc = await readFile(file, 'utf8')
  data = doc.replace(/[\u4e00-\u9fa5]+/g, t)
  await writeFile(file, data)
  console.log(file + '替换完成')
  return
}

async function main () {
  await Promise.all(src.map(async x => {
    files.push(...await getFiles(x))
  }))
  files = files.filter(f => f.includes('.vue') || f.includes('.js'))

  files.map(f => {
    replace(f)
  })
}

main()
