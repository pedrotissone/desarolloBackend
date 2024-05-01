import mongoose from "mongoose";

const messageCollection = "messages"

const messagesSchema = new mongoose.Schema(
    {
        user: {type: String, required: true},
        message: {type: String, required: true}
    },
    {
        timestamps: true
    }
)

export const chatModel = mongoose.model(
    messageCollection,
    messagesSchema
)