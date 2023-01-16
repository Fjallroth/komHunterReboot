const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  segmentId: {
    type: String,
    required: false, 
  },
  segmentName: {
    type: String,
    required: false,
  },
  segmentTime:{
    type: Number,
    required: false,
  },
  completed: {
    type: Boolean,
    required: false,
  },
  userId: {
    type: String,
    required: true
  },
  leaderBoard: {
    type: Array,
    required: false
  },
  timeOffXom: {
    type: Number,
    required: false
  },
  xomTime: {
    type: Number,
    required: false
  },
  timeOffLB:{
    type: Number,
    required: false
  },
  percentageOff: {
    type: Number,
    required: false
  },
  percentOffLB:{
    type: Number,
    required: false
  },
  rank: {
    type: Number,
    required: false
}
})

module.exports = mongoose.model('Todo', TodoSchema)
