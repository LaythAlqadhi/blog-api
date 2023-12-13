const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  privacy: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  reactions: {
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 }
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

PostSchema.virtual('createdAt_formatted').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

PostSchema.virtual('updatedAt_formatted').get(function () {
  return DateTime.fromJSDate(this.updatedAt).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Post', PostSchema);