package vip.bizhihui.app;

import android.app.Application;
import android.os.StrictMode;
import android.util.Log;

import com.bzh.erospluginkline.BzhKline;
import com.eros.framework.BMWXApplication;
import com.taobao.weex.WXSDKEngine;
import com.taobao.weex.common.WXException;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.analytics.MobclickAgent;

import vip.bizhihui.app.module.Installer;
import vip.bizhihui.app.module.TencentCaptcha;
import vip.bizhihui.app.module.Transfer;
import vip.bizhihui.app.module.component.BZHWeb;

/**
 * Created by Carry on 2017/8/23.
 */

public class App extends BMWXApplication {
    public Application mInstance;


    @Override
    public void onCreate() {
        super.onCreate();
        Log.e("App", "onCreate: STARTED" );
        mInstance = this;
        initYoumeng();
        try {
            WXSDKEngine.registerModule("transfer", Transfer.class);
            WXSDKEngine.registerModule("installer", Installer.class);
            WXSDKEngine.registerModule("tencentCaptcha", TencentCaptcha.class);
            WXSDKEngine.registerComponent("bzhWeb", BZHWeb.class);
            WXSDKEngine.registerComponent("BzhKline", BzhKline.class);

        } catch (WXException e) {
            e.printStackTrace();
        }
        //  为了可以分享给Line
        StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
        StrictMode.setVmPolicy(builder.build());
        builder.detectFileUriExposure();

        Log.e("App", "onCreate: FINISHED" );

    }
    private void initYoumeng() {
        //------------------友盟统计----------------------
        UMConfigure.init(this, UMConfigure.DEVICE_TYPE_PHONE, "");
        //开启Log
        UMConfigure.setLogEnabled(true);
        //打开调试模式
        MobclickAgent.setDebugMode(true);
    }


}
