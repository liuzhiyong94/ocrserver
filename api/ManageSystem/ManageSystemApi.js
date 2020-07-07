var EventProxy = require('eventproxy')
var settings = require('../../settings.js')
var hcUti = require('../libs/hcUti')
var File = require('../libs/File')
var fs = require('fs')
var path = require('path')
var invoice = require('../libs/invoice.js');

exports.GetApi = function (_req, _res, _callback) {
  return {
    db: require('../libs/mysql.js'), // 数据库连接属性
    req: _req,
    res: _res,
    cb: _callback,
    getParam: function (param, _code) {
      var code = _code || 40002
      if (typeof _req.query[param] === 'undefined' && typeof _req.body[param] === 'undefined') {
        console.log('缺乏参数:', param)
        throw {
          code: code,
          msg: _errors[code].message,
          data: _errors[code].name
        }
      } else if (!_req.query[param]) return _req.body[param]
      else return _req.query[param]
    },
    test: function () {
      var Me = this
      return Me.cb(200, null, 'ok')
    },
    Upload: function () {
      var Me = this;
      var files = Me.req.files.file;
      // 上传一个文件时，files是对象，上传多个文件时，files是数组
      // 需要将files转化成数组
      var FileArr = [];
      if (files instanceof Array) {
        FileArr = files;
      } else {
        FileArr.push(files);
      }
      console.log("FileArr111:", FileArr)
      UploadFile(FileArr, 0, Me.cb)
    },
    GetInitData: function () {
      var Me = this;
      var pathName = settings.initDataDiskUrl;
      fs.readdir(pathName, function (err, files) {
        var dirs = [];
        (function iterator(i) {
          if (i == files.length) {
            return Me.cb(200, "", dirs);
          }
          fs.stat(path.join(pathName, files[i]), function (err, data) {
            if (data.isFile()) {
              dirs.push(settings.initDataUrl + files[i]);
            }
            iterator(i + 1);
          });
        })(0);
      });
    },
    GetModifyData: function () {
      var Me = this;
      var pathName = settings.modifyDataDiskUrl;
      fs.readdir(pathName, function (err, files) {
        var dirs = [];
        (function iterator(i) {
          if (i == files.length) {
            return Me.cb(200, "", dirs);
          }
          fs.stat(path.join(pathName, files[i]), function (err, data) {
            if (data.isFile()) {
              dirs.push(settings.modifyDataUrl + files[i]);
            }
            iterator(i + 1);
          });
        })(0);
      });
    },
    UploadToOcr: function () {
      var Me = this;
      var ep = new EventProxy();
      var base64 = Me.getParam('base64');
      var filename = Me.getParam('filename');
      var type = Me.getParam('type');//ocr类型
      var base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
      var dataBuffer = new Buffer(base64Data, 'base64');
      var filePath = './web/uploadocr/';
      var fullPath = './web/uploadocr/' + filename;
      var initDataPath = './web/initdata/'
      var f = new File();
      f.createFile(dataBuffer, filePath, fullPath, function (err, result) {
        if (err) {
          return cbError(50003, Me.cb);
        }
        else {
          ep.emit("ep_ocr");
        }
      })
      ep.on("ep_ocr", function () {
        invoice.VatOcr(base64Data, type, function (err, result) {
          if (err) {
            console.log("err:", err);
          }
          else {
            var str = TransJson(result, type);
            ep.emit("ep_createjson", str);
            // ep.emit("ep_createjson", JSON.stringify(result, "", "\t"));
          }
        })
      })
      ep.on("ep_createjson", function (jsonstr) {
        var jsonname = filename.split(".")[0] + ".docx";
        fs.writeFile(initDataPath + jsonname, jsonstr, function (err) {
          if (err) {
            console.log("ep_createjson_err:", err);
          }
          else {
            return Me.cb(200, "", {
              "imageurl": settings.imageUrl + filename,
              "jsonstr": jsonstr,
              "jsonname": jsonname
            })
          }
        })
      })

    },
    ModifyJsonStr: function () {
      var Me = this;
      var jsonstr = Me.getParam("jsonstr");
      var jsonname = Me.getParam("jsonname");
      var modifyDataPath = './web/modifydata/'
      fs.writeFile(modifyDataPath + jsonname, jsonstr, function (err) {
        if (err) {
          console.log("ep_createjson_err:", err);
        }
        else {
          return Me.cb(200, "", "success")
        }
      })
    },
    GetXuhaoSrc: function () {
      var Me = this;
      var xuhao = Me.getParam("xuhao");
      var pathName = settings.uploadDiskUrl;
      fs.readdir(pathName, function (err, files) {
        var dirs = [];
        (function iterator(i) {
          if (i == files.length) {
            return Me.cb(200, "", dirs);
          }
          fs.stat(path.join(pathName, files[i]), function (err, data) {
            if (data.isFile()) {
              if (files[i].split("-")[0] == xuhao) {
                dirs.push(settings.uploadUrl + files[i]);
              }
            }
            iterator(i + 1);
          });
        })(0);
      });

    }
  }
}

