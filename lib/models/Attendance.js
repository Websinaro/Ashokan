import mongoose from "mongoose";

const PeriodEntrySchema = new mongoose.Schema(
  {
    period: { type: Number, required: true }, // 1-indexed period number
    label: { type: String, required: true },
    attended: { type: Boolean, default: null }, // null = not marked yet
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Stored as YYYY-MM-DD string in the user's local day, avoids timezone drift
    date: {
      type: String,
      required: true,
    },
    went: {
      type: Boolean, // did the user go to college at all that day
      default: null,
    },
    periods: {
      type: [PeriodEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
