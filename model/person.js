/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-27 21:12:30
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2023-12-27 21:15:30
 * @FilePath: /experience-bood-server/model/person.js
 * @Description:
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  name: String,
  age: Number,
  stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

const StorySchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Person' },
  title: String,
  fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

const Story = mongoose.model('Story', StorySchema, 'tb_story');
const Person = mongoose.model('Person', PersonSchema, 'tb_person');

module.exports = {
  PersonSchema,
  StorySchema,
  Story,
  Person
};
