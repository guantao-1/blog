var mongoose = require('./connection');

var replySchema = new mongoose.Schema({
    content:String,
    time:String,
    username:String,
    id:String
});

var Reply = mongoose.model('reply',replySchema);

module.exports = Reply;