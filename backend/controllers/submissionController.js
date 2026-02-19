const Submission = require('../models/Submission');

const createSubmission = async (req, res) => {
    const { quizId, answers, score } = req.body;
    try {
        const submission = await Submission.create({
            userId: req.user.id,
            quizId,
            answers,
            score
        });
        res.status(201).json(submission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({})
            .populate('userId', 'name email')
            .populate('quizId', 'title')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for a specific lesson (via quiz)
// @route   GET /api/submissions/lesson/:lessonId
// @access  Teacher
const getSubmissionsByLesson = async (req, res) => {
    const { lessonId } = req.params;
    try {
        // Find quizzes for this lesson
        const quizzes = await require('../models/Quiz').find({ lessonId });
        const quizIds = quizzes.map(q => q._id);

        const submissions = await Submission.find({ quizId: { $in: quizIds } })
            .populate('userId', 'name email')
            .populate('quizId', 'title')
            .sort({ createdAt: -1 });
            
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add teacher feedback to a submission
// @route   POST /api/submissions/:id/feedback
// @access  Teacher
const addFeedback = async (req, res) => {
    const { feedback, score } = req.body;
    try {
        const submission = await Submission.findById(req.params.id);

        if (submission) {
            submission.teacherFeedback = feedback;
            if (score !== undefined) submission.score = score;
            submission.status = 'graded';
            await submission.save();
            res.json(submission);
        } else {
            res.status(404).json({ message: 'Submission not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createSubmission, 
    getSubmissions,
    getSubmissionsByLesson,
    addFeedback
};
