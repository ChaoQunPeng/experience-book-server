/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-28 14:19:02
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-07 20:59:24
 * @FilePath: /experience-book-server/mysql/connection.js
 * @Description:
 */
const mysql = require('mysql2');
// const { MYSQL_CONF } = require('../config/db');

const MYSQL_CONF = {
  host: 'localhost',
  user: 'root',
  password: '123456789',
  port: '3306',
  database: 'experience_book'
};


console.log(`数据库开始连接`);

let db= mysql.createConnection(MYSQL_CONF);

db.connect(function (err) {
  if (err) {
    console.error('Database error:', err);
    return;
  }

  console.log(`数据库连接完成`);
});

// 在发生错误时触发
db.on('error', err => {
  console.error('Database error:', err);
});

module.exports = {
  db
};
