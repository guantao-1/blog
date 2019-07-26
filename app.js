var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var md5 = require('md5');
const path = require('path');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var artTmpEngine = require('./modules/art-tem-config');
artTmpEngine(app);

var User = require('./modules/db/user');
var tools = require('./modules/tools');
var Reply = require('./modules/db/reply');
var Message = require('./modules/db/message');

var flash = require('connect-flash');
app.use(flash());

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    //添加session的配置信息
    secret: 'mylogin',
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    },
    store: new MongoStore({
        url: 'mongodb://127.0.0.1/blog'
    })
}));

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.error = req.flash('error').toString();
    next();
});

// 首页
app.get('/', (req, res) => {
    var page = (req.query.page || 1) * 1;
    // 每页要显示几条信息
    var show_count = 5;
    Message
        .find()
        .skip((page - 1) * show_count)
        .limit(show_count)
        .sort({ page: 1 })
        .populate('author')
        .exec((err, data) => {
            var msgs = JSON.parse(JSON.stringify(data));
            Message.countDocuments((err, count) => {
                // 所有的页数
                var allPages = Math.ceil(count / show_count);
                res.render('index', {
                    msgs: msgs.reverse(),
                    page,
                    allPages,
                    show_count
                });
            });
        });
});

// 注册
app.get('/regist', (req, res) => {
    res.render('regist');
});
app.post('/regist', (req, res) => {
    User.findOne({ username: req.body.username }, (err, data) => {
        if (data) {
            req.flash('error', '用户名已被抢注');
            res.redirect('/regist')
        } else {
            req.body.password = md5(req.body.password);
            Object.assign(req.body,{
                // 默认的头像url路径
                headerurl:'/imgs/timg.jpg'
            });
            var user = new User(req.body);
            // console.log(user);
            user.save(err => {
                res.redirect('/login');
            });
        }
    });
});

// 登录
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (!user) {
            req.flash('error', '用户名不存在');
            res.redirect('/login');
        } else {
            if (md5(req.body.password) == user.password) {
                req.session.user = user;
                res.redirect('/');
            } else {
                req.flash('error', '密码错误');
                res.redirect('/login');
            }
        }
    });
});
// 退出登录
app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
});
// 跳转到存档
app.get('/cundang', (req, res) => {
    res.render('cundang');
});
// 跳转到标签
app.get('/tab', (req, res) => {
    res.render('tab');
});
// 跳转到发布页面
app.get('/release', (req, res) => {
    res.render('release');
});

// 发布
app.post('/release', (req, res) => {
    if (req.session.user) {
        // 把获取到的内容存到数据库
        var m = new Message({
            username: req.session.user.username,
            msg: req.body.msg,
            title: req.body.title,
            // label1: req.body.label1,
            // label2: req.body.label2,
            // label3: req.body.label3,
            label: req.body.lab,
            time: tools.dateFormat(new Date()),
            reples: []
        });
        m.save((err) => {
            if (err) {
                res.send('留言失败');
            } else {
                res.redirect('/');
            }
        });
    } else {
        req.flash('error', '未登录，无法留言')
        res.redirect('/login')
    }
});


// 跳转到详情页面
app.get('/details', (req, res) => {
    console.log(req.query._id)
    Message.find({ _id: req.query._id }, (err, data) => {
        // console.log(data[0].count);
        Message.updateOne({ _id: req.query._id }, { count: data[0].count + 1 }, (err, data) => {

            Message.findOne({ _id: req.query._id }).populate('reples').exec((err, data) => {
                data = JSON.parse(JSON.stringify(data))
                res.render('details.html', { data });
            })
        })
    })
});

// 评论：
app.post('/add/reply', (req, res) => {
    // 1.先保存回复的消息
    var reply = new Reply({
        content: req.body.content,
        time: tools.dateFormat(new Date()),
        username: req.session.user.username,
        id: req.body._id
    });
    reply.save(err => {
        Message.findOne({ _id: tools.idFormat(req.body._id) }, (err, msg) => {
            msg.reples.push(reply._id);
            // console.log(msg)
            // console.log(req.body._id)
            // console.log(tools.idFormat(req.body._id))
            msg.save(err => {
                res.redirect('/details/?_id=' + req.body._id);
            });
        });
    });
});



// 编辑
app.get('/edit', (req, res) => {
    Message.findOne({ _id: req.query._id }, (err, data) => {
        var data = JSON.parse(JSON.stringify(data));
        res.render('edit.html', data);
    });
});
app.post('/edit', (req, res) => {
    Message.updateOne({ _id: req.body._id }, {
        msg: req.body.msg,
        title: req.body.title,
        label: req.body.lab,
        time: tools.dateFormat(new Date()),
    }, err => {
        res.redirect('/');
    });
});

// 删除
app.get('/delete', (req, res) => {
    Message.findByIdAndDelete({ _id: req.query._id }, err => {
        if (err) {
            res.send('删除失败');
        } else {
            res.redirect('/');
        }
    });
});

// 存档
app.get('/cd', (req, res) => {
    Message
        .find()
        .exec((err, data) => {
            // console.log(data)
            data = JSON.parse(JSON.stringify(data))
            res.render('cundang', { data })
        })
})

// 标签
app.get('/tabs', (req, res) => {
    var arr = []
    Message
        .find()
        .exec((err, data) => {
            console.log(data)
            data.forEach((msg) => {
                msg.label.forEach(msg => {
                    // 空标签去除
                    if (msg !== '') {
                        arr.push(msg)
                    }
                })
            })
            var item = tools.arrFormat(arr)
            res.render('tags', { item })
        })
})
//作者名查找（author）
app.get('/authors', (req, res) => {
    Message.find({ username: req.query.value }, (err, msgs) => {
        res.render('author', { msgs: msgs });
    });
});

// 标签查找
app.get('/biaoqian', (req, res) => {
    Message.find({ label: req.query.value }, (err, msgs) => {
        res.render('labelsearch', { msgs: msgs });
    });
});

// 搜索框搜索
app.get('/search', (req, res) => {
    Message.find({
        $or: [
            { title: { $regex: req.query.search,$options:'$i' } },
            { username: { $regex: req.query.search,$options:'$i' } },
            { tag: { $regex: req.query.search,$options:'$i' } },
            { msg: { $regex: req.query.search,$options:'$i' } }
        ]
    }).exec((err, msgs) => {
        res.render('search', { msgs })
        console.log(msgs)
    })

})
// 头像
var uploadRouter = require('./router/upload');
app.use(uploadRouter);

// 编辑用户信息
app.get('/edit/userinfo',(req,res)=>{
    res.render('userinfo');
});
app.post('/edit/userinfo',(req,res)=>{
    res.send('xxx');
});

// 编辑用户头像
app.get('/edit/user/header/:name',(req,res)=>{
    res.render('edit-headerimg');
});

app.listen(3000, () => {
    console.log('node running');
});
