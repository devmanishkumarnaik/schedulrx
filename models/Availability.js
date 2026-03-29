import mongoose from 'mongoose';

const DayScheduleSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    start:   { type: String, default: '09:00' },
    end:     { type: String, default: '17:00' },
  },
  { _id: false }
);

const AvailabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    schedule: {
      sunday:    { type: DayScheduleSchema, default: { enabled: false, start: '09:00', end: '17:00' } },
      monday:    { type: DayScheduleSchema, default: { enabled: true,  start: '09:00', end: '17:00' } },
      tuesday:   { type: DayScheduleSchema, default: { enabled: true,  start: '09:00', end: '17:00' } },
      wednesday: { type: DayScheduleSchema, default: { enabled: true,  start: '09:00', end: '17:00' } },
      thursday:  { type: DayScheduleSchema, default: { enabled: true,  start: '09:00', end: '17:00' } },
      friday:    { type: DayScheduleSchema, default: { enabled: true,  start: '09:00', end: '17:00' } },
      saturday:  { type: DayScheduleSchema, default: { enabled: false, start: '09:00', end: '17:00' } },
    },
    bufferBefore: { type: Number, default: 0  }, // minutes
    bufferAfter:  { type: Number, default: 0  }, // minutes
    minimumNotice:{ type: Number, default: 60 }, // minutes before slot can be booked
    daysInAdvance:{ type: Number, default: 60 }, // how many days in advance can be booked
  },
  { timestamps: true }
);

export default mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);
