/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-25 12:54:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2023-12-25 13:05:14
 * @FilePath: /experience-bood-server/http/model.js
 * @Description:
 */
class SuccessModel {
  constructor(options = {}) {
    this.code = options.code ?? 1;
    this.msg = options.msg ?? '';
    this.data = options.data ?? {};
  }
}

class ErrorModel {
  constructor(options = {}) {
    this.code = options.code ?? 0;
    this.msg = options.msg ?? '';
    this.data = options.data ?? {};
  }
}

module.exports = {
  SuccessModel,
  ErrorModel
};
