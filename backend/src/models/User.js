const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  uploadedPhotos: [{
    url: String,
    public_id: String,
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to add a destination to favorites
userSchema.methods.addToFavorites = async function(destinationId) {
  if (!this.favorites.includes(destinationId)) {
    this.favorites.push(destinationId);
    await this.save();
  }
};

// Method to remove a destination from favorites
userSchema.methods.removeFromFavorites = async function(destinationId) {
  this.favorites = this.favorites.filter(id => id.toString() !== destinationId.toString());
  await this.save();
};

// Method to check if a destination is in favorites
userSchema.methods.isFavorite = function(destinationId) {
  return this.favorites.includes(destinationId);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 