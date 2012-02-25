
exports.Handler = function(conf){
    var self = this;
    conf = conf || {};
    var fs = conf.fs || require('fs');
    var path = conf.path || require('path');
    var sys = conf.sys || require('sys');
    var exec = conf.exec || require('child_process').exe;
    var parseuri = conf.parseuri || require('./parseuri.js').parseUri;
    var debug = conf.debug || function(info){ console.log(info); };
    this.handle = function (req, res) {
        debug('request starting...');
        
        var filePath;
        var uri = parseuri(req.url);
        if (uri.path === '/'){
            filePath = './static/index.html';
        }else{
            filePath = './static'+ uri.path;
        }
        var extname = path.extname(filePath);
          var contentType = 'text/html';
          switch (extname) {
              case '.js':
                  contentType = 'text/javascript';
                  break;
              case '.css':
                  contentType = 'text/css';
                  break;
        }
        if (filePath){
            path.exists(filePath, function(exists) {
                if (exists) {
                    debug('sending file');
                    fs.readFile(filePath, function(error, content) {
                        if (error) {
                            res.writeHead(500);
                            res.end();
                        }
                        else {
                            res.writeHead(200, { 'Content-Type': contentType });
                            res.end(content, 'utf-8');
                        }
                    });
                }
                else {
                    debug('file not found '+filePath);
                    res.writeHead(404);
                    res.end();
                }
            });
        }
    };
    
    this.jsFileChanged = function(curr, prev) {
        if (curr.mtime.getTime() !== prev.mtime.getTime()) {
            debug('file changed');
            exec("jscoverage --no-highlight static/js ./static/js_cover/",
                function (error, stdout, stderr) { 
                    sys.puts(stdout);
                });
        }
    };

    this.watchJsFile = function(file){
        fs.watchFile('./static/js/'+file, self.jsFileChanged);
    };
};

