var express = require('express');
var fs = require('fs');
var router = express.Router();
var multer = require('multer');

var User = require('../modules/db/user');

// 文件上传的路径
var uploadpath = './public/imgs/';
var headername;
// 文件存储引擎
var stroage = multer.diskStorage({
    // 设置文件上传的路劲
    // destination:uploadpath
    destination:function(req,file,cb){
        cb(null, uploadpath);
    },
    // 自定义文件名，如果没有设置文件名，文件上传之后，默认保存的是一个随机名命名的二进制文件，没有扩展名
    filename:function(req,file,cb){
        console.log('文件命名---------------------------');
        console.log(file);
        // { fieldname: 'myfiles',      input标签的name属性值
        // originalname: 'timg.jpg',    文件的原始名字
        // encoding: '7bit',            文件的编码格式
        // mimetype: 'image/jpeg'       文件的mime类型
        // }
        var arr = file.originalname.split('.')
        var ext = arr[arr.length-1];
        // 姓名-时间.后缀
        headername = req.session.user.username+'-'+Date.now()+'.'+ext;
        console.log(headername);
        cb(null, headername);
    }
});

var upload = multer({
    storage:stroage,
    limits:{
        // 文件大小限制
        fileSize:1024*1024*10
    },
    // 文件的筛选：决定哪些文件可上传，哪些文件跳过
    fileFilter:function(req,file,cb){
        if (file.mimetype.startsWith('image')) {
            cb(null, true);//是图片接收
        } else {
            // cb(null, false);
            cb('只能上传图片', false);//拒绝这个文件
        }
    }
});

router.post('/upload/header',upload.single('headerimg'),(req,res)=>{
    console.log('=====================================');
    // console.log(req.file);
    console.log('旧头像：'+req.session.user.headerurl);
    // 新头像的url地址
    var headerurl = '/imgs/'+headername;
    console.log('新头像：'+headerurl);
    if (fs.existsSync(uploadpath+headername)) {
        User.findOne({_id:req.session.user._id},(err,user)=>{
            console.log(user.headerurl)
            // 从数据库获取用户的信息，把旧的头像url拿出来，删除旧头像，存入新头像url
            if (user.headerurl != '/imgs/timg.jpg') {//排除掉默认头像，不能删默认的头像
                fs.unlinkSync('./public'+user.headerurl);
            }
            // 更新数据中headerurl
            user.headerurl = headerurl;
            user.save(()=>{
                // 更新session中headerurl
                req.session.user.headerurl = headerurl;
                res.redirect('/')
            });
        });
    } else {
        res.send('上传失败');
    }
    

    
});

module.exports = router;