package vip.bizhihui.app.activity;

import android.app.Activity;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.eros.framework.activity.AbstractWeexActivity;
import com.umeng.analytics.MobclickAgent;

import vip.bizhihui.app.R;

public class MainActivity extends AbstractWeexActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.e("MainActivity", "onCreate: STARTED" );
        setContentView(R.layout.activity_main);
        initView();
        renderPage();
        Log.e("MainActivity", "onCreate: FINISHED" );
    }

    private void initView() {
        mContainer = (ViewGroup) findViewById(R.id.layout_container);
    }

    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);//友盟统计
    }
    @Override
    protected void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);//友盟统计
    }
}
