package vip.bizhihui.app.module;

import android.app.Dialog;
import android.content.DialogInterface;
import android.util.Log;
import android.widget.Toast;

import com.eros.framework.adapter.router.RouterTracker;
import com.taobao.weex.annotation.JSMethod;
import com.taobao.weex.bridge.JSCallback;
import com.taobao.weex.common.WXModule;
import com.tencent.captchasdk.TCaptchaDialog;
import com.tencent.captchasdk.TCaptchaVerifyListener;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import static com.alibaba.android.bindingx.core.internal.Utils.toList;


public class TencentCaptcha extends WXModule {
    private final static String TAG = "TencentCaptcha";

    public static Map<String, Object> toMap(JSONObject object) throws JSONException {
        Map<String, Object> map = new HashMap<String, Object>();

        Iterator<String> keysItr = object.keys();
        while (keysItr.hasNext()) {
            String key = keysItr.next();
            Object value = object.get(key);

            if (value instanceof JSONArray) {
                value = toList((JSONArray) value);
            } else if (value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            map.put(key, value);
        }
        return map;
    }

    @JSMethod
    public void showCaptcha(String appId, final JSCallback jsCallback) {
        try {
            Dialog dialog = new TCaptchaDialog(RouterTracker.peekActivity(), true, new Dialog.OnCancelListener() {
                @Override
                public void onCancel(DialogInterface dialog) {
                    HashMap<String, Object> map = new HashMap<>();
                    map.put("code", -1);
                    map.put("message", "用户取消了");
                    jsCallback.invokeAndKeepAlive(map);
                }
            }, appId, new TCaptchaVerifyListener() {
                @Override
                public void onVerifyCallback(JSONObject jsonObject) {
                    if (jsCallback != null) {
                        Map map = null;
                        try {
                            map = toMap(jsonObject);
                        } catch (Exception e) {
                            Log.e(TAG, "转换失败了", e);
                            map = null;
                        }
                        jsCallback.invokeAndKeepAlive(map);
                    }
                }
            }, null);
            dialog.show();
        } catch (Exception e) {
            Log.e(TAG, "showCaptcha: ", e);
        }
    }
}
