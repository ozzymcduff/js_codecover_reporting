var Handler = require('./app.js').Handler;
var app = new Handler();

var server = require('http').createServer(app.handle)
  , io = require('socket.io').listen(server)
  , fs = require('fs');

server.listen(8081);

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

fs.readdir('./static/js', function(err, files){
    for (var file in files){
        app.watchJsFile(files[file]);
    }
});
