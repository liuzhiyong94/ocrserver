/**
 * Created by lg on 2018/6/25.
 */
"use strict";
var EventProxy = require('eventproxy');
var settings = require('../../settings.js');
var db=require('../libs/mysql');
var request=require('request');
var hcUti=require('./hcUti');
var xml2js = require('xml2js');
var iconv=require('iconv-lite');
var builder = new xml2js.Builder({
    xmldec:{
        'version':'1.0',
        'encoding': 'GBK'
    }
});
var iconv=require('iconv-lite');
function createCases(){

}
exports.createCases=createCases;
//var obj={"东湖去区级主管13212345678":2,"西湖主管":1,"东湖主管":1,"南湖主管":2}
function getkey(name_phone_json){
    var obj=name_phone_json;
    var max=10000;
    var fix="";
    var laskey="";
    for( var key in obj){
        if(obj[key]<max){
            max=obj[key];
            laskey=key;
        }
    }
    return laskey
}
//getkey(JSON.stringify(obj))
function paiban_ck(group_id,appointTime,cb){
    /*
     / 1,根据预约时间筛选出班次表的班次
     2,找到对应值班JSON对象，取出数值最小的查勘员姓名+手机号（唯一）
     3，取user表取出该查勘员，校验其真实性，并获取人的详情
     */
    var ep=new EventProxy();
    console.log('group_id,appointTime:',group_id,appointTime);
    var duty_day=hcUti.formatDate(new Date(appointTime),'yyyy-MM-dd');
    var time=hcUti.formatDate(new Date(appointTime),'hh:mm');
    var obj={};
    var newpb_str="";
    var sql_getpb="SELECT a.*,b.start_time,b.end_time FROM `duty_roster_ck` a LEFT JOIN `schedule` b " +
        "on (a.sche_id=b.id and b.she_class=1) where a.group_id=? and a.duty_day=? and b.start_time<=? and b.end_time>?";
    db.query(sql_getpb,[group_id,duty_day,time,time],function(err,result){
        if(err) return cb('系统错误',null);
        if(result.length==0) return cb('该时间所属片区无查勘排班记录');
        obj=result[0];
        var name_phone_json=JSON.parse(obj.name_phone_json);
        var name_phone=getkey(name_phone_json);
        name_phone_json[name_phone]=name_phone_json[name_phone]+1;
        newpb_str=JSON.stringify(name_phone_json);
        ep.emit('get_ck_user',name_phone);
    });
    ep.once('get_ck_user',function(name_phone){
        var sql_getUser="select * from users where name_phone=? and frontrole in(1,12,13,123) and userstate=1;";
        db.query(sql_getUser,[name_phone],function(err,result){
            if(err) return cb('系统异常',null);
            if(result.length==0) return cb('该预约时间值班查勘员'+name_phone+'权限发生变化或已离职',null);
            if(!result[0].jobNo) return cb('该预约时间值班定损员'+name_phone+'未维护工号',null);
            result[0].duty_rotser_id=obj.id;//取排班表id，回传
            result[0].newpb_str=newpb_str;//去排班更新的人的数量的str
            return cb(null,result[0]);
        });
    });
}
exports.paiban_ck=paiban_ck;

