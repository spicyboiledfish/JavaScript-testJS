/**
 * Created by ruiwang on 2017/6/2.
 */
var fs=require('fs');
fs.readFile("./test.js","utf8",function(err,data){
    console.log(data);
    if(err){
        console.log(err);
    }
})