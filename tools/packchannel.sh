#!/bin/sh
CHANNELS="yingyongbao s360 oppo uc xiaomi baidu"
for CHANNEL in $CHANNELS
do
    cross-env-shell CHANNEL=$CHANNEL node test.js
    ./platforms/android/gradlew assembleRelease
done
