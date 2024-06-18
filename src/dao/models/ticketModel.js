import mongoose from "mongoose";

//Defino colección con la que va a trabajar mi modelo
const ticketCollection = "compras"

//Defino esquema
const ticketSchema = new mongoose.Schema(
    {
        code: { type: String, unique: true },
        purchase_datetime: { type: Date, default: Date.now },
        amount: Number,
        purchaser: String,
        products: []
    },
    {
        timestamps: true //De aca sale la propiedad createdAt
    })

// Crear y exportar el modelo
export const ticketModel = mongoose.model("compras", ticketSchema)

