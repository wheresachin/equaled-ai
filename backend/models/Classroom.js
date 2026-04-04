const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,   
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

const Classroom = mongoose.model('Classroom', classroomSchema);
module.exports = Classroom;
