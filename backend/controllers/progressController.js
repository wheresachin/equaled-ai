const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// @desc    Get progress for a student
// @route   GET /api/progress/student/:studentId
// @access  Teacher/Admin
const getStudentProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.params.studentId }).populate('lessonId', 'title difficulty');
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current student's own progress summary
// @route   GET /api/progress/me
// @access  Student
const getMyProgress = async (req, res) => {
    try {
        const progressRecords = await Progress.find({ userId: req.user._id })
            .populate('lessonId', 'title difficulty category');

        const totalLessons = await Lesson.countDocuments();
        const completedLessons = progressRecords.filter(p => p.isCompleted).length;
        const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const avgQuizScore = progressRecords.length
            ? Math.round(progressRecords.reduce((sum, p) => sum + (p.quizScore || 0), 0) / progressRecords.length)
            : 0;

        res.json({
            totalLessons,
            completedLessons,
            totalTimeSpent,
            avgQuizScore,
            progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            records: progressRecords,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get overall class progress (for Teacher)
// @route   GET /api/progress
// @access  Teacher
const getClassProgress = async (req, res) => {
    try {
        const progress = await Progress.find({})
            .populate('userId', 'name email')
            .populate('lessonId', 'title');
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update progress (Mark lesson complete)
// @route   POST /api/progress
// @access  Student
const updateProgress = async (req, res) => {
    const { lessonId, isCompleted, timeSpent } = req.body;
    
    try {
        let progress = await Progress.findOne({ userId: req.user._id, lessonId });

        if (progress) {
            progress.isCompleted = isCompleted !== undefined ? isCompleted : progress.isCompleted;
            progress.timeSpent = (progress.timeSpent || 0) + (timeSpent || 0);
            progress.lastAccessedAt = Date.now();
            await progress.save();
        } else {
            progress = await Progress.create({
                userId: req.user._id,
                lessonId,
                isCompleted: isCompleted || false,
                timeSpent: timeSpent || 0
            });
        }
        
        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudentProgress,
    getMyProgress,
    getClassProgress,
    updateProgress
};
