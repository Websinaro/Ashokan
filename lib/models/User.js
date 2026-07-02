import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // Semester / period settings, editable from the Settings page
    settings: {
      semesterStart: { type: Date, default: null },
      semesterEnd: { type: Date, default: null },
      periodsPerDay: { type: Number, default: 6, min: 1, max: 12 },
      periodLabels: {
        type: [String],
        default: function () {
          return ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"];
        },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
