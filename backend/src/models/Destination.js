const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  region: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mountain', 'temple', 'city', 'national_park', 'lake', 'other'],
    required: true
  },
  images: [{
    url: String,
    public_id: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  activities: [{
    name: String,
    description: String,
    duration: String,
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'difficult']
    },
    cost: {
      type: Number,
      default: 0
    }
  }],
  bestTimeToVisit: [{
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter']
  }],
  entryFee: {
    local: Number,
    foreign: Number
  },
  facilities: [String],
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

// Index for geospatial queries
destinationSchema.index({ location: '2dsphere' });

// Virtual for average rating
destinationSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination; 