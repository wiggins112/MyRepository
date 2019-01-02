const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const readdir = util.promisify(fs.readdir)

// 中文正则
const cnRE = /[\u4e00-\u9fa5]+/g
// 代码注释正则
const commentRE1 = /(\/\/.*)|(\/\*[\s\S]*?\*\/)/g
// html 注释正则
const commentRE2 = /<!--[\w\W]*?-->/g

// 获取所有文件(包括子目录)，放入 files
async function getFiles (s, files = []) {
  let doc = await readdir(s)

  await Promise.all(doc.map(async x => {
    const name = s + '/' + x
    // console.log(name)
    return fs.statSync(name).isDirectory()
    ? getFiles(name, files)
    : files.push(name)
  }))

  return files
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 找出除了注释的中文
async function findCNWithoutComment (file) {
  let doc = await readFile(file, 'utf8')
  let arr = []
  let res = []

  doc = doc.replace(commentRE1, '--')
  doc = doc.replace(commentRE2, '--')

  while ((arr = cnRE.exec(doc)) !== null) {
    res.push(arr[0])
  }

  return [...new Set(res)].filter(n => n)
}

// 找出所有中文
async function findAllCN (file) {
  const doc = await readFile(file, 'utf8')
  let arr = []
  let res = []

  while ((arr = cnRE.exec(doc)) !== null) {
    res.push(arr[0])
  }

  return [...new Set(res)]
}

// 找出注释
async function findComment (file) {
  const doc = await readFile(file, 'utf8')
  let arr = []
  let comment = []
  let _doc = [] // 注释数组

  while ((arr = commentRE1.exec(doc)) !== null) {
    _doc.push(arr[0])
  }

  while ((arr = commentRE2.exec(doc)) !== null) {
    _doc.push(arr[0])
  }

  while ((arr = cnRE.exec(_doc)) !== null) {
    comment.push(arr[0])
  }

  return [...new Set(comment)]
}

module.exports = { getFiles, findCNWithoutComment, findAllCN, findComment }