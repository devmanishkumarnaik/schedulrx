import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [80, 'Title cannot exceed 80 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      enum: [15, 30, 45, 60, 90, 120],
      default: 30,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    location: {
      type: String,
      default: 'Video Call',
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bookingLink: {
      type: String,
    },
    requiresConfirmation: {
      type: Boolean,
      default: false,
    },
    questions: [
      {
        label: String,
        required: Boolean,
      },
    ],
  },
  { timestamps: true }
);

// Ensure slug is unique per user
EventSchema.index({ userId: 1, slug: 1 }, { unique: true });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
