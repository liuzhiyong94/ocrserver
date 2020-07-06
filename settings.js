(function () {
    module.exports = {
        cookie_secret: 'secret_meteoric',
        serverPort: 3000,
        privateKey: 'hcxwwhrb2019',
        mysql: {
            database: 'shrbcarinsurance',
            host: '192.168.1.35',
            user: 'root',
            password: '123456',
            port: 3306,
            connectionLimit: 120,
            multipleStatements: true
        },
        imageUrl: 'http://192.168.1.19:3000/uploadocr/', // 上传路径
        initDataDiskUrl: "G:/Git/ocrserver/web/initdata",    //初始json文件磁盘位置
        initDataUrl: "http://192.168.1.19:3000/initdata/",    //初始json文件服务器位置
        modifyDataDiskUrl: "G:/Git/ocrserver/web/modifydata",    //修改后json文件磁盘位置
        modifyDataUrl: "http://192.168.1.19:3000/modifydata/"    //修改后json文件服务器位置
    };
}).call(this);
