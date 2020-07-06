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
            ep.emit("ep_createjson", JSON.stringify(result, "", "\t"));
          }
        })
      })
      ep.on("ep_createjson", function (jsonstr) {
        var jsonname = filename.split(".")[0] + ".json";
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

