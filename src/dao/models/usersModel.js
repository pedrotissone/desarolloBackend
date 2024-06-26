import mongoose from "mongoose";

//Modelo con su coleccion y su esquema
export const usersModel = mongoose.model("users", new mongoose.Schema({

    nombre: String,
    apellido: String,
    edad: Number,
    email: { type: String, unique: true },//Unique es para que no se pueda grabar dos emails iguales en la DB
    password: String,
    rol: {type: String, default: "usuario"},
    carrito: {type: mongoose.Types.ObjectId, ref: "carts"}
},
{
    timestamps: true,
    strict: false //Me permite agregar otros campos que no esten en el modelo (Ej. profile de github y carrito al hacer el signup)
}
))