var hapi = require('hapi');
var request_http = require('request');
var Path = require('path');

var port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8800;

var options = {
    cors: {
        origin: ["http://localhost:*"],
        headers: ["Authorization"]
    },
    files: {
        relativeTo: Path.join(__dirname, 'public')
    },
    views: {
        engines: {
            html: require('handlebars')
        },
        basePath: __dirname,
        path: './views'
    }
};

var server = new hapi.Server(port, options);

//Initial view
server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply.view('index');
    }
});

server.route({
    method: 'GET',
    path: '/app',
    handler: function(request, reply) {
        reply.view('app');
    }
});

//Serve public files
server.route({
    method: 'GET',
    path: '/{filename*}',
    handler: {
        file: function(request) {
            return request.params.filename;
        }
    }
});

server.start(function() {
    console.log("Hapi server started @ " + server.info.uri);
});
