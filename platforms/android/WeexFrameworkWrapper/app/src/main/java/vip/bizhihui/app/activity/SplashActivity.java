package vip.bizhihui.app.activity;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.eros.framework.manager.ManagerFactory;
import com.eros.framework.manager.StorageManager;
import com.eros.framework.proxy.SplashActivityProxy;
import vip.bizhihui.app.R;

import com.umeng.analytics.MobclickAgent;

/**
 * Created by Carry on 2017/8/23.
 */

public class SplashActivity extends Activity {
    private SplashActivityProxy activityProxy;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.e("SplashActivity", "onCreate: STARTED" );
        try {
            ApplicationInfo appInfo = this.getPackageManager().getApplicationInfo(this.getPackageName(), PackageManager.GET_META_DATA);
            String PUBLISH_COUNTRY = appInfo.metaData.getString("PUBLISH_COUNTRY");
            if (PUBLISH_COUNTRY == null) {
                PUBLISH_COUNTRY = "CHN";
            }
            if (PUBLISH_COUNTRY.equals("CHN")) {
                setContentView(R.layout.activity_splash);
            } else {
                setContentView(R.layout.activity_splash_en);
            }
        } catch (PackageManager.NameNotFoundException e) {
            setContentView(R.layout.activity_splash);
        }
        activityProxy = new SplashActivityProxy();
        activityProxy.onCreateInit(this);
        Log.e("SplashActivity", "onCreate: Finished" );

        // 获取到唤起APP的参数
        Intent i_getvalue = getIntent();
        String action = i_getvalue.getAction();

        if(Intent.ACTION_VIEW.equals(action)){
            Uri uri = i_getvalue.getData();
            if(uri != null){
                final String page = uri.getQueryParameter("page");
                final String query = encodeURI(uri.getQueryParameter("query"));
                // 存参数到storage
                StorageManager storageManager = ManagerFactory.getManagerService(StorageManager.class);
                boolean result = storageManager.setData(this, "scheme", "{ \"page\":\"" + page + "\",\"query\":\"" + query + "\"}");
                if (result) {
                    Log.e("scheme_set", "成功");
                } else {
                    Log.e("scheme_set", "失败");
                }
            }
        }
    }
    public static String encodeURI(String uri) {
        return Uri.encode(uri, ":/-![].,%?&=");
    }
    @Override
    protected void onStart() {
        super.onStart();
        activityProxy.onStart(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        activityProxy.onResume(this);
        MobclickAgent.onResume(this);//友盟统计
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        activityProxy.onRestart(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        activityProxy.onPause(this);
        MobclickAgent.onPause(this);//友盟统计
    }

    @Override
    protected void onStop() {
        super.onStop();
        activityProxy.onStop(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        activityProxy.onDestroy(this);
    }
}
