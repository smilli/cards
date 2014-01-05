
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , gameServer = require('./lib/game-server');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(errorHandler);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function findGame(req, res, next){
  var roomId = parseInt(req.params.roomId);
  if (!isNaN(roomId) && gameServer.validRoom(roomId)) return next();
  next(new Error('That room does not exist'));
}

function errorHandler(err, req, res, next){
  console.log(err);
  res.end();
}

app.get('/', routes.index);
app.post('/addGame', gameServer.createNewRoom);
app.get('/:roomId', findGame, routes.game); 


var server = http.createServer(app);
gameServer.listen(server);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
