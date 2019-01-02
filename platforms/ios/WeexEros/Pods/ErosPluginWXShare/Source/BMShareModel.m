//
//  BMShareModel.m
//  BM-JYT
//
//  Created by XHY on 2017/2/27.
//  Copyright © 2017年 XHY. All rights reserved.
//

#import "BMShareModel.h"

@implementation BMShareModel

- (BOOL)modelCustomTransformFromDictionary:(NSDictionary *)dic {
    
    NSString *platform = dic[@"platform"];
    if ([platform isEqualToString:K_SharePlatformWechatSession]) {
        _platform = BMSharePlatformType_WechatSession;
    }
    else if ([platform isEqualToString:K_SharePlatformWechatTimeLine])
    {
        _platform = BMSharePlatformType_WechatTimeLine;
    }
    else if ([platform isEqualToString:K_SharePlatformSina])
    {
        _platform = BMSharePlatformType_Sina;
    }
    else if ([platform isEqualToString:K_SharePlatformFacebook])
    {
        _platform = BMSharePlatformType_Facebook;
    }
    else if ([platform isEqualToString:K_SharePlatformFacebookMessage])
    {
        _platform = BMSharePlatformType_FacebookMessage;
    }
    else if ([platform isEqualToString:K_SharePlatformWhatsApp])
    {
        _platform = BMSharePlatformType_WhatsApp;
    }
    else if ([platform isEqualToString:K_SharePlatformLine])
    {
        _platform = BMSharePlatformType_Line;
    }
    else if ([platform isEqualToString:K_SharePlatformTwitter])
    {
        _platform = BMSharePlatformType_Twitter;
    }
    else if ([platform isEqualToString:K_SharePlatformQQ])
    {
        _platform = BMSharePlatformType_QQ;
    }
    else if ([platform isEqualToString:K_SharePlatformQzone])
    {
        _platform = BMSharePlatformType_Qzone;
    }
    
    NSString *type = dic[@"shareType"];
    if ([type isEqualToString:K_ShareTypeText]) {
        _shareType = BMShareTypeText;
    }
    else if ([type isEqualToString:K_ShareTypeImage])
    {
        _shareType = BMShareTypeImage;
    }
    else if ([type isEqualToString:K_ShareTypeTextImage])
    {
        _shareType = BMShareTypeTextImage;
    }
    else if ([type isEqualToString:K_ShareTypeWebpage])
    {
        _shareType = BMShareTypeWebpage;
    }
    else if ([type isEqualToString:K_ShareTypeMusic])
    {
        _shareType = BMShareTypeMusic;
    }
    else if ([type isEqualToString:K_ShareTypeVideo])
    {
        _shareType = BMShareTypeVideo;
    }
    else if ([type isEqualToString:K_ShareTypeMiniProgram])
    {
        _shareType = BMShareTypeMiniProgram;
    }
    else {
        _shareType = BMShareTypeWebpage;
    }
    
    return YES;
}

@end
