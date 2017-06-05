/**
 * Created by ruiwang on 2017/6/2.
 */
var fs=require('fs');
fs.readFile(__dirname+"./test.js","utf8",function(err,data){
    console.log(data);
    if(err){
        console.log(err);
    }
})   //有点问题,先不急着使用