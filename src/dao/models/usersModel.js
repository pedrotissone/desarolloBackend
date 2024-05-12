import mongoose from "mongoose";

//Modelo con su coleccion y su esquema
export const usersModel = mongoose.model("users", new mongoose.Schema({

    nombre: String,
    email: { type: String, unique: true },//Unique es para que no se pueda grabar dos emails iguales en la DB
    password: String,
    rol: {type: String, default: "usuario"}
}))