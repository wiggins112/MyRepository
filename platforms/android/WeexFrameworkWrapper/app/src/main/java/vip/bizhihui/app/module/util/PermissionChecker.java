package vip.bizhihui.app.module.util;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;
import android.widget.Toast;

import com.eros.framework.BMWXEnvironment;
import com.eros.framework.adapter.router.RouterTracker;
import com.eros.framework.manager.ManagerFactory;
import com.eros.framework.manager.impl.PermissionManager;
import com.eros.framework.manager.impl.dispatcher.DispatchEventManager;
//import com.plugamap.model.GeoResultBean;

import java.util.List;

import vip.bizhihui.app.App;

public class PermissionChecker {
    public static boolean checkWriteExternalPermission() {
        Context context = RouterTracker.peekActivity();
        String permission = android.Manifest.permission.WRITE_EXTERNAL_STORAGE;
        int res = context.checkCallingOrSelfPermission(permission);
        return (res == PackageManager.PERMISSION_GRANTED);
    }

    public static void requestWriteExternalPermission() {
        Context context = RouterTracker.peekActivity();
        PermissionManager permissionManager = ManagerFactory.getManagerService(PermissionManager
            .class);
        final String[] needPermission = new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE};
        permissionManager.requestPermissions(context, new PermissionManager
            .PermissionListener() {

            @Override
            public void onPermissionsGranted(List<String> perms) {
                // 允许访问手机内存权限
                // Toast.makeText(App.sInstance, "给我了", Toast.LENGTH_LONG).show();
            }

            @Override
            public void onPermissionsDenied(List<String> perms) {
                // 不允许访问手机内存权限
                Toast.makeText(RouterTracker.peekActivity(), "权限没给我，没法继续下一步操作哦~", Toast.LENGTH_LONG).show();
            }

            @Override
            public void onPermissionRequestRejected() {

            }
        }, needPermission);

    }
}
