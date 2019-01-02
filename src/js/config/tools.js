export default function fixSymbol (str, lang) {
  if (lang !== 'zh-CN') {
    return str.replace(/，/g, ',')
      .replace(/。/g, '.')
      .replace(/,,/g, ',')
      .replace(/\.\./g, '.')
      .replace(/,\./g, ',')
      .replace(/\.,/g, '.')
  }
  return str
}