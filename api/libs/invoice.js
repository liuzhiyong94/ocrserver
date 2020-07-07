
var request = require('request');

const ocrurl = "http://inocr.cn/rest/typedocr";
const appKey = "inocr";
const appSecret = "QQyumwfMkFjdc4W7ro9DuQ1/EuYrsIQZKkG08XcMK7cVtJqyXLbpwv6bze44bXru/ksIdRo1Mx9A0IxhgHIwfw==";

// 增值税发票
// image2base64不能超过5MB，图片的base64
// 返回值有两个参数，第一个err，第二个res
function VatOcr(image2base64, type, cb) {
    console.log('OCR识别中，请稍后...');
    if (image2base64.length > 10000000) {
        return cb("图像大小超过限制，请缩小图像后再进行识别", null);
    }
    var requestData = {
        "appKey": appKey,
        "appSecret": appSecret,
        "ticketID": "",
        "image": image2base64,
        "type": type
    }
    request({
        url: ocrurl,
        method: "POST",
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(requestData)
    }, function (error, response, body) {
        if (error) {
            return cb("暂时无法访问OCR服务，请稍后再试", null);
        }
        else {
            body = JSON.parse(body)
            var data = body.data;
            data = data.replace(/\\/g, "");
            if (type == "Generalmedicalbillclassify_deep") {
                data = JSON.parse(data)
            }
            if (body.code == 200) {
                console.log('OCR识别成功');
                return cb(null, data);
            }
            else {
                return cb(body.msg, null);
            }
        }
    });
}

exports.VatOcr = VatOcr;