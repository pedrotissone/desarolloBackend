import mongoose from "mongoose";

const cartsCollection = "carts"

const cartsSchema = new mongoose.Schema(
    {
        productos: {type: Array, required: true},
        
    },
    {
        timestamps: true
    }
)

export const cartModel = mongoose.model(
    cartsCollection,
    cartsSchema
)