#!/usr/bin/env bash
echo "开始更新依赖库"

echo -e "\n\n"
echo "wxframework"
cd wxframework/
git pull
cd ../

echo -e "\n\n"
echo "nexus"
cd nexus/
git pull
cd ../

# echo -e "\n\n"
# echo "ErosPluginAmap"
# cd ErosPluginAmap/
# git pull
# cd ../

echo -e "\n\n"
echo "erosplugingt"
cd erosplugingt/
git pull
cd ../

# echo -e "\n\n"
# echo "erospluginwxpay"
# cd erospluginwxpay/
# git pull
# cd ../

echo -e "\n\n"
echo "erospluginumeng"
cd erospluginumeng/
git pull
cd ../

echo -e "\n\n"
echo "erospluginum"
cd erospluginum/
git pull
cd ../

echo -e "\n\n"
echo "erospluginscreenshot"
cd erospluginscreenshot/
git pull
cd ../

echo -e "\n\n"
echo "erosplugingoalkeeper"
cd erosplugingoalkeeper/
git pull
cd ../

echo -e "\n\n"
echo "erospluginkline"
cd erospluginkline/
git pull
cd ../

echo -e "\n\n"
echo "KLineChartLib"
cd KLineChartLib/
git pull
cd ../

echo "依赖库更新完成"