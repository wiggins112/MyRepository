//
//  BMUMAnalyticsModule.m
//  ErosPluginUMAnalytics
//
//  Created by XHY on 2018/7/18.
//

#import "BMUMAnalyticsModule.h"
#import <WeexPluginLoader/WeexPluginLoader/WeexPluginLoader.h>
#import <UMCCommon/UMCommon/UMCommon.h>
#import <UMCAnalytics/UMAnalytics/MobClick.h>

WX_PlUGIN_EXPORT_MODULE(bmUMAnalytics, BMUMAnalyticsModule)

@implementation BMUMAnalyticsModule

@synthesize weexInstance;

WX_EXPORT_METHOD(@selector(initUM:))
WX_EXPORT_METHOD(@selector(event:))
WX_EXPORT_METHOD(@selector(beginPage:))
WX_EXPORT_METHOD(@selector(endPage:))
WX_EXPORT_METHOD(@selector(beginEvent:))
WX_EXPORT_METHOD(@selector(endEvent:))

/** 初始化友盟方法 */
- (void)initUM:(NSString *)appkey
{
    /* 初始化友盟组件 */
    [UMConfigure initWithAppkey:appkey channel:nil];
}

/** 统计页面时长 开始 */
- (void)beginPage:(NSString *)page {
    [MobClick beginLogPageView:page];
}
/** 统计页面时长 结束 */
- (void)endPage:(NSString *)page {
    [MobClick beginLogPageView:page];
}

/** 统计事件时长 开始 */
- (void)beginEvent:(NSString *)event {
    [MobClick beginEvent:event];
}
/** 统计事件时长 结束 */
- (void)endEvent:(NSString *)event {
    [MobClick endEvent:event];
}

/** 统计事件发生次数 */
- (void)event:(NSString *)event {
    [MobClick event:event];
}

@end
