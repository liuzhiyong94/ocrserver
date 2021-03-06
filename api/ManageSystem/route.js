var express = require('express');
var settings = require('../../settings.js');
var router = express.Router();
var errors = require('../libs/errors');
module.exports = (function () {
    router.all('/:ifName',
        function (req, res) {
            var ifName = req.params.ifName;
            if (!ifName) res.send(404);
            function callback(_code, _err, _result) {
                res.send({ code: _code, msg: _err, data: _result });
            }
            var errors = require('../libs/errors.js');
            var api = require('./ManageSystemApi.js').GetApi(req, res, callback);
            try {
                if (api[ifName]) {
                    api[ifName]();
                } else {
                    res.send({ code: 50001, msg: errors[50001].message, data: "" });
                }
            } catch (_err) {
                // console.log(_err);
                res.send({ code: _err.code, msg: _err.msg, data: _err.data });
            }
        }
    );

    return router;

}).call(this);