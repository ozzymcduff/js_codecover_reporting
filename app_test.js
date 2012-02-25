var Handler = require('./app.js').Handler
    , testCase  = require('nodeunit').testCase;

var diff = require('diff');
function mapLineNumbers(changes){
    //console.log(reportDiff(changes));
    var linenum = 0, change, lines, map = [], j, total;
    for ( var i = 0; i < changes.length; i++) {
      change = changes[i];
      lines = change.value.split(/^/m);
  
      if (change.added) {
        for ( j=0; j<lines.length;j++){
            map.push(null);
        }
      } else if (change.removed) {
        linenum += lines.length;    
      }else{
        for ( j=0; j<lines.length;j++){
            map.push(j+linenum);
        }
        linenum += lines.length;
      }
      total += lines.length;
    }
    return map;
}
function reportDiff(changes){
  var change, lines, ret=[];
    for ( var i = 0; i < changes.length; i++) {
      change = changes[i];
      lines = change.value.split(/^/m);

      if (change.added) {
        ret.push("+");
      } else if (change.removed) {
        ret.push("-");
      }else{
        ret.push("=");
      }
      ret.push(lines);
    }
    return ret;
}
function remap(report,numberOfLines){
    var v = report.slice(1);
    var len = v.length;
    for (var i=0;i<numberOfLines-len;i++){
        v.push(null);
    }
    return v;
}
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
        },
        "Can handle request to static client.js": function(test) {
            var app = new Handler({
                fs:{
                    readFile : function(filePath, callback){
                        test.equal(filePath,'./static/js/client.js');
                        callback(null,'filecontent');
                    }
                },
                exec:function(){
                    throw new Error('exec!');
                },
                path:{
                    extname:function(){ return '.js'; },
                    exists:function(filePath,callback){ 
                        test.equal(filePath,'./static/js/client.js');
                        callback(true);
                    }
                },
                debug:function(){}
            });
            var req = {
                url:'/js/client.js'
            };
            var res = {
                writeHead:function(code, data){
                    test.equal(code,200);
                    test.deepEqual(data,{"Content-Type":"text/javascript"});
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
    }),
    "Using diff to calculate map of line numbers":testCase({
        "deletion":function(test){
            var map = mapLineNumbers(diff.diffLines("1\n2\n3","2\n3"));
            test.deepEqual(map,[1,2]);
            test.done();
        },
        "adding":function(test){
            var map = mapLineNumbers(diff.diffLines("2\n3","1\n2\n3"));
            test.deepEqual(map,[null,0,1]);
            test.done();
        },
        "delete after":function(test){
            //
            var map = mapLineNumbers(diff.diffLines("1\n2\n3","1\n2\n"));
            test.deepEqual(map,[0,1]);
            test.done();
        }
    }),
    "Mapping stat from run to line numbers":testCase({
        "Sample response":function(test){
            var response = { 'client.js': [ null, 1, 0 ] };
            var clientjs = "function test(){\n"+ // line 1
            "    console.log('1');\n"+
            "}\n"; // line 3, not important
            
            test.deepEqual(remap(response['client.js'],3), [1,0,null]);
            test.done();
        }
    })
});