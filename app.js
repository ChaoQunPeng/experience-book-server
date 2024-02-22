/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:15:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-22 11:46:10
 * @FilePath: /experience-book-server/app.js
 * @Description:
 */
var createError = require('http-errors');
var express = require('express');
require('express-async-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// import { connect } from './mongodb/db';

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var skillRouter = require('./routes/skill');
var noteRouter = require('./routes/note');
var dailyCompleteRouter = require('./routes/daily-complete');
var commonRouter = require('./routes/common');

var app = express();

// const { db } = require('./mysql/connection');

const db = require('./mysql/connection');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
// 配置静态资源访问图片等。要访问的话localhost:3000/image.png 这样就行嘞
app.use(express.static(path.join(__dirname, 'uploads/content')));


app.use(function (req, res, next) {
  console.log(1);
  // console.log(req.headers['res-code-styleguide']);

  // 保存原始的send方法
  var originalSend = res.send;

  // 修改send方法来拦截返回值
  res.send = function (body) {
    // 在这里可以进行对返回值的处理
    var modifiedBody = body;

    // 调用原始的send方法，传递修改后的返回值
    originalSend.call(this, modifiedBody);
  };

  // 继续处理后续的中间件或路由处理程序
  next();
});

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/skill', skillRouter);
app.use('/note', noteRouter);
app.use('/daily-complete', dailyCompleteRouter);
app.use('/common', commonRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log(2);
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // console.log(JSON.stringify(err), JSON.stringify(req), JSON.stringify(res));
  console.log(`错误：`, JSON.stringify(err));

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
