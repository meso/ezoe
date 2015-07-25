'use strict';

var fs = require('fs');
var request = require('request');
var FileCookieStore = require('tough-cookie-filestore');
var cheerio = require('cheerio');
var homeDir = require('os-homedir');

function Askfm(account) {
  this.account = account;
  this.baseUrl = 'http://ask.fm/';

  var path = homeDir() + '/.askfm-cokkies.json'
  fs.closeSync(fs.openSync(path, 'a'));
  var j = request.jar(new FileCookieStore(path));
  request = request.defaults({jar: j, baseUrl: this.baseUrl});
}

Askfm.prototype.getRss = function(callback) {
  request('/feed/profile/' + this.account + '.rss', function(err, res, body) {
    if (!err && res.statusCode === 200) {
      callback(body);
    }
  });
}

Askfm.prototype.checkLogin = function(callback) {
  request('/login', function(err, res, body) {
    if (!err && res.statusCode === 200) {
      var $ = cheerio.load(body);
      if ($('.link-logout').length > 0) {
        return callback();
      } else {
        var token = $('input').attr('name', 'authenticity_token').val();
        return callback(token);
      }
    }
  });
}

Askfm.prototype.doLogin = function(token, user, callback) {
  var data = {
    'authenticity_token': token,
    'login': user.login,
    'password': user.password
  };
  request.post({
    url: '/session',
    form: data,
    headers: {Referer: this.baseUrl + 'login'},
    followAllRedirects: true
  }, function(err, res, body) {
    var $ = cheerio.load(body);
    if ($('.link-logout').length > 0) {
      callback();
    } else {
      console.log('ログインに失敗しました');
    }
  });
}

Askfm.prototype.postQuestion = function(question) {
  var that = this;
  request(this.account, function(err, res, body) {
    if (!err && res.statusCode === 200) {
      var $ = cheerio.load(body);
      var token = $('input').attr('name', 'authenticity_token').val();
      var data = {
        'authenticity_token': token,
        'question[question_text]': question,
        'question[force_anonymous]': 'force_anonymous'
      };
      request.post({
        url: that.account + '/questions/create',
        form: data,
        headers: {Referer: that.baseUrl + that.account}
      });
    }
  });
}

module.exports = Askfm;
