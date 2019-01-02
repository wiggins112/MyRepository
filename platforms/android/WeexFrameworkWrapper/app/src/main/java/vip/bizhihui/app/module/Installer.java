package vip.bizhihui.app.module;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.support.v4.content.FileProvider;
import android.widget.Toast;

import com.eros.framework.adapter.router.RouterTracker;
import com.instapp.nat.transfer.ModuleResultListener;
import com.instapp.nat.transfer.TransferModule;
import com.maning.updatelibrary.InstallUtils;
import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.bridge.JSCallback;
import com.taobao.weex.common.WXModule;


import java.io.File;
import java.security.Permission;
import java.util.HashMap;

import vip.bizhihui.app.App;
import vip.bizhihui.app.activity.MainActivity;
import vip.bizhihui.app.module.util.PermissionChecker;

public class Installer extends WXModule {

     @JSMethod
    public void installApk(String str, final JSCallback jsCallback) {
         String path = Environment.getExternalStorageDirectory() + str;
         File apkFile = new File(path);
         // 判断访问读写内存权限
        boolean permissionGranted = PermissionChecker.checkWriteExternalPermission();
        if (permissionGranted) {
            // 判断apk文件是否存在
            if (apkFile.exists()) {
                final HashMap<String, Object> result = new HashMap<>();
                InstallUtils.installAPK(RouterTracker.peekActivity(), path, new InstallUtils.InstallCallBack() {
                    @Override
                    public void onSuccess() {
                        Toast.makeText(RouterTracker.peekActivity(), "正在安装程序", Toast.LENGTH_SHORT).show();
                        result.put("message", "succeed");
                        result.put("code", 0);
                        if (jsCallback != null) {
                            jsCallback.invokeAndKeepAlive(result);
                        }
                    }
                    @Override
                    public void onFail(Exception e) {
                        Toast.makeText(RouterTracker.peekActivity(), "安装失败:" + e.toString(), Toast.LENGTH_SHORT).show();
                        result.put("message", "failed");
                        result.put("code", -1);
                        if (jsCallback != null) {
                            jsCallback.invokeAndKeepAlive(result);
                        }
                    }
                });
            } else {
                Toast.makeText(RouterTracker.peekActivity(), "安装包未找到哦", Toast.LENGTH_LONG).show();
            }
        } else {
            // Toast.makeText(App.sInstance, "没有权限啊", Toast.LENGTH_LONG).show();
            // 获取访问读写内存权限
            PermissionChecker.requestWriteExternalPermission();
        }
    }
}