function paiban_rs(group_id,appointTime,cb){
    /*
     / 1,根据预约时间筛选出班次表的班次
     2,找到对应值班JSON对象，取出数值最小的查勘员姓名+手机号（唯一）
     3，取user表取出该查勘员，校验其真实性，并获取人的详情
     */
    var ep=new EventProxy();
    console.log('group_id,appointTime:',group_id,appointTime);
    var duty_day=hcUti.formatDate(new Date(appointTime),'yyyy-MM-dd');
    var time=hcUti.formatDate(new Date(appointTime),'hh:mm');
    var obj={};
    var newpb_str="";
    var sql_getpb="SELECT a.*,b.start_time,b.end_time FROM `duty_roster_rs` a LEFT JOIN `schedule` b " +
        "on (a.sche_id=b.id and b.she_class=3) where a.group_id=? and a.duty_day=? and b.start_time<=? and b.end_time>?";
    db.query(sql_getpb,[group_id,duty_day,time,time],function(err,result){
        if(err) return cb('系统错误',null);
        if(result.length==0) return cb('该时间所属片区无人伤排班记录');
        obj=result[0];
        var name_phone_json=JSON.parse(obj.name_phone_json);
        var name_phone=getkey(name_phone_json);
        name_phone_json[name_phone]=name_phone_json[name_phone]+1;
        newpb_str=JSON.stringify(name_phone_json);
        ep.emit('get_ck_user',name_phone);
    });
    ep.once('get_ck_user',function(name_phone){
        var sql_getUser="select * from users where name_phone=? and frontrole in(3,13,123) and userstate=1;";
        db.query(sql_getUser,[name_phone],function(err,result){
            if(err) return cb('系统异常',null);
            if(result.length==0) return cb('该预约时间值班人伤专员'+name_phone+'权限发生变化或已离职',null);
            if(!result[0].jobNo) return cb('该预约时间值班人伤专员'+name_phone+'未维护工号',null);
            result[0].duty_rotser_id=obj.id;//取排班表id，回传
            result[0].newpb_str=newpb_str;//去排班更新的人的数量的str
            return cb(null,result[0]);
        });
    });
}
exports.paiban_rs=paiban_rs;
function paiban_ds(group_id,appointTime,cb){
    /*
     / 1,根据预约时间筛选出班次表的班次
     2,找到对应值班JSON对象，取出数值最小的查勘员姓名+手机号（唯一）
     3，取user表取出该查勘员，校验其真实性，并获取人的详情
     */
    var ep=new EventProxy();
    console.log('group_id,appointTime:',group_id,appointTime);
    var duty_day=hcUti.formatDate(new Date(appointTime),'yyyy-MM-dd');
    var time=hcUti.formatDate(new Date(appointTime),'hh:mm');
    var obj={};
    var newpb_str="";
    var sql_getpb="SELECT a.*,b.start_time,b.end_time FROM `duty_roster_ds` a LEFT JOIN `schedule` b " +
        "on (a.sche_id=b.id and b.she_class=2) where a.group_id=? and a.duty_day=? and b.start_time<=? and b.end_time>?";
    db.query(sql_getpb,[group_id,duty_day,time,time],function(err,result){
        if(err) return cb('系统错误',null);
        if(result.length==0) return cb('该时间所属片区无查勘定损排班记录');
        obj=result[0];
        var name_phone_json=JSON.parse(obj.name_phone_json);
        var name_phone=getkey(name_phone_json);
        name_phone_json[name_phone]=name_phone_json[name_phone]+1;
        newpb_str=JSON.stringify(name_phone_json);
        ep.emit('get_ck_user',name_phone);
    });
    ep.once('get_ck_user',function(name_phone){
        var sql_getUser="select * from users where name_phone=? and frontrole in(12,123) and userstate=1;";
        db.query(sql_getUser,[name_phone],function(err,result){
            if(err) return cb('系统异常',null);
            if(result.length==0) return cb('该预约时间值班查勘定损员'+name_phone+'权限发生变化或已离职',null);
            if(!result[0].jobNo) return cb('该预约时间值班查勘定损员'+name_phone+'未维护工号',null);
            result[0].duty_rotser_id=obj.id;//取排班表id，回传
            result[0].newpb_str=newpb_str;//去排班更新的人的数量的str
            return cb(null,result[0]);
        });
    });
}
exports.paiban_ds=paiban_ds;
/*
* GIS调度失败的案子，我们优服系统调度查勘员成功后需要回写GIS
*
* 可能用到的地方，1后台人工调度成功的案子 2 系统读到来着理赔的未调度成功的案子，优服
* 系统自行调度成功的
* */
function UpdateCaseSurveyorServlet(param,cb){
    var url=settings.server_name['updateCaseSurveyorServlet'];
    var ep=new EventProxy();
//    var record={
//        registno:'RDAA201832010000006853'
//        ,citycomcode:'320100'
//        ,surveyorname:'王辉'
//        ,surveyorcode:'32645685'
//        ,surveyorphone:'18771093957'
//    };
    var record={
        registno:param.registno
        ,citycomcode:param.citycomcode
        ,surveyorname:param.surveyorname
        ,surveyorcode:param.surveyorcode
        ,surveyorphone:param.surveyorphone
        ,scheduletype:param.scheduletype//1查勘 2 定损 3 人伤
    };
    var xmlObj={
        PACKET:{
            $:{"type": "REQUEST","version":"1.0"},
            requesthead:{
                user:'0502'
                ,request_type:'02250040'
                ,password:'63FEA80E-4B69-4121-A3D9-497E3B1C12D8'
                ,server_version:'00000000'
                ,sender:'0502'
                ,uuid:'F496658B-BA5C-41D9-947F-8638D9A8A2D6'
                ,flowintime:hcUti.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss')
            },
            BODY:{
                PRPLISSURVEYOR:{
                    REGISTNO:record.registno
                    ,CITYCOMCODE:record.citycomcode
                    ,SURVEYORNAME:record.surveyorname
                    ,SURVEYORCODE:record.surveyorcode
                    ,SURVEYORPHONE:record.surveyorphone
                    ,SCHEDULETYPE:record.scheduletype
                    //   ,VERSION:2
                     //   ,FAILURECAUSE:''
                }
            }
        }
    }
    var createtime=hcUti.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss');
    var xml_body = builder.buildObject(xmlObj).toString();
    var sql_insert_log="insert into callbackLogs (registno,createtime,sendContent,type) values (?,?,?,?);";
    var registno=record.registno;
    var sendContent=xml_body;
    var type="";
    if(record.scheduletype==1) type='查勘员回写';
    if(record.scheduletype==2) type='定损员回写';
    if(record.scheduletype==3) type='人伤员回写';
    var sql_params=[registno,createtime,sendContent,type];
    db.query(sql_insert_log,sql_params,function(err,result){
        if(err){
            console.log('err:',err);
            return cb(err,null);
        }else{
            var _id=result.insertId;
            ep.emit('cb',_id);
        }
    });
    ep.once('cb',function(d){
        console.log('xml_body:',xml_body);
        var f=new Buffer(xml_body);
        var b = iconv.encode(f,'gbk');
        console.log('in:',new Date().getTime());
        request({
            url: url, method: 'POST', body: b, headers: {
                "content-type": "application/xml;charset = gbk"
            },timeout:60000,encoding:null
        }, function (err, response, body) {
            console.log('err:', err);
            console.log('body:', body);
            console.log('out:',new Date().getTime());
            //var _str=JSON.stringify(body);
            var b1="";
                if(body){
                    b1= iconv.decode(body,'gbk');
                }else{
                    b1=err.code;
                }
                console.log('b1:',b1);
                var callbacktime=hcUti.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss');
                var sql_update="update callbackLogs set callbacktime=?,callbackContent=? where id=?;";
                db.query(sql_update,[callbacktime,b1,d],function(){
                    return cb(null,true)
                })
//                if(b1.toString().indexOf('<?xml')==-1) return ep.emit('updateGPS','fail');
//                var parseString = require('xml2js').parseString;
//                parseString(b1,{ explicitArray : false, ignoreAttrs : true }, function (_err, _result) {
//                    console.log(_err,_result)
//                    if(1){
//                        return ep.emit('updateGPS', 'success');
//                    }
//                    return ep.emit('updateGPS', 'success');
//                });


//            return ep.emit('updateGPS', 'fail');

        });
    });
}
exports.UpdateCaseSurveyorServlet=UpdateCaseSurveyorServlet;

