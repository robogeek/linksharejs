
/*
 * GET home page.
 */

var linkshare = require('../../../index.js');
linkshare.setup('a8e693be349ad1a8496dc9cd6706cab929685238ec637585823d69615c4787e8');

exports.index = function(req, res){
  res.render('index', { title: 'Linkshare JS', data: {} });
};

exports.doPost = function(req, res) {
  var params = {};
  
  if (req.body.keyword    && req.body.keyword    !== "") params.keyword    = req.body.keyword; 
  if (req.body.category   && req.body.category   !== "") params.category   = req.body.category; 
  if (req.body.sort       && req.body.sort       !== "") params.sort       = req.body.sort; 
  if (req.body.sorttype   && req.body.sorttype   !== "") params.sorttype   = req.body.sorttype; 
  if (req.body.MaxResults && req.body.MaxResults !== "") params.MaxResults = req.body.MaxResults; 
  if (req.body.pagenumber && req.body.pagenumber !== "") params.pagenumber = req.body.pagenumber; 
  if (req.body.mid        && req.body.mid        !== "") params.mid        = req.body.mid;
  
  linkshare.query(params, function(err, data) {
    if (err) {
      util.log(util.inspect(err));
    } else {
      res.render('index.ejs', {
        title: 'Linkshare JS',
        data: data
      });
    }
  });
}