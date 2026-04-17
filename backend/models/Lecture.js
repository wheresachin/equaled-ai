const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['youtube', 'upload'],
      required: true,
    },
    // For YouTube lectures — store the raw URL; embed URL derived on the fly
    youtubeUrl: { type: String, default: '' },
    // For uploaded video files — server-relative path
    videoPath: { type: String, default: '' },
    // Optional custom thumbnail override
    thumbnailUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const Lecture = mongoose.model('Lecture', lectureSchema);
module.exports = Lecture;
