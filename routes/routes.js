(function () {
    var manageSystemRoute, wechatRoute
    manageSystemRoute = require('../api/ManageSystem/route');
    module.exports = function (app) {
        app.use('/api/ManageSystem', manageSystemRoute);
    };
}).call(this);
