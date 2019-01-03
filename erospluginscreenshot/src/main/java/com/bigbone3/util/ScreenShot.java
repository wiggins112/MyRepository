package com.bigbone3.util;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.text.TextUtils;


import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.alibaba.weex.plugin.annotation.WeexModule;
import com.eros.framework.adapter.router.RouterTracker;
import com.eros.framework.manager.impl.FileManager;
import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.bridge.JSCallback;
import com.taobao.weex.common.WXModule;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WeexModule(name = "ScreenShot", lazyLoad = true)
public class ScreenShot extends WXModule {

    private String saveImage(Bitmap bitmap, String fileName) {
        String root = Environment.getExternalStorageDirectory().toString();
        File myDir = new File(root + "/bizhihui");
        if (!myDir.exists()) {
            myDir.mkdirs();
        } else {
            for (File file : myDir.listFiles()) {
                file.delete();
            }
        }
        File file = new File(myDir, fileName);
        if (file.exists())
            file.delete();
        try {
            FileOutputStream out = new FileOutputStream(file);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out);
            out.flush();
            out.close();
            return file.getAbsolutePath();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }


    public boolean requestPermission() {
        Activity activity = RouterTracker.peekActivity();
        if (!(hasWriteStoragePermission(activity))) {
            ActivityCompat.requestPermissions(activity, new String[]{ Manifest.permission.WRITE_EXTERNAL_STORAGE}, 2);
        }
        return hasWriteStoragePermission(activity);
    }

    private boolean hasWriteStoragePermission(Context context) {
        boolean result = ActivityCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        return result;
    }

    @JSMethod
    public void resetHeight(int height) {
        Activity activity = RouterTracker.peekActivity();
        int viewId = activity.getResources().getIdentifier("layout_container", "id", activity.getPackageName());
        ViewGroup group = (ViewGroup)activity.findViewById(viewId);
        group.setLayoutParams(new FrameLayout.LayoutParams(group.getWidth(), height));
        group.requestLayout();
    }

    @JSMethod
    public void saveImages(String path, String fileName, JSCallback callback) {
        Map<String, Object> data = new HashMap<>();
        // 其次把文件插入到系统图库
        try {
            MediaStore.Images.Media.insertImage(RouterTracker.peekActivity().getContentResolver(), path, fileName, null);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            data.put("result", false);
            callback.invokeAndKeepAlive(data);
            return;
        }
        // 最后通知图库更新
        RouterTracker.peekActivity().sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.parse("file://" + path)));
        data.put("result", true);
        callback.invokeAndKeepAlive(data);
    }

    public Bitmap joinVertical(Bitmap first, Bitmap second) {

        if (first.getWidth() > second.getWidth()) {
            second = Bitmap.createScaledBitmap(second, first.getWidth(), (int)(second.getHeight() * ((float)first.getWidth() / second.getWidth())), true);
        } else if (first.getWidth() < second.getWidth()) {
            first = Bitmap.createScaledBitmap(first, second.getWidth(), (int)(first.getHeight() * ((float)second.getWidth() / first.getWidth())), true);
        }

        int width = Math.max(first.getWidth(), second.getWidth());
        int height = first.getHeight() + second.getHeight();
        Bitmap result = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);

        Canvas canvas = new Canvas(result);
        canvas.drawBitmap(first, 0, 0, null);
        canvas.drawBitmap(second, 0, first.getHeight(), null);
        return result;
    }


    @JSMethod
    public void getScreenShot(int height, String fileName, String logoFileName, String position, JSCallback callback) {
        Activity activity = RouterTracker.peekActivity();

        if (!requestPermission()) {
            Map<String, Object> data = new HashMap<>();
            data.put("error", "no permission");
            callback.invokeAndKeepAlive(data);
            return;
        }
        int viewId = activity.getResources().getIdentifier("layout_container", "id", activity.getPackageName());
        Bitmap bitmap = shotView((ViewGroup)activity.findViewById(viewId), height);
        if (!TextUtils.isEmpty(logoFileName)) {
            Bitmap logoBitmap = loadAssetBitmap(logoFileName);
            if (logoBitmap != null) {
                if ("top".equalsIgnoreCase(position)) {
                    bitmap = joinVertical(logoBitmap, bitmap);
                } else {
                    bitmap = joinVertical(bitmap, logoBitmap);
                }
            }
        }
        String path = saveImage(bitmap, fileName);
        Map<String, Object> data = new HashMap<>();
        data.put("height", bitmap.getHeight());
        data.put("path", path);
        System.gc();
        callback.invokeAndKeepAlive(data);
    }

    private Bitmap shotView(ViewGroup viewGroup, int height) {
        Bitmap bitmap = Bitmap.createBitmap(viewGroup.getWidth(), height, Bitmap.Config.ARGB_8888);
        final Canvas canvas = new Canvas(bitmap);
        viewGroup.setLayoutParams(new FrameLayout.LayoutParams(viewGroup.getWidth(), height));
        viewGroup.requestLayout();
        viewGroup.draw(canvas);
        return bitmap;
    }

    private Bitmap loadAssetBitmap(String fileName) {
        AssetManager assetManager = RouterTracker.peekActivity().getAssets();
        try {
            File file = FileManager.getPathBundleDir(RouterTracker.peekActivity(), "bundle/assets/images/" + fileName);
            FileInputStream fis = new FileInputStream(file);
            Drawable d = Drawable.createFromStream(fis, null);
            fis.close();
            return  ((BitmapDrawable) d).getBitmap();
        } catch (IOException e) {
            return null;
        }

    }



}
