var mongoose = require('./connection');

var userSchema = new mongoose.Schema({
    username:String,
    password:String,
    headerurl:String,   //头像的url
    mailbox:String
});

var User = mongoose.model('user',userSchema);

module.exports = User;