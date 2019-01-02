//
//  BMUmengModule.m
//  BMBaseLibrary
//
//  Created by XHY on 2018/4/18.
//

#import "BMUmengModule.h"
#import "BMShareModel.h"
#import "YYModel.h"
#import <UMCShare/UMShare/UMShare.h>
#import <UMCCommon/UMCommon/UMCommon.h>
#import <WeexPluginLoader/WeexPluginLoader/WeexPluginLoader.h>
#import "BMMediatorManager.h"
#import "NSDictionary+Util.h"
#import <WXApi.h>

WX_PlUGIN_EXPORT_MODULE(bmWXShare, BMUmengModule)

@interface BMUmengModule ()

@property (nonatomic, assign) BOOL WXAppIsInstall;

@end

@implementation BMUmengModule

@synthesize weexInstance;

WX_EXPORT_METHOD_SYNC(@selector(isInstallWXApp))
WX_EXPORT_METHOD_SYNC(@selector(initUM:))
WX_EXPORT_METHOD_SYNC(@selector(initWX:))
WX_EXPORT_METHOD(@selector(share:successCallback:failedCallback:))
WX_EXPORT_METHOD(@selector(authLogin:))

/** 判断是否安装了微信 */
-(BOOL)isInstallWXApp
{
    dispatch_sync(dispatch_get_main_queue(), ^{
        self.WXAppIsInstall = [WXApi isWXAppInstalled];
    });
    return self.WXAppIsInstall;
}

/** 初始化友盟方法 */
- (void)initUM:(NSString *)appkey
{
    /* 初始化友盟组件 */
    [UMConfigure initWithAppkey:appkey channel:nil];
}

