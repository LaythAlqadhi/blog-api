const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: { type: String, required: true },
  reactions: {
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 }
  },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

commentSchema.virtual('createdAt_formatted').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});
  
commentSchema.virtual('updatedAt_formatted').get(function () {
  return DateTime.fromJSDate(this.updatedAt).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Comment', commentSchema);