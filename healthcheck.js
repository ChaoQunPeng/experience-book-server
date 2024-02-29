/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2024-02-29 20:44:32
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-29 20:46:31
 * @FilePath: /experience-book-server/healthcheck.js
 * @Description: 
 */
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/common/healthcheck',
  method: 'GET'
};

const req = http.request(options, res => {
  if (res.statusCode === 200) {
    process.exit(0); // 健康状态
  } else {
    process.exit(1); // 不健康状态
  }
});

req.on('error', error => {
  console.error('Error:', error);
  process.exit(1); // 不健康状态
});

req.end();