import mongoose from "mongoose"

//Defino el nombre del Modelo y a la coleccíon
const productsCollection = "products"
//Defino el esquema del Modelo con las propiedades que quiero que tengan mis productos (2 argumentos)
const productsSchema = new mongoose.Schema(

    {
        title: {type: String, required: true},
        description: {type: String, required: true},
        price: {type: Number, required: true},
        thumbnail: {type: String, required: true},
        code: { type: String, required: true, unique: true},
        stock: {type: Number, required: true},
        category: {type: String, required: true},
        status: {type: String, required: true}
    },
    {
        timpestamps: true
    }
)

//Exporto MODELO DE DATOS (ODM), respecto a una coleccion y con su respectivo esquema (El modelo tiene todas las funciones para realizar el CRUD)
export const productsModel = mongoose.model(
    productsCollection,
    productsSchema
)
//NOTA: mongoose tiene muchas funcionalidades y metodos EXTRA que no tenes usando mongo shell