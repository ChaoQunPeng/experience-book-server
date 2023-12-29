const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const authorSchema = new Schema({
  author: String,
  age: Number,
  books: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Book' // 关联的Model
    }
  ]
});


module.exports = mongoose.model('Author', authorSchema, 'authors'); // 分别为Model名、Schema、数据库中集合名
