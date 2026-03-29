import mongoose from 'mongoose';

const CalendarConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    provider: {
      type:     String,
      enum:     ['google'],   // Only Google Calendar supported
      default:  'google',
      required: true,
    },
    accessToken:   { type: String, required: true },
    refreshToken:  { type: String, default: '' },
    tokenExpiry:   { type: Date },
    providerEmail: { type: String, default: '' },
    providerName:  { type: String, default: '' },
    calendarId:    { type: String, default: 'primary' },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

CalendarConnectionSchema.index({ userId: 1, provider: 1 }, { unique: true });

export default mongoose.models.CalendarConnection ||
  mongoose.model('CalendarConnection', CalendarConnectionSchema);
