var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.get('/repos', function(req, res) {
    var issueData = [];
    var getData = function(pageCounter) {
        var request = require('request');
        request({
            url: 'https://api.github.com/orgs/takenet/repos' + '?page=' + pageCounter,
            headers: { 'user-agent': 'carolasilva' },
            json: true
        }, function (error, response, body) {
            if(!error && response.statusCode === 200) {
                for(var issueIndex = 0; issueIndex < body.length; issueIndex++) {
                    if(!body[issueIndex].pull_request) {
                        var lang = req.query.lang;
                        lang == "Csharp" ? lang="C#" : lang=lang;
                        if (body[issueIndex].language == lang) {
                            issueData.push({
                                name: body[issueIndex].name,
                                description: body[issueIndex].description,
                                language: body[issueIndex].language,
                                created_at: body[issueIndex].created_at,
                                avatar: body[issueIndex].owner.avatar_url
                            });
                            issueData.sort(function(a, b) {
                                var dateA = new Date(a.created_at), dateB = new Date(b.created_at);
                                return dateA - dateB;
                            });
                        }
                    }
                }
                if(body.length >= 30) {
                    res.send(Object.assign({}, issueData.slice(0, req.query.tam)));
                } else {
                    getData(pageCounter + 1);
                }
            }
           
        
        });
    };
    getData(1);

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;



