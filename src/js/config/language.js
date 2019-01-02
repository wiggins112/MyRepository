// const language = 'zh-CN'
// const language = 'ind'

const hide = {
	"ind": [
		'Stare', 
		'BetMy',
		'TaskCenter',
		'ExtractBzh',
		'Airdrop',
		'NewsSuperior',
		'NewsNotice',
		'NewsWeibo',
		'NewsPrimer',
		'CoinArticle',
		'CoinWeibo',
		'TransToEng',
		'loginWechat',
		'SearchNews',
		'CoinNews',
		'FastSeleCoinNotice',
		'NewCoinApplication',
		'NewsNew',
		'NewsResearch',
		'Fund',
		'CoinDetailNodeMap'
	],
	"en": [
		'Stare', 
		'BetMy',
		'TaskCenter',
		'ExtractBzh',
		'Airdrop',
		'NewsSuperior',
		'NewsNotice',
		'NewsWeibo',
		'NewsPrimer',
		'CoinArticle',
		'CoinWeibo',
		'TransToEng',
		'loginWechat',
		'SearchNews',
		'CoinNews',
		'FastSeleCoinNotice',
		'NewCoinApplication',
		'NewsNew',
		'NewsResearch',
		'Fund',
		'CoinDetailNodeMap'
	],
	// "zh-CN": [
	// 	// 国内渠道包要隐藏的
	// 	'ExtractBzh',
	// 	'MyAirdropList',
	// 	'BetMy',
	// 	'AirdropList',
	// ]
}
const language = {
	language_list: [{
		full_name: 'English',
		simple_name: 'en',
		active: false
	}, {
		full_name: 'Bahasa Indonesia',
		simple_name: 'ind',
		active: false
	}
	// , {
	// 	full_name: '简体中文',
	// 	simple_name: 'zh-CN',
	// 	active: false
	// }
	]
}

// 国内版
// const currency = {
// 	currency_list: [{
// 		currency_txt: '美元 USD',
// 		currency_symbol: '$',
// 		currency_code: 'USD',
// 	}, {
// 		currency_txt: '人民币 CNY',
// 		currency_symbol: '￥',
// 		currency_code: 'CNY',
// 	}]
// }

// 印尼版
const currency = {
	currency_list: [{
		currency_txt: 'USD',
		currency_symbol: '$',
		currency_code: 'USD',
	}, {
		currency_txt: 'IDR',
		currency_symbol: 'Rp',
		currency_code: 'IDR',
	}]
}
// 当日涨幅和24h涨幅设置
const open = {
	open_list: [{
		open_txt: '8点开盘',
    		open_code: '8am',
	},{
		open_txt: '24h制',
    		open_code: '24h',
	}]
}
module.exports = { hide, language, currency, open }
