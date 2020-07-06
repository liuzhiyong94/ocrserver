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
        }
        ,4042: {
            name: 'code error',
            message: '验证码错误'
        }
        ,4043: {
            name: 'login error',
            message: '账号密码错误超过3次，请5分钟后再试'
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
        50001: {
            name: 'interface error',
            message: '接口错误'
        },
        500011: {
            name: 'no login',
            message: '未登录用户'
        },
        50002: {
            name: 'sign error',
            message: '签名错误'
        },
        50003: {
            name: 'data error',
            message: '数据异常'
        },
        50006: {
            name: 'no login',
            message: '未登录'
        },
        50007: {
            name: 'data error',
            message: '姓名重复'
        },
        50008: {
            name: 'data error',
            message: '用户名或工号重复'
        },
        50009: {
            name: 'data error',
            message: '工号重复'
        },
        50010: {
            name: 'data error',
            message: '电话号码重复'
        },
        50011: {
            name: 'data error',
            message: '机构名重复'
        },
        50012: {
            name: 'data error',
            message: '机构代码重复'
        },
        50013: {
            name: 'data error',
            message: '设备名称重复'
        },
        50014: {
            name: 'data error',
            message: '用户名称重复'
        },
        50015: {
            name: 'data error',
            message: '该机构下存在人员/任务数据，无法删除！'
        },
        50016: {
            name: 'data error',
            message: '该省级机构已经分配了下属机构，不能删除'
        },
        60001: {
            name: 'data error',
            message: '原密码输入错误'
        },
        60002: {
            name: 'data error',
            message: '查询任务数据为空，不能进行操作，请重新刷新页面'
        },
        60003: {
            name: 'data error',
            message: '查询平移指定人员数据为空，不能进行操作，请重新刷新页面'
        },
        60004: {
            name: 'data error',
            message: '查询平移指定人员数据为空，不能进行操作，请重新刷新页面'
        },
        60005: {
            name: 'data error',
            message: '平移任务已经被处理，不能进行操作，请重新刷新页面'
        },
        60006: {
            name: 'data error',
            message: '当前选择的区域内排班班次表数据为空'
        },
        60007: {
            name: 'data error',
            message: '等待平移中，无法再次平移'
        },
        60008: {
            name: 'data error',
            message: '待查勘或者待定损案件才能进行平移操作'
        },
        70001: {
            name: 'data error',
            message: '定损点名称或送修码已存在'
        },
        80008: {
            name: 'data error',
            message: '经营单位名称重复'
        },
        80009: {
            name: 'data error',
            message: '当前没有待领取任务'
        },
        80010: {
            name: 'data error',
            message: '查询数据为空，请刷新页面'
        },
        80011: {
            name: 'data error',
            message: '当前没有待领取任务'
        },
        80012: {
            name: 'data error',
            message: '任务状态不能进行此操作，请刷新页面'
        },
        80013: {
            name: 'data error',
            message: '派发给的人和已有人员相同'
        },
        80014: {
            name: 'data error',
            message: '查询账号信息失败，请重新登录'
        },
        80015: {
            name: 'data error',
            message: '账号没有操作权限，请重新登录'
        },
        80016: {
            name: 'data error',
            message: '已有重开的任务未完成，不能重开'
        },
        80017: {
            name: 'data error',
            message: '查询数据为空'
        },
        90001: {
            name: 'data error',
            message: '您不是初审员，无法进行初审操作'
        },
        90002: {
            name: 'data error',
            message: '当前没有待初审任务可领取'
        },
        90003: {
            name: 'data error',
            message: '当前没有待复审任务可领取'
        },
        90004: {
            name: 'data error',
            message: '您不是复审员，无法进行复审操作'
        },
        90005: {
            name: 'data error',
            message: '入口名称重复，请重新输入'
        },
        90006: {
            name: 'data error',
            message: '身份证号重复，请重新输入'
        },
        90007: {
            name: 'data error',
            message: '该工作人员有未决案件，不能删除'
        },
        90008: {
            name: 'data error',
            message: '该角色已存在，请重新选择角色'
        },
        90009: {
            name: 'data error',
            message: '该渠道已存在'
        },
    };

    module.exports = errors;

}).call(this);