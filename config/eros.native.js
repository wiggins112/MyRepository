const { bundleUpdate } = require('../src/js/config/config.js')
module.exports = {
    'appName': 'ganlan_bc_app',
    'appBoard': '/config/index.js',
    // android 监听全局事件homeBack 如果为true 安卓端需要自行调用router.finish方法来关闭应用
    'androidIsListenHomeBack': 'true',
    // 'customBundleUpdate': 'true', // 自定义热更新流程

    // 不能高于 Android APP的版本
    'version': {
        'android': '1.6.10',
        'iOS': '1.6.10'
    },
    'page': {
        // 启动后默认进入的页面
        'homePage': '/pages/index.js',
        'mediatorPage': '/mediator/index.js',
        'navBarColor': '#ffffff',
        'navItemColor': '#434343'
    },
    'url': {
        'image': 'https://lev-inf.benmu-health.com/test/xxx', // 图片上传绝对路径
        'bundleUpdate': `${bundleUpdate}` // 热更新检查接口
    },
    'zipFolder': {
        'iOS': '/ios/WeexEros/WeexEros',
        'android': '/android/WeexFrameworkWrapper/app/src/main/assets'
    },
    'getui': {
        'enabled': 'true',
        'appId': 'kxGODFzsI28RCE8z0bAMD5',
        'appKey': 'HduFAPMhpr7tKenszXE0m5',
        'appSecret': 'YebB9MoRJqAoL70MaT82J2'
    },
    'umeng': {
        'enabled': 'true',
        'iOSAppKey': '5b20e1698f4a9d5efd000012',
        'androidAppKey': '5b20ee70f43e4869800000e4'
    },
    'wechat': {
        'enabled': 'true',
        'appId': 'wx3d87b0a1c9f9c3ba',
        'appSecret': '6e726d1ecb95606888d234d768b00af8'
    },
    'amap': {
        'enabled': 'true',
        'iOSAppKey': '623c0396a9b879461c971a14baa678fb',
        'androidAppKey': ''
    }
}
