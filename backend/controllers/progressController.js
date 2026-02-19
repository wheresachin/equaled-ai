const Progress = require('../models/Progress');
const User = require('../models/User');

// @desc    Get progress for a student
// @route   GET /api/progress/student/:studentId
// @access  Teacher/Admin (or Student for themselves)
const getStudentProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.params.studentId }).populate('lessonId', 'title difficulty');
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get overall class progress (for Teacher)
// @route   GET /api/progress
// @access  Teacher
const getClassProgress = async (req, res) => {
    try {
        // Fetch all progress records, populated with user and lesson info
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
    getClassProgress,
    updateProgress
};
