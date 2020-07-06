/**
 * Created by zhou on 2014/5/4.
 * 武汉人保服务器平台错误描述类
 * @example 如何在项目中使用错误信息
 * 返回参数非法错误信息 errors.IllegalArgument
 */
var errors = {
    LackArgument : {
        name: 'LackArgument',
        message: '参数缺失'
    },
    submitNull: {
        name: 'submitNull',
        message: '参数缺失'
    },
    NoLogin: {
        name: 'NoLogin',
        message: '未登录用户'
    },
    NoInterface: {
        name: 'NoInterface',
        message: '不存在的接口'
    },
    DuplicateUser: {
        name: 'DuplicateUser',
        message: '用户名重复'
    },
    WrongLogin: {
        name: 'WrongLogin',
        message: '用户名或密码有误'
    },
    WrongPassWord: {
        name: 'WrongPassWord',
        message: '用户原始密码错误'
    }
};
module.exports = errors;
//# sourceMappingURL=errors.js.map