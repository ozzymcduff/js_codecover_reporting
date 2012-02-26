
exports.Handler = function(conf){// supposed to be a singleton
    var self = this;
    conf = conf || {};
    var fs = conf.fs || require('fs');
    var path = conf.path || require('path');
    var sys = conf.sys || require('util');

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
    
    var exec = conf.exec || require('child_process').exec;
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
exports.mapLineNumbers = function(changes){
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
};
exports.reportDiff = function(changes){
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
};
exports.remap = function(report,numberOfLines){
    var v = report.slice(1);
    var len = v.length;
    for (var i=0;i<numberOfLines-len;i++){
        v.push(null);
    }
    return v;
};

