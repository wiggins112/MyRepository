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


function t0 (key) {
  return `$t('${key}')`
}

function t1 (key) {
  return `$t(${key})`
}

function t2 (key) {
  key = key.slice(1)
  return `>{{ $t('${key}') }}`
}

function t22 (key) {
  key = key.substring(0, key.length - 1)
  return `{{ $t('${key}') }}<`
}

function t3 (key) {
  return `this.$t(${key})`
}

function t33 (key) {
  let s =  key.replace(/this\.\$t\(/g, '')
  s =  s.replace(/\)/g, '')
  return s
}

function t4 (key) {
  return ':' + key.replace(/[\u4e00-\u9fa5]+/g, t0)
}

// 找出中文，根据 lang.js 替换
async function replace (file) {
  let doc = await readFile(file, 'utf8')
  const arr = doc.split('<script>')
  arr[0] = arr[0].replace(/'[\u4e00-\u9fa5]+'/g, t1)
  arr[0] = arr[0].replace(/>[\u4e00-\u9fa5]+/g, t2)
  arr[0] = arr[0].replace(/[\u4e00-\u9fa5]+</g, t22)
  arr[0] = arr[0].replace(/[A-Za-z]+="[\u4e00-\u9fa5]+"/g, t4)

  if (arr[1]) {
    arr[1] = arr[1].replace(/'[\u4e00-\u9fa5]+'/g, t3)
    arr[1] = arr[1].replace(/default: this\.\$t\('[\u4e00-\u9fa5]+'\)/g, t33)
  }
  
  let data = arr[0] + '<script>' + arr[1]
  await writeFile(file, data)
  console.log(file + '替换完成')
  return
}

async function main () {
  await Promise.all(src.map(async x => {
    files.push(...await getFiles(x))
  }))
  files = files.filter(f => f.includes('.vue') 
    && !f.includes('CoinHoldLine')
    && !f.includes('CoinPriceLine')
    && !f.includes('EchartBar'))
  // files = ['../ganlan_bc_app/src/js/pages/Settings.vue']
  console.log(files.length)
  files.map((f,index) => {
    replace(f)
  })
}

main()