function cbError(code, cb) {
  cb(code, _errors[code].message, _errors[code].name)
}

var SerialNumber = 1;

function UploadFile(files, count, cb) {
  console.log("UploadFile")
  var ep = new EventProxy();
  if (files.length <= count) {
    return cb(200, null, "success");
  }
  count++;
  var temp_filepath = files[count - 1].path;
  var filename = SerialNumber + "-" + files[count - 1].name;
  SerialNumber++;
  var employeePath = path.join(__dirname, '../../web/upload');
  var exceldir = employeePath;
  var fullPath = '';
  var file = new File();
  fullPath = exceldir + '/' + filename;
  file.loadFile(temp_filepath, null, ep.doneLater('loadFile'));
  ep.once('loadFile', function (_result) {
    if (_result) {
      return file.createFile(_result, exceldir, fullPath, ep.doneLater('createFile'));
    }
  });
  ep.once('createFile', function (_result) {
    if (_result) {
      fs.unlink(files[count - 1].path, function (err) {
        if (err) {
          console.log('err:', err);
        }
      })
      UploadFile(files, count, cb);
    }
  });
}

// json转固定格式字符串
function TransJson(json, type) {
  // 1.type="BJmedicalinsurance",北京费用清单
  var returnRes = "";
  if (type == "BJmedicalinsurance") {
    for (var key in json) {
      if (typeof json[key] == "string") {
        returnRes += key + ": " + json[key] + "\n";
      }
      else {
        for (var i = 0; i < json[key].length; i++) {
          var item = json[key][i];
          for (var k in item) {
            returnRes += item[k] + " ";
          }
          returnRes += "\n";
        }
      }
    }
  }
  // 2.type="TencentInsurance",其他费用清单
  else if (type == "TencentInsurance") {
    for (var key in json) {
      if (typeof json[key] == "string") {
        returnRes += key + ": " + json[key] + "\n";
      }
      else {
        for (var i = 0; i < json[key].length; i++) {
          var item = json[key][i];
          for (var k in item) {
            returnRes += item[k] + " ";
          }
          returnRes += "\n";
        }
      }
    }
  }
  // 3.type="GeneralMedicalText",小结检测
  else if (type == "GeneralMedicalText") {
    returnRes += json.text;
  }
  // 4.type="Generalmedicalbillclassify_deep",门诊住院
  else if (type == "Generalmedicalbillclassify_deep") {
    let medical_result = json.medical_result;
    // 门诊
    if (medical_result.type == 1) {
      if (json.province == "02") {
        returnRes += "地区 上海" + "\n";
        returnRes += "影像类型 上海门急诊收费票据" + "\n";
      }
      else if (json.province == "01") {
        returnRes += "地区 北京" + "\n";
        returnRes += "影像类型 北京门急诊收费票据" + "\n";
      }
      returnRes += "医院名称 " + (medical_result.hospital_name || "") + "\n";
      returnRes += "就诊日期 " + (medical_result.billing_date || "") + "\n";
      returnRes += "业务流水号 " + (medical_result.service_serial_number || "") + "\n";
      returnRes += "医疗机构类型 " + (medical_result.medical_organization_type || "") + "\n";
      returnRes += "发票号码 " + (medical_result.note_no || "") + "\n";
      returnRes += "姓名 " + (medical_result.patient_name || "") + "\n";
      returnRes += "性别 " + ((medical_result.patient_gender == 1 ? "男" : "女") || "") + "\n";
      returnRes += "医保类型 " + (medical_result.medical_insurance_type || "") + "\n";
      returnRes += "社会保障号码 " + (medical_result.social_security_card_number || "") + "\n";
      returnRes += "收款人 " + (medical_result.payee || "") + "\n";
      let cost_categories = medical_result.cost_categories;
      for (let i = 0; i < cost_categories.length; i++) {
        returnRes += "收费项目 " + cost_categories[i].name + "\n";
        returnRes += "收费项目(金额) " + (cost_categories[i].cost ? (cost_categories[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
      }
      let cost_detail_list = medical_result.cost_detail_list;
      for (let i = 0; i < cost_detail_list.length; i++) {
        returnRes += "项目编码 " + cost_detail_list[i].item_coding + "\n";
        returnRes += "项目名称 " + cost_detail_list[i].ocr_name + "\n";
        returnRes += "项目规格 " + cost_detail_list[i].spec + "\n";
        returnRes += "单位 " + cost_detail_list[i].spec + "\n";
        returnRes += "单价 " + (cost_detail_list[i].unit_price ? (cost_detail_list[i].unit_price * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        returnRes += "数量 " + cost_detail_list[i].amount + "\n";
        returnRes += "金额 " + (cost_detail_list[i].price ? (cost_detail_list[i].price * 1).toFixed(2) : (0).toFixed(2)) + "\n";
      }
      returnRes += "合计(小写) " + (medical_result.total_cost ? (medical_result.total_cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
      let payments_info = medical_result.payments_info;
      for (let i = 0; i < payments_info.length; i++) {
        returnRes += payments_info[i].name + " " + (payments_info[i].amount ? (payments_info[i].amount * 1).toFixed(2) : (0).toFixed(2)) + "\n";
      }
    }
    // 住院
    else if (medical_result.type == 2) {
      if (json.province == "02") {
        returnRes += "地区 上海" + "\n";
        returnRes += "影像类型 上海医疗住院收费票据" + "\n";
      }
      else if (json.province == "01") {
        returnRes += "地区 北京" + "\n";
        returnRes += "影像类型 北京医疗住院收费票据" + "\n";
      }
      returnRes += "医院名称 " + (medical_result.hospital_name || "") + "\n";
      returnRes += "业务流水号 " + (medical_result.service_serial_number || "") + "\n";
      returnRes += "医疗机构类型 " + (medical_result.medical_organization_type || "") + "\n";
      returnRes += "病历号 " + (medical_result.hospital_no || "") + "\n";
      returnRes += "住院号 " + (medical_result.hospital_no || "") + "\n";
      returnRes += "入院日期 " + (medical_result.hospital_dates[0] || "") + "\n";
      returnRes += "出院日期 " + (medical_result.hospital_dates[1] || "") + "\n";
      returnRes += "住院天数 " + (medical_result.hospital_days || "") + "\n";
      returnRes += "发票号码 " + (medical_result.note_no || "") + "\n";
      returnRes += "姓名 " + (medical_result.patient_name || "") + "\n";
      returnRes += "性别 " + ((medical_result.patient_gender == 1 ? "男" : "女") || "") + "\n";
      returnRes += "医保类型 " + (medical_result.medical_insurance_type || "") + "\n";
      returnRes += "社会保障号码 " + (medical_result.social_security_card_number || "") + "\n";
      returnRes += "日期 " + (medical_result.billing_date || "") + "\n";
      returnRes += "收款人 " + (medical_result.payee || "") + "\n";
      let cost_categories = medical_result.cost_categories;
      for (let i = 0; i < cost_categories.length; i++) {
        returnRes += "收费项目 " + cost_categories[i].name + "\n";
        returnRes += "收费项目(金额) " + (cost_categories[i].cost ? (cost_categories[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
      }
      returnRes += "合计(小写) " + (medical_result.total_cost ? (medical_result.total_cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
      let cash_payment_situation = medical_result.cash_payment_situation;
      if (cash_payment_situation.length) {
        for (let i = 0; i < cash_payment_situation.length; i++) {
          returnRes += cash_payment_situation[i].name + " " + (cash_payment_situation[i].cost ? (cash_payment_situation[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        }
      }
      let else_payment_situation = medical_result.else_payment_situation;
      if (else_payment_situation.length) {
        for (let i = 0; i < else_payment_situation.length; i++) {
          returnRes += else_payment_situation[i].name + " " + (else_payment_situation[i].cost ? (else_payment_situation[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        }
      }
      let fund_payments = medical_result.fund_payments;
      if (fund_payments.length) {
        for (let i = 0; i < fund_payments.length; i++) {
          returnRes += fund_payments[i].name + " " + (fund_payments[i].cost ? (fund_payments[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        }
      }
      let fund_subitem_situation = medical_result.fund_subitem_situation;
      if (fund_subitem_situation.length) {
        for (let i = 0; i < fund_subitem_situation.length; i++) {
          returnRes += fund_subitem_situation[i].name + " " + (fund_subitem_situation[i].cost ? (fund_subitem_situation[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        }
      }
      let person_assume_situation = medical_result.person_assume_situation;
      if (person_assume_situation.length) {
        for (let i = 0; i < person_assume_situation.length; i++) {
          returnRes += person_assume_situation[i].name + " " + (person_assume_situation[i].cost ? (person_assume_situation[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        }
      }
      let person_payment_situation = medical_result.person_payment_situation;
      if (person_payment_situation.length) {
        for (let i = 0; i < person_payment_situation.length; i++) {
          returnRes += person_payment_situation[i].name + " " + (person_payment_situation[i].cost ? (person_payment_situation[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        }
      }
      let supplement_payment_situation = medical_result.supplement_payment_situation;
      if (supplement_payment_situation.length) {
        for (let i = 0; i < supplement_payment_situation.length; i++) {
          returnRes += supplement_payment_situation[i].name + " " + (supplement_payment_situation[i].cost ? (supplement_payment_situation[i].cost * 1).toFixed(2) : (0).toFixed(2)) + "\n";
        }
      }
    }
  }
  return returnRes;
}
