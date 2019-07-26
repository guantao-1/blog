// 负责创建表 及 表的操作模型
var mongoose = require('./connection');


var msgSchema = new mongoose.Schema({
    username:String,
    title:String,
    time:String,
    // label1:String,
    // label2:String,
    // label3:String,
    label:Array,
    msg:String,
    count:{type:Number,default:0},
    reples:[ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'reply'
        }
    ]
});

var Message = mongoose.model('msg',msgSchema)


module.exports = Message;
