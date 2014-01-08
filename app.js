 
/**
 * Module dependencies.
 */

var express = require('express')
  , MemoryStore = express.session.MemoryStore
  , sessionStore = new MemoryStore()
  , cookieParser = express.cookieParser(process.env.SESSION_SECRET)
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
app.use(cookieParser);
app.use(express.session({
  store: sessionStore,
  cookie: {maxAge: 1000 * 60 * 3}
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// app.use(errorHandler);

function errorHandler(err, req, res, next){
  console.log(err);
  res.end();
}

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/addGame', gameServer.createNewRoom);
app.get('/:roomId', findGame, routes.game); 

function findGame(req, res, next){
  var roomId = parseInt(req.params.roomId);
  if (!isNaN(roomId) && gameServer.validRoom(roomId)) return next();
  next(new Error('That room does not exist'));
}

var server = http.createServer(app);
gameServer.listen(server, sessionStore, cookieParser);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
