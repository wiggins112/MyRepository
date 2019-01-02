package vip.bizhihui.app.module;

import com.eros.framework.adapter.router.RouterTracker;
import com.instapp.nat.transfer.ModuleResultListener;
import com.instapp.nat.transfer.TransferModule;
import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.bridge.JSCallback;
import com.taobao.weex.common.WXModule;

import java.util.HashMap;

import vip.bizhihui.app.App;
import vip.bizhihui.app.activity.MainActivity;
import vip.bizhihui.app.module.util.PermissionChecker;

/**
 * Created by Acathur on 17/2/17.
 * Copyright (c) 2017 Instapp. All rights reserved.
 */

public class Transfer extends WXModule {

    @JSMethod
    public void upload(String str, final JSCallback jsCallback){
        boolean permissionGranted = PermissionChecker.checkWriteExternalPermission();
        if (permissionGranted) {
            TransferModule.getInstance().upload(str, new ModuleResultListener() {
                @Override
                public void onResult(Object o) {
                    jsCallback.invokeAndKeepAlive(o);
                }
            });
        } else {
            // 获取读写内存权限
            PermissionChecker.requestWriteExternalPermission();
        }
    }

    @JSMethod
    public void download(String str, final JSCallback jsCallback){
        boolean permissionGranted = PermissionChecker.checkWriteExternalPermission();
        if (permissionGranted) {
            TransferModule.getInstance().download(str, new ModuleResultListener() {
                @Override
                public void onResult(Object o) {
                    jsCallback.invokeAndKeepAlive(o);
                }
            });
        } else {
            final HashMap<String, Object> result = new HashMap<>();
            result.put("message", "no permissionGranted");
            result.put("status", 403);
            jsCallback.invokeAndKeepAlive(result);
            // 获取读写内存权限
            PermissionChecker.requestWriteExternalPermission();
        }
    }
}
