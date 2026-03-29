import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    eventId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    hostId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true, index: true },

    guestName:  { type: String, required: true, trim: true },
    guestEmail: { type: String, required: true, lowercase: true, trim: true },
    guestNotes: { type: String, maxlength: 500, default: '' },

    startTime: { type: Date, required: true },
    endTime:   { type: Date, required: true },
    timezone:  { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'rescheduled'],
      default: 'confirmed',
    },

    location:           { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    uid:                { type: String, unique: true },

    // Google Calendar sync
    googleCalendarEventId: { type: String, default: '' },
  },
  { timestamps: true }
);

BookingSchema.pre('save', function (next) {
  if (!this.uid) {
    this.uid = `SX-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
