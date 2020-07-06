(function () {
    var errors;
    errors = {
        200: {
            name: 'success',
            message: ''
        },
        201: {
            name: 'fail',
            message: '数据更改失败'
        },
        404: {
            name: 'service error',
            message: '服务异常'
        },
        400020: {
            name: 'token',
            message: 'token 错误'
        },
        400021: {
            name: 'token',
            message: 'token 过期'
        },
        40001: {
            name: 'login error',
            message: '用户名或密码有误'
        },
        40002: {
            name: 'miss parameter',
            message: '缺乏参数'
        },
        40003: {
            name: 'error parameter',
            message: '参数错误'
        },
        40004: {
            name: 'login error',
            message: '原密码错误，请重新输入'
        },
        50001: {
            name: 'interface error',
            message: '接口错误'
        },
        500011: {
            name: 'no login',
            message: '未登录用户'
        },
        50010: {
            name: 'data error',
            message: '名称或代码重复'
        },
        50012: {
            name: 'data error',
            message: '名称重复'
        },
        50002: {
            name: 'sign error',
            message: '签名错误'
        },
        50003: {
            name: 'data error',
            message: '数据异常'
        },
        50004: {
            name: 'data error',
            message: '人员信息为空，请刷新页面重新登录'
        },
        50005: {
            name: 'data error',
            message: '人员非正常状态'
        },
        50006: {
            name: 'data error',
            message: '人员权限错误，不能操作'
        },
        50007: {
            name: 'data error',
            message: '用户名或工号重复'
        },
        50015: {
            name: 'data error',
            message: '该机构下存在子机构，无法删除！'
        },
        50016: {
            name: 'data error',
            message: '该机构下存在人员数据，无法删除！'
        },
        60001: {
            name: 'data error',
            message: '地址不正确，无法找到对应的区级'
        },
        60002: {
            name: 'data error',
            message: '新增抢单任务失败'
        },
        60003: {
            name: 'data error',
            message: '当前上班状态的查勘员信息为空'
        },
        60004: {
            name: 'data error',
            message: '推送失败'
        },
        60005: {
            name: 'data error',
            message: '目前查勘/查勘定损有任务,不能停用'
        },
        60006: {
            name: 'data error',
            message: '当月只可修改一次绩效规则参数'
        }
    };

    module.exports = errors;

}).call(this);