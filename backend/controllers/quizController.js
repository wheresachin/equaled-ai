const Quiz = require('../models/Quiz');

const createQuiz = async (req, res) => {
    const { lessonId, title, questions } = req.body;
    try {
        const quiz = await Quiz.create({
            lessonId,
            title,
            questions,
            createdBy: req.user.id
        });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getQuizByLesson = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
        if (quiz) res.json(quiz);
        else res.status(404).json({ message: 'Quiz not found for this lesson' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createQuiz, getQuizByLesson };
