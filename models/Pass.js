import mongoose from "mongoose";

const passSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

passSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
passSchema.index({ toUser: 1 });

export default mongoose.model("Pass", passSchema);