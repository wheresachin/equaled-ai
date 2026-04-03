const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Task = require('../models/Task');
const Lesson = require('../models/Lesson');

// GET /api/teacher/students  — get all students in teacher's classroom
const getMyStudents = async (req, res) => {
    try {
        let classroom = await Classroom.findOne({ teacher: req.user._id }).populate('students', 'name email disabilityType');
        if (!classroom) classroom = { students: [] };
        res.json(classroom.students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/teacher/students  — add student by email
const addStudentByEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        // Find the registered student
        const student = await User.findOne({ email: email.toLowerCase().trim(), role: 'student' });
        if (!student) return res.status(404).json({ message: 'No registered student found with that email.' });

        // Get or create classroom
        let classroom = await Classroom.findOne({ teacher: req.user._id });
        if (!classroom) {
            classroom = await Classroom.create({ teacher: req.user._id, students: [] });
        }

        // Check if already added
        if (classroom.students.includes(student._id)) {
            return res.status(400).json({ message: 'Student already in your classroom.' });
        }

        classroom.students.push(student._id);
        await classroom.save();

        // Return the added student info (not password)
        res.status(201).json({ _id: student._id, name: student.name, email: student.email, disabilityType: student.disabilityType });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/teacher/students/:studentId  — remove student from classroom
const removeStudent = async (req, res) => {
    try {
        const classroom = await Classroom.findOne({ teacher: req.user._id });
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        classroom.students = classroom.students.filter(
            (id) => id.toString() !== req.params.studentId
        );
        await classroom.save();
        res.json({ message: 'Student removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/teacher/tasks  — assign a task (lesson) to selected students
const assignTask = async (req, res) => {
    const { title, lessonId, studentIds, dueDate, note } = req.body;
    if (!title || !lessonId || !studentIds || studentIds.length === 0) {
        return res.status(400).json({ message: 'Title, lesson, and at least one student are required.' });
    }

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        const task = await Task.create({
            teacher: req.user._id,
            lesson: lessonId,
            students: studentIds,
            title,
            dueDate: dueDate || null,
            note: note || '',
        });

        await task.populate(['lesson', { path: 'students', select: 'name email' }]);
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/teacher/tasks  — get all tasks assigned by this teacher
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ teacher: req.user._id })
            .populate('lesson', 'title category')
            .populate('students', 'name email')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getMyStudents, addStudentByEmail, removeStudent, assignTask, getMyTasks };
