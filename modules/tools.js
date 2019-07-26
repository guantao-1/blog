// 时间格式化
function dateFormat(date) {
    var d = null;
    if (date instanceof Date) {
        d = date;
    } else {
        if (typeof date == "number" || typeof date == "string") {
            d = new Date(date);
        } else {
            console.log('你输入的值有误 请重新输入')
        }
    }
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();

    var hours = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();

    function  retuen(r) {
        if(r<10){
          return   r ='0'+ r;
        }else{
            return r;
        }
    }
    m=retuen(m);
    day=retuen(day);
    hours=retuen(hours);
    minute=retuen(minute);
    return `${y}年${m}月${day}日 ${hours}:${minute}`
}

// //ip地址
// function ipFormat(str){
//     // ::ffff:127.0.0.1
//     var reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
//     var arr = reg.exec(str);
//     return arr[0];
// }

// id的处理
function idFormat(id) {
    return id.replace(/\"/g,'');
}
// //标签处理
function arrFormat(arr){
    return Array.from(new Set(arr))
}

module.exports = {
    dateFormat,
    // ipFormat,
    arrFormat,
    idFormat
    
};