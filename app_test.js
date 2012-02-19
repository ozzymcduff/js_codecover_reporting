var Handler = require('./app.js').Handler
    , testCase  = require('nodeunit').testCase;

module.exports = testCase({
    "serving web pages":testCase({ 
        // making sure I dont break something when changing stuff
        // happy path for now
        "Can handle request to root": function(test) {
            var app = new Handler({
                fs:{
                    readFile : function(filePath, callback){
                        test.equal(filePath,'./static/index.html');
                        callback(null,'filecontent');
                    }
                },
                exec:function(){
                    throw new Error('exec!');
                },
                path:{
                    extname:function(){ return '.html'; },
                    exists:function(filePath,callback){ 
                        test.equal(filePath,'./static/index.html');
                        callback(true);
                    }
                },
                debug:function(){}
            });
            var req = {
                url:'/'
            };
            var res = {
                writeHead:function(code, data){
                    test.equal(code,200);
                    test.deepEqual(data,{"Content-Type":"text/html"});
                },
                end:function(content, contenttype){
                    test.equal(content,'filecontent');
                    test.equal(contenttype,'utf-8');
                }
            };
            app.handle(req,res);
            test.expect(6);
            test.done();
        }
    })
});