function case_py(param,cb){
    var url=settings.server_name['JXMoniterServlet'];
    var ep=new EventProxy();
//    var record={
//        registNo:'RDAA201832010000006853'
//        ,addOperatorName:'王辉'
//        ,addDate:hcUti.formatDate(new Date(),'yyyy-MM-dd')
//        ,addTime:hcUti.formatDate(new Date(),'hh:mm:ss')
//        ,content:'中国人民财产保险股份有限公司南京市分公司调度员王辉 32645685 案件平移'
//    };
    var record={
        registNo:param.registno
        ,addOperatorName:param.realname
        ,addDate:hcUti.formatDate(new Date(),'yyyy-MM-dd')
        ,addTime:hcUti.formatDate(new Date(),'hh:mm:ss')
        ,content:param.content
    };
    var xmlObj={
        requestvo:{
            RequestHead:{
                requesttype:2
            },
            RequestBody:{
                registNo:record.registNo
                ,addOperatorName:record.addOperatorName
                ,addDate:record.addDate
                ,addTime:record.addTime
                ,content:record.content
                ,validFlag:1
            }
        }
    };
    var createtime=hcUti.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss');
    var xml_body = builder.buildObject(xmlObj).toString();
    console.log('xml_body:',xml_body);
    var sql_insert_log="insert into callbackLogs (registno,createtime,sendContent,type) values (?,?,?,?);";
    var registno=record.registNo;
    var sendContent=xml_body;
    var type="案件平移";
    var sql_params=[registno,createtime,sendContent,type];
    db.query(sql_insert_log,sql_params,function(err,result){
        if(err){
            console.log('err:',err);
            return cb(err,null);
        }else{
            var _id=result.insertId;
            ep.emit('cb',_id);
        }
    });
    ep.once('cb',function(d){
        var f=new Buffer(xml_body);
        var b = iconv.encode(f,'gbk');
        console.log('in:',new Date().getTime());
        request({
            url: url, method: 'POST', body: b, headers: {
                "content-type": "application/xml;charset = gbk"
            },timeout:6000,encoding:null
        }, function (err, response, body) {
            var b1="";
            if(body){
                b1= iconv.decode(body,'gbk');
            }else{
                b1=err.code;
            }
            console.log('b1:',b1);
            var callbacktime=hcUti.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss');
            var sql_update="update callbackLogs set callbacktime=?,callbackContent=? where id=?;";
            db.query(sql_update,[callbacktime,b1,d],function(){
                return cb(null,true)
            })
//                console.log('b1:',b1);
//                var parseString = require('xml2js').parseString;
//                parseString(b1,{ explicitArray : false, ignoreAttrs : true }, function (_err, _result) {
//                    console.log(_err,_result)
//                    if(_result.ResponseBody.message=='success'){
//                        return ep.emit('updateGPS', 'success');
//                    }
//                    return ep.emit('updateGPS', 'success');
//                });


        });
    });
}
exports.case_py=case_py;

var testParams={
         registno:'RDAA201832010000006853'
        ,citycomcode:'320100'
        ,surveyorname:'王辉'
        ,surveyorcode:'32645685'
        ,surveyorphone:'18771093957'
        ,scheduletype:1
}
var testPy={
    registno:'RDAA201832010000006853'
    ,realname:'王辉'
    ,content:'中国人民财产保险股份有限公司南京市分公司调度员王辉 32645685 案件平移'
};
//exports.case_py(testPy,function(err,result){
//    console.log(err,result);
//});
//exports.UpdateCaseSurveyorServlet(testParams,function(err,result){
//    console.log(err,result);
//});