/** 初始化三方平台 */
- (void)initWX:(NSDictionary *)info
{
    if ([info[@"Platform"] isEqualToString:@"sinaWeibo"]) {
        NSLog(@"sinaWeiboxxx",info[@"Platform"]);
        [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina
                                              appKey:info[@"appKey"]
                                           appSecret:info[@"appSecret"]
                                         redirectURL:info[@"redirectURL"]];
        
        [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
        
    }
    else if ([info[@"Platform"] isEqualToString:@"QQ"]) {
        NSLog(@"Twitter",info[@"Platform"]);
        [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ
                                              appKey:info[@"appKey"]
                                           appSecret:info[@"appSecret"]
                                         redirectURL:info[@"redirectURL"]];
        
        [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
        
    } else if ([info[@"Platform"] isEqualToString:@"Twitter"]) {
        NSLog(@"Twitter",info[@"Platform"]);
        [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Twitter
                                              appKey:info[@"appKey"]
                                           appSecret:info[@"appSecret"]
                                         redirectURL:info[@"redirectURL"]];
        
        [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
        
    } else if ([info[@"Platform"] isEqualToString:@"Facebook"]) {
        NSLog(@"Facebook",info[@"Platform"]);
        [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Facebook
                                              appKey:info[@"appKey"]
                                           appSecret:info[@"appSecret"]
                                         redirectURL:info[@"redirectURL"]];
        
        [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
        
    } else {
        [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession
                                              appKey:info[@"appKey"]
                                           appSecret:info[@"appSecret"]
                                         redirectURL:info[@"redirectURL"]];
        
        [WXApi registerApp:info[@"appKey"]];
        
        [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
    }
    
}

/** 分享 */
- (void)share:(NSDictionary *)info successCallback:(WXModuleCallback)successCallback failedCallback:(WXModuleCallback)failedCallback
{
    BMShareModel *model = [BMShareModel yy_modelWithJSON:info];
    
    /**
     分享功能
     */
    NSString *shareTitle = model.title?:@"";
    NSString *shareText = model.content?:@"";
    NSString *shareUrl = model.url;
    id shareImage = model.image;
    
    UMSocialPlatformType platformType = UMSocialPlatformType_UnKnown;
    UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
    
    /** 分享平台 */
    //微信聊天
    if (model.platform == BMSharePlatformType_WechatSession)
    {
        platformType = UMSocialPlatformType_WechatSession;
    }
    //微信朋友圈
    else if (model.platform == BMSharePlatformType_WechatTimeLine)
    {
        platformType = UMSocialPlatformType_WechatTimeLine;
    }
    //QQ
    else if (model.platform == BMSharePlatformType_QQ)
    {
        platformType = UMSocialPlatformType_QQ;
    }
    //QQ空间
    else if (model.platform == BMSharePlatformType_Qzone)
    {
        platformType = UMSocialPlatformType_Qzone;
    }
    //新浪微博
    else if (model.platform == BMSharePlatformType_Sina)
    {
        platformType = UMSocialPlatformType_Sina;
    }
    //Facebook
    else if (model.platform == BMSharePlatformType_Facebook)
    {
        platformType = UMSocialPlatformType_Facebook;
    }
    //FacebookMessage
    else if (model.platform == BMSharePlatformType_FacebookMessage)
    {
        platformType = UMSocialPlatformType_FaceBookMessenger;
    }
    //WhatsApp
    else if (model.platform == BMSharePlatformType_WhatsApp)
    {
        platformType = UMSocialPlatformType_Whatsapp;
    }
    //Line
    else if (model.platform == BMSharePlatformType_Line)
    {
        platformType = UMSocialPlatformType_Line;
    }
    //Twitter
    else if (model.platform == BMSharePlatformType_Twitter)
    {
        platformType = UMSocialPlatformType_Twitter;
    }
    if (![[UMSocialManager defaultManager] isInstall:platformType]) {
        NSLog(@"未安装该应用");
        /* 失败回调 */
        if (failedCallback) {
            NSMutableDictionary *resultDic = [[NSMutableDictionary alloc] init];
            
            [resultDic setValue:[NSNumber numberWithInteger:2008] forKey:@"status"];
            [resultDic setValue:@"未安装该应用" forKey:@"errorMsg"];
            [resultDic setValue:@"" forKey:@"data"];
            
            failedCallback(resultDic);
        }
        return ;
    }
    /** 分享类型 */
    //文本
    if (model.shareType == BMShareTypeText) {
        messageObject.text = shareText;
    }
    //图片
    else if (model.shareType == BMShareTypeImage)
    {
        if ([model.imageType isEqualToString:@"base64"]) {
            // base64位图片分享
            NSLog(@"base",model.imageType);
            // base64位图片转UIImage
            NSURL *baseUrl = [NSURL URLWithString: shareImage];
            NSData *data = [NSData dataWithContentsOfURL: baseUrl];
            UIImage *baseUIImage = [UIImage imageWithData: data];
            
            UMShareImageObject *shareObject = [[UMShareImageObject alloc] init];
            shareObject.shareImage = baseUIImage;
            messageObject.shareObject = shareObject;
        } else {
            UMShareImageObject *shareObject = [[UMShareImageObject alloc] init];
            shareObject.shareImage = shareImage;
            messageObject.shareObject = shareObject;
        }
    }
    //图文
    else if (model.shareType == BMShareTypeTextImage)
    {
        UMShareImageObject *shareObject = [UMShareImageObject shareObjectWithTitle:shareTitle descr:shareText thumImage:nil];
        shareObject.shareImage = shareImage;
        messageObject.text = shareText;
        messageObject.shareObject = shareObject;
    }
    //音乐
    else if (model.shareType == BMShareTypeMusic)
    {
        UMShareMusicObject *shareObject = [UMShareMusicObject shareObjectWithTitle:shareTitle descr:shareText thumImage:shareImage];
        shareObject.musicUrl = shareUrl;
        messageObject.shareObject = shareObject;
    }
    //视频
    else if (model.shareType == BMShareTypeVideo)
    {
        UMShareVideoObject *shareObject = [UMShareVideoObject shareObjectWithTitle:shareTitle descr:shareText thumImage:shareImage];
        shareObject.videoUrl = shareUrl;
        messageObject.shareObject = shareObject;
    }
    //小程序
    else if (model.shareType == BMShareTypeMiniProgram)
    {
        UMShareMiniProgramObject *shareObject = [UMShareMiniProgramObject shareObjectWithTitle:shareTitle descr:shareText thumImage:shareImage];
        shareObject.webpageUrl = shareUrl;
        shareObject.path = model.path;
        shareObject.userName = model.userName;
        messageObject.shareObject = shareObject;
    }
    //网页
    else
    {
        UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:shareTitle descr:shareText thumImage:shareImage];
        shareObject.webpageUrl = shareUrl;
        messageObject.text = shareText;
        messageObject.shareObject = shareObject;
    }
    
    //设置分享内容
    [[UMSocialManager defaultManager] shareToPlatform:platformType
                                        messageObject:messageObject
                                currentViewController:[BMMediatorManager shareInstance].currentViewController
                                           completion:^(id result, NSError *error) {
                                               if (error) {
                                                   WXLogError(@"%@",error);
                                                   
                                                   /* 失败回调 */
                                                   if (failedCallback) {
                                                       NSDictionary *data = [NSDictionary configCallbackDataWithResCode:BMResCodeError msg:@"分享失败" data:nil];
                                                       failedCallback(data);
                                                   }
                                                   
                                               } else {
                                                   
                                                   /* 成功回调 */
                                                   if (successCallback) {
                                                       NSDictionary *data = [NSDictionary configCallbackDataWithResCode:BMResCodeSuccess msg:@"分享成功" data:nil];
                                                       successCallback(data);
                                                   }
                                               }
                                           }];
}

/** 调用第三方授权登录 */
- (void)authLogin:(WXModuleCallback)success
{
    [[UMSocialManager defaultManager] getUserInfoWithPlatform:UMSocialPlatformType_WechatSession currentViewController:weexInstance.viewController completion:^(id result, NSError *error) {
        
        if (error) {
            WXLogError(@"%@",error);
            NSDictionary *resDic = [NSDictionary configCallbackDataWithResCode:BMResCodeSuccess msg:@"微信授权失败" data:nil];
            if (success) {
                success(resDic);
            }
        } else {
            UMSocialUserInfoResponse *resp = result;
            
            if (success) {
                NSMutableDictionary *userInfo = [resp yy_modelToJSONObject];
                NSDictionary *resDic = [NSDictionary configCallbackDataWithResCode:BMResCodeSuccess msg:@"微信授权成功" data:userInfo];
                success(resDic);
            }
            
        }
        
    }];
}

@end
