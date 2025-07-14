const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: true,
    unique: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  bookedAt: {
    type: Date,
    default: null
  },
  parkedAt: {
    type: Date,
    default: null
  },
  leftAt: {
    type: Date,
    default: null
  },
  bookedBy: { 
    type: String, 
    default: null 
  },
  parkedBy: { 
    type: String, 
    default: null 
  },
});

module.exports = mongoose.model('Slot', slotSchema);
