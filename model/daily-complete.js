/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 21:42:04
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2023-12-27 22:04:41
 * @FilePath: /experience-bood-server/model/daily-complete.js
 * @Description: 打卡
 */

const mongoose = require('mongoose');

const DailyCompleteSchema = new mongoose.Schema(
  {
    /**
     * 打卡事项名称
     */
    name: String,
    /**
     * 创建时间
     */
    createTime: Date
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

// DailyCompleteSchema.virtual('list', {
//   ref: 'DailyCompletePunch',
//   localField: '_id',
//   foreignField: 'itemId',
//   justOne: false
// });

const DailyCompletePunchSchema = new mongoose.Schema({
  /**
   * 打卡事项ID
   */
  itemId: {
    type: mongoose.Types.ObjectId,
    ref: 'DailyComplete'
  },
  /**
   * 打卡时间
   */
  createTime: Date,
  /**
   * 状态
   */
  status: Number
});

/**
 * 打卡
 */
const DailyCompleteModel =
  mongoose.models['DailyComplete'] || mongoose.model('DailyComplete', DailyCompleteSchema, 'daily_complete');

const DailyCompletePunchModel =
  mongoose.models['DailyCompletePunch'] ||
  mongoose.model('DailyCompletePunch', DailyCompletePunchSchema, 'daily_complete_punch');

module.exports = {
  DailyCompleteSchema,
  DailyCompleteModel,
  DailyCompletePunchModel
};
