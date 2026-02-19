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
        const submissions = await Submission.find({}).populate('userId', 'name email').populate('quizId', 'title');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSubmission, getSubmissions };
