import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
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

likeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
likeSchema.index({ toUser: 1 });

export default mongoose.model("Like", likeSchema);