var artTem = require('art-template');
var artTemRenderEngine = require('express-art-template');

// artTem.defaults
// artTemEngine.template.defaults
// console.log(artTemRenderEngine.template === artTem);//true

// 设置模板文件的目录
artTem.defaults.root = './views';
// 修改模板文件的后缀名
artTem.defaults.extname = '.html';


function artTemEngine(app){
    // 设置渲染模板的引擎
    app.engine('html',artTemRenderEngine);
    // 辅助在调用render函数是 不再添加 .html 后缀
    app.set('view engine','html');
}

module.exports = artTemEngine;