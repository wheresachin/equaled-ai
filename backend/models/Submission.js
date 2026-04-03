const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId },
        answerText: { type: String, required: true },
        isCorrect: { type: Boolean }
    }],
    score: { type: Number },
    teacherFeedback: { type: String },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
