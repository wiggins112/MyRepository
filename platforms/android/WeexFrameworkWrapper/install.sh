#!/usr/bin/env bash
echo "开始安装依赖库"
rm -r wxframework/
rm -r nexus/
rm -r ErosPluginAmap/
rm -r erosplugingt/
rm -r erospluginwxpay/
rm -r erospluginumeng/
rm -r erospluginum/
rm -r erosplugingoalkeeper/
rm -r erospluginscreenshot/

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/WeexErosFramework.git "wxframework"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/eros-nexus.git "nexus"

# master 分支
# git clone https://github.com/bmfe/eros-plugin-android-amap.git "ErosPluginAmap"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/eros-plugin-android-getui.git "erosplugingt"

# master 分支
# git clone https://github.com/bmfe/eros-plugin-android-wxpay.git "erospluginwxpay"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/eros-plugin-android-wxshare.git "erospluginumeng"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/eros-plugin-android-UMAnalytics.git "erospluginum"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/erosplugingoalkeeper.git "erosplugingoalkeeper"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/erospluginscreenshot.git "erospluginscreenshot"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/erospluginkline.git "erospluginkline"

# master 分支
git clone ssh://git@git.truxing.com:220/ganlan_bc/KLineChartLib.git "KLineChartLib"

cd ../

echo "依赖库安装完成"