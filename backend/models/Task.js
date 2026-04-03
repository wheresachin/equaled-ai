const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
    },
    note: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['assigned', 'completed'],
        default: 'assigned',
    },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
