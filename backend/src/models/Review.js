const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  photos: [{
    url: String,
    public_id: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpful: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  visitDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per destination
reviewSchema.index({ user: 1, destination: 1 }, { unique: true });

// Method to like a review
reviewSchema.methods.like = async function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.helpful += 1;
    await this.save();
  }
};

// Method to unlike a review
reviewSchema.methods.unlike = async function(userId) {
  if (this.likes.includes(userId)) {
    this.likes = this.likes.filter(id => id.toString() !== userId.toString());
    this.helpful -= 1;
    await this.save();
  }
};

// Static method to get average rating for a destination
reviewSchema.statics.getAverageRating = async function(destinationId) {
  const result = await this.aggregate([
    { $match: { destination: destinationId } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } }
  ]);
  return result[0]?.averageRating || 0;
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 