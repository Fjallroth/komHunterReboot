const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  segmentId: {
    type: String,
    required: true, 
    unique: true,
  },
  segmentName: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Todo', TodoSchema)
