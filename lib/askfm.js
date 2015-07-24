'use strict';

var request = require('request');

function Askfm(account) {
  this.account = account || "EzoeRyou";
  this.baseUrl = "http://ask.fm/";
  this.rssUrl = this.baseUrl + "feed/profile/" + this.account + ".rss";
}

Askfm.prototype.getRss = function(callback) {
  request(this.rssUrl, function(err, res, body) {
    if (!err && res.statusCode === 200) {
      callback(body);
    }
  });
}

Askfm.prototype.postQuestion = function(callback) {

}

module.exports = Askfm;
