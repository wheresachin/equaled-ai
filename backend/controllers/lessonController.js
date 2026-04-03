const Lesson = require('../models/Lesson');

const createLesson = async (req, res) => {
    const { title, content, category, difficulty } = req.body;
    try {
        const lesson = await Lesson.create({ title, content, category, difficulty });
        res.status(201).json(lesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({});
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (lesson) res.json(lesson);
        else res.status(404).json({ message: 'Lesson not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (lesson) {
            await lesson.deleteOne();
            res.json({ message: 'Lesson removed' });
        } else {
            res.status(404).json({ message: 'Lesson not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (lesson) {
            lesson.title = req.body.title || lesson.title;
            lesson.content = req.body.content || lesson.content;
            lesson.category = req.body.category || lesson.category;
            lesson.difficulty = req.body.difficulty || lesson.difficulty;
            const updatedLesson = await lesson.save();
            res.json(updatedLesson);
        } else {
            res.status(404).json({ message: 'Lesson not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createLesson, getLessons, getLessonById, deleteLesson, updateLesson };
