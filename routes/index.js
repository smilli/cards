
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Cards Against Humanity' });
};

exports.game = function(req, res){
  res.render('game', {title: 'Game'});
};