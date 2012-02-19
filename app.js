(function(undefined){
function handler (req, res) {
    console.log('request starting...');
     
    var filePath;
    if (req.url == '/'){
        filePath = './static/index.html';
    }else{
        filePath = './static'+ req.url;
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
                console.log('sending file');
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
                console.log('file not found '+filePath);
                res.writeHead(404);
                res.end();
            }
        });
    }
}

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path');

app.listen(8081);

io.sockets.on('connection', function (socket) {
  socket.emit('server_starting', {});
  socket.on('client_connected', function (data) {
    console.log('client connected');
    console.log(data);
  });
  socket.on('coverage', function (data){
    console.log(data);
  });
});

var sys = require('sys'),
    exec = require('child_process').exec;
fs.readdir('./static/js', function(err, files){
    for (var file in files){
        watchJsFile(files[file]);
    }
});
function jsFileChanged (curr, prev) {
    if (curr.mtime.getTime() !== prev.mtime.getTime()) {
        function puts(error, stdout, stderr) { sys.puts(stdout); }
        console.log('file changed');
        exec("jscoverage --no-highlight static/js ./static/js_cover/", puts);
    }
}
function watchJsFile(file){
    fs.watchFile('./static/js/'+file, jsFileChanged);
}
})();