// 这里的后缀都是 .js 因为打包出来的都是js文件，而不是.vue文件，我们要告诉客户端跳转那个js

//  这里的路径和dev.json路径的区别
//  pages里面配置的是路由跳转的地址，也就是dev生成的 dist文件夹下的js bundle路径 从dist/js开始
//  dev.json 的 exports 需要打包的js地址，填入src的需要被打包成js bundle的地址   从src开始

export default {
    // 首页
    'Index': {
        title: '',
        url: '/pages/index.js'
    },
    'Test': {
        title: '',
        url: '/pages/Test.js'
    },
    'ArticleDetail': {
        title: '',
        url: '/pages/ArticleDetail.js'
    },
    'CoinDetail': {
        title: '',
        url: '/pages/CoinDetail.js'
    },
    'Settings': {
        title: '',
        url: '/pages/Settings.js'
    },
    'Wallet': {
        title: '',
        url: '/pages/Wallet.js'
    },
    'Plan': {
        title: '',
        url: '/pages/Plan.js'
    },
    'CoinTopList': {
        title: '',
        url: '/pages/CoinTopList.js'
    },
    'Login': {
        title: '',
        url: '/pages/Login.js'
    },
    'Notice': {
        title: '',
        url: '/pages/Notice.js'
    },
    'BetDetail': {
        title: '',
        url: '/pages/BetDetail.js'
    },
    'BetList': {
        title: '',
        url: '/pages/BetList.js'
    },
    'BetConfig': {
        title: '',
        url: '/pages/BetConfig.js'
    },
    'BetMy': {
        title: '',
        url: '/pages/BetMy.js'
    },
    'NoticeMessages': {
        title: '',
        url: '/pages/NoticeMessages.js'
    },
    'StatSingle': {
        title: '',
        url: '/pages/StatSingle.js'
    },
    'FiltersCoinResult': {
        title: '',
        url: '/pages/FiltersCoinResult.js'
    },
    'StatCompare': {
        title: '',
        url: '/pages/StatCompare.js'
    },
    'SearchCoin': {
        title: '',
        url: '/pages/SearchCoin.js'
    },
    'UpdateSetting': {
        title: '',
        url: '/pages/UpdateSetting.js'
    },
    'CoinDetailKs': {
        title: '',
        url: '/pages/CoinDetailKs.js'
    },
    'CoinNodeMap': {
        title: '',
        url: '/pages/CoinNodeMap.js'
    },
    'Invite': {
        title: '',
        url: '/pages/Invite.js'
    },
    'SetPassword': {
        title: '',
        url: '/pages/SetPassword.js'
    },
    'ReceiveBzh': {
        title: '',
        url: '/pages/ReceiveBzh.js'
    },
    'ExtractBzh': {
        title: '',
        url: '/pages/ExtractBzh.js'
    },
    'Certification': {
        title: '',
        url: '/pages/Certification.js'
    },
    'TaskCenter': {
        title: '',
        url: '/pages/TaskCenter.js'
    },
    'CoinExplain': {
        title: '',
        url: '/pages/CoinExplain.js'
    },
    'FiltersSeleCoin': {
        title: '',
        url: '/pages/FiltersSeleCoin.js'
    },
    'PlatformsSeleCoin': {
        title: '',
        url: '/pages/PlatformsSeleCoin.js'
    },
    'TopSeleCoin': {
        title: '',
        url: '/pages/TopSeleCoin.js'
    },
    'NewCoinSeleCoin': {
        title: '',
        url: '/pages/NewCoinSeleCoin.js'
    },
    'Ks': {
        title: '',
        url: '/components/Ks.js'
    },
    'AirdropList': {
        title: '',
        url: '/pages/AirdropList.js'
    },
    'AirdropDetail': {
        title: '',
        url: '/pages/AirdropDetail.js'
    },
    'WalletDetailList': {
        title: '',
        url: '/pages/WalletDetailList.js'
    },
    'SearchNews': {
        title: '',
        url: '/pages/SearchNews.js'
    },
    'Feedback': {
        title: '',
        url: '/pages/Feedback.js'
    },
    'FeedbackType': {
        title: '',
        url: '/pages/FeedbackType.js'
     },
    'ForgetPassword': {
        title: '',
        url: '/pages/ForgetPassword.js'
    },
    'LoginQA': {
        title: '',
        url: '/pages/LoginQA.js'
    },
    'Stare': {
        title: '',
        url: '/pages/Stare.js'
    },
    'StareMsg': {
        title: '',
        url: '/pages/StareMsg.js'
    },
    'CoinDiagnoseRank': {
        title: '',
        url: '/pages/CoinDiagnoseRank.js'
    },
    'AirdropETHH5': {
        title: '',
        url: '/pages/AirdropETHH5.js'
    },
    'SetLanguage': {
        title: '',
        url: '/pages/SetLanguage.js'
    },
    'FundPlaza': {
        title: '',
        url: '/pages/FundPlaza.js'
    },
    'Fund': {
        title: '',
        url: '/pages/Fund.js'
    },
    'CoinBigSingleTrend': {
        title: '',
        url: '/pages/CoinBigSingleTrend.js'
    },
    'SetCurrency': {
        title: '',
        url: '/pages/SetCurrency.js'
    },
}
