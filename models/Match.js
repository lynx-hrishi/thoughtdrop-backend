import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    validate: v => v.length === 2
  }
}, { timestamps: true });

// matchSchema.index({ users: 1 }, { unique: true });


export default mongoose.model("Match", matchSchema);