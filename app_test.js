//#! mocha
var app = require('./app.js');
var Handler = app.Handler;
var should = require('should');
var diff = require('diff');

describe("serving web pages", function(){
  it("can handle request to root", function(done){
        // making sure I dont break something when changing stuff
        // happy path for now
        var app = new Handler({
            fs:{
                readFile : function(filePath, callback){
                    filePath.should.equal('./static/index.html');
                    callback(null,'filecontent');
                }
            },
            exec:function(){
                throw new Error('exec!');
            },
            path:{
                extname:function(){ return '.html'; },
                exists:function(filePath,callback){ 
                    filePath.should.equal('./static/index.html');
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
                code.should.equal(200);
                data.should.eql({"Content-Type":"text/html"});
            },
            end:function(content, contenttype){
                content.should.equal('filecontent');
                contenttype.should.equal('utf-8');
            }
        };
        app.handle(req,res);
        done();
    });
    it("can handle request to static client.js", function(done){
        var app = new Handler({
        fs:{
            readFile : function(filePath, callback){
                filePath.should.equal('./static/js/client.js');
                callback(null,'filecontent');
            }
        },
        exec:function(){
            throw new Error('exec!');
        },
        path:{
            extname:function(){ return '.js'; },
            exists:function(filePath,callback){ 
                filePath.should.equal('./static/js/client.js');
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
                code.should.equal(200);
                data.should.eql({"Content-Type":"text/javascript"});
            },
            end:function(content, contenttype){
                content.should.equal('filecontent');
                contenttype.should.equal('utf-8');
            }
        };
        app.handle(req,res);
        done();
    });
});
describe("map line numbers from diff report", function(){
    it("can map content deletion in the start", function(done){
        var map = app.mapLineNumbers(diff.diffLines("1\n2\n3","2\n3"));
        map.should.eql([1,2]);
        done();
    });
    it("can map when adding lines", function(done){
        var map = app.mapLineNumbers(diff.diffLines("2\n3","1\n2\n3"));
        map.should.eql([null,0,1]);
        done();
    });
    it("can map content deletion in the end", function(done){
        var map = app.mapLineNumbers(diff.diffLines("1\n2\n3","1\n2\n"));
        map.should.eql([0,1]);
        done();
    });
});
describe("mapping stat from run to line numbers", function(){
    it("sample response", function(done){
        var response = { 'client.js': [ null, 1, 0 ] };
        var clientjs = "function test(){\n"+ // line 1
        "    console.log('1');\n"+
        "}\n"; // line 3, not important
    
        app.remap(response['client.js'],3).should.eql( [1,0,null]);
        done();
    });
});
