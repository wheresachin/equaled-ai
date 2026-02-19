const mongoose = require('mongoose');

const progressSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    isCompleted: { type: Boolean, default: false },
    lastAccessedAt: { type: Date, default: Date.now },
    quizScore: { type: Number, default: 0 }, // Optional: separate from Submission if needed for quick stats
    timeSpent: { type: Number, default: 0 } // In minutes
}, { timestamps: true });

// Ensure a user has only one progress record per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
