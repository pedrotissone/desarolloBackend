import mongoose from "mongoose";

const cartsCollection = "carts"

const cartsSchema = new mongoose.Schema(
    {
        // productos: {type: Array, required: true},
        productos: {type: [
            {
                producto: {type: mongoose.Types.ObjectId, ref: "products"},
                quantity: Number
            }
        ], required: true},
        
    },
    {
        timestamps: true
    }
)

export const cartModel = mongoose.model(
    cartsCollection,
    cartsSchema
)