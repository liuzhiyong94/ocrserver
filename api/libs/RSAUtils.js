"use strict";
var md5 = require('md5');
var NodeRSA = require('node-rsa');
var key = new NodeRSA();
/**
 * 获取当前的时间戳参数
 * @return
 */
function getRtick(){
    var timestamp = new Date().getTime();
    var rnd = parseInt(Math.random() * 1000);
    var rtick = timestamp + "" + rnd;
    return rtick;
}
exports.getRtick = getRtick;

/**
 * @param methodName //  /user/reg
 * @param urlParams: get请求需要放进参数中的参数  // developerId=aaaaaa&rtick=14840209310001&signType=rsa
 * @param rtick：随机生成，标识当前请求
 * @param requestBody：post请求时，requestBody值 // {"mail":"test@bestsign.cn","type":"2"}
 * @return string
 */
function getSignData(methodName,urlParams,requestBody){
    var _host='/openapi/v2';
    var _urlparams_arr=urlParams.split('&');
    var param = "";
    for(var i=0;i<_urlparams_arr.length;i++){
        param += _urlparams_arr[i];
    }
    var _str=Buffer.from(JSON.stringify(requestBody), 'utf-8');//效果与 crypto.createHash('md5').update(JSON.stringify(_requestBody), 'utf-8').digest('hex') 类似
    var str_md5=md5(_str);
    //console.log("这是md5后的requestBody:",str_md5);
    var sign_data=param+_host+methodName+str_md5;
    return sign_data;
}

/**
 * 计算参数签名
 * @param developerId 开发者ID
 * @param privateKey 用户私钥
 * @param host 请求的HOST地址（http://ip:port/context）
 * @param methodName 请求的接口方法名  /user/reg
 * @param rtick 时间戳参数
 * @param urlParams url参数（developerId=aaaaaa&rtick=14840209310001&signType=rsa）
 * @param requestBody request body 参数（JSON字符串）
 * @return
 */
function getRsaSign(privateKey,methodName,urlParams, requestBody){
    var sign_data=getSignData(methodName,urlParams,requestBody);
    var buffer = Buffer.from(sign_data);
    key.importKey(privateKey, 'pkcs8'); // privateKey 带头尾的格式化的字符串
    key.setOptions({b: 1024, signingScheme: "sha1"});//配置密钥长度，并设置签名方法
    var signature = encodeURIComponent(key.sign(buffer).toString('base64'));
    //console.log("这是sign值signature:",signature);
    return signature;
}
exports.getRsaSign = getRsaSign;