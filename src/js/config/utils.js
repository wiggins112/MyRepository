export default {
	/**
     * @param  len {Numver} 长度
     * @param  radix {Number} 基数
     * @return uuid {String} 默认格式 FE94631D-B530-4487-BAEA-2B59FCCA576A
     */
    uuid: function(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [],
            i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    },
  
    getTimeStamp(){
        return ~~(Date.now() / 1000);
    },
    getDevice() {
        if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
            return "mobile"
        } else {
            return "pc"
        }
    },
    getWrapName(name, length = 7) {
        let reg = new RegExp("(\\S{" + length + "})", "g");
        return String(name).replace(reg, "$1\n");
    },
    getBrowserInfo() {
        let agent = navigator.userAgent.toLowerCase();

        let regStr_ie = /msie [\d.]+;/gi;
        let regStr_ff = /firefox\/[\d.]+/gi
        let regStr_chrome = /chrome\/[\d.]+/gi;
        let regStr_saf = /safari\/[\d.]+/gi;
        let browserType = [];
        let browserTypeInfo = {};
        //IE
        if (agent.indexOf("msie") > 0) {
            browserType = agent.match(regStr_ie);
        }

        //firefox
        if (agent.indexOf("firefox") > 0) {
            browserType = agent.match(regStr_ff);
        }

        //Chrome
        if (agent.indexOf("chrome") > 0) {
            browserType = agent.match(regStr_chrome);
        }

        //Safari
        if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) {
            browserType = agent.match(regStr_saf);
        }
        browserTypeInfo = {
            browser: browserType[0].split('/')[0],
            version: browserType[0].split('/')[1]
        }
        return browserTypeInfo
    },
    getQueryStr(obj) {
        let str_arr = [];
        for (let k in obj) {
            str_arr.push(`${k}=${obj[k]}`);
        }
        let str = str_arr.join('&');
        return str;
    }
}
