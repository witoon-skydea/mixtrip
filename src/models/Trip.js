const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a trip title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  coverImage: {
    type: String,
    default: '/images/default-trip.jpg'
  },
  location: {
    country: {
      type: String,
      required: [true, 'Please provide a country']
    },
    city: {
      type: String
    }
  },
  days: [
    {
      date: {
        type: Date,
        required: true
      },
      activities: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Activity title cannot be more than 100 characters']
          },
          type: {
            type: String,
            enum: ['accommodation', 'attraction', 'transportation', 'food', 'other'],
            default: 'other'
          },
          description: {
            type: String,
            maxlength: [500, 'Activity description cannot be more than 500 characters']
          },
          location: {
            address: {
              type: String
            },
            coordinates: {
              type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
              },
              coordinates: {
                type: [Number],
                index: '2dsphere'
              }
            }
          },
          startTime: {
            type: String,
            match: [
              /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
              'Please provide time in format HH:MM'
            ]
          },
          endTime: {
            type: String,
            match: [
              /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
              'Please provide time in format HH:MM'
            ]
          },
          price: {
            amount: {
              type: Number,
              min: [0, 'Price cannot be negative']
            },
            currency: {
              type: String,
              default: 'USD'
            }
          },
          photo: {
            type: String
          },
          notes: {
            type: String,
            maxlength: [500, 'Notes cannot be more than 500 characters']
          }
        }
      ]
    }
  ],
  budget: {
    amount: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [
    {
      type: String,
      trim: true
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for trip duration
TripSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
});

// Virtual for comment count
TripSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'trip',
  count: true
});

// Virtual for like count
TripSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Update the updatedAt field on update
TripSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Cascade delete comments when a trip is deleted
TripSchema.pre('remove', async function(next) {
  await this.model('Comment').deleteMany({ trip: this._id });
  next();
});

module.exports = mongoose.model('Trip', TripSchema);
