const path = require('path')
const { diff_proxy } = require('../src/js/config/config.js')
// appBoard，mediator 不建议进行修改 如果修改了 也请对应修改
module.exports = {
    'eslint': false,
    'webpackWarnings': false,
    'exports': [
        // appBoard
        'js/config/index.js',
        // mediator
        'js/mediator/index.vue',
        // home
        'js/pages/index.vue',
        'js/pages/Test.vue',
        'js/pages/ArticleDetail.vue',
        'js/pages/CoinDetail.vue',
        'js/pages/Coins.vue',
        'js/pages/Stat.vue',
        'js/pages/Settings.vue',
        'js/pages/Wallet.vue',
        'js/pages/Plan.vue',
        'js/pages/CoinTopList.vue',
        'js/pages/Login.vue',
        'js/pages/StatSingle.vue',
        'js/pages/FiltersCoinResult.vue',
        'js/pages/StatCompare.vue',
        'js/pages/SearchCoin.vue',
        'js/pages/Notice.vue',
        'js/pages/NoticeMessages.vue',
        'js/pages/UpdateSetting.vue',
        'js/pages/CoinDetailKs.vue',
        'js/pages/CoinNodeMap.vue',
        'js/pages/Invite.vue',
        'js/pages/SetPassword.vue',
        'js/pages/ReceiveBzh.vue',
        'js/pages/ExtractBzh.vue',
        'js/pages/Certification.vue',
        'js/pages/TaskCenter.vue',
        'js/pages/CoinExplain.vue',
        'js/pages/FiltersSeleCoin.vue',
        'js/pages/PlatformsSeleCoin.vue',
        'js/pages/TopSeleCoin.vue',
        'js/pages/NewCoinSeleCoin.vue',
        'js/components/Ks.vue',
        'js/pages/BetDetail.vue',
        'js/pages/BetList.vue',
        'js/pages/BetMy.vue',
        'js/pages/BetConfig.vue',
        'js/pages/AirdropList.vue',
        'js/pages/AirdropDetail.vue',
        'js/pages/WalletDetailList.vue',
        'js/pages/SearchNews.vue',
        'js/pages/Feedback.vue',
        'js/pages/FeedbackType.vue',
        'js/pages/ForgetPassword.vue',
        'js/pages/LoginQA.vue',
        'js/pages/Stare.vue',
        'js/pages/StareMsg.vue',
        'js/pages/CoinDiagnoseRank.vue',
        'js/pages/AirdropETHH5.vue',
        'js/pages/SetLanguage.vue',
        'js/pages/FundPlaza.vue',
        'js/pages/Fund.vue',
        'js/pages/CoinBigSingleTrend.vue',
        'js/pages/SetCurrency.vue'
    ],
    'alias': {
        'Components': 'js/components',
        'Common': 'js/common',
        'Config': 'js/config',
        'Widget': 'js/widget',
        'Pages': 'js/pages',
        'Utils': 'js/utils'
    },
    'diff': {
        'pwd': path.join(__dirname, '..', 'diff'),
        'proxy': diff_proxy
    },
    'server': {
        'path': './',
        'port': 8889
    },
    'mockServer': {
        'port': 52077,
        'mockDir': './dist/mock'
    },
    'socketServer': {
        'port': 8890,
        'switch': true
    }
}
