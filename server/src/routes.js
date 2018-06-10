module.exports = (app, io) => {
  app.get('/', function(req, res){
    res.send('home');
  });
};



