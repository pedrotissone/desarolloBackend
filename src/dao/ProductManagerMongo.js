import fs from "fs"
import path from "path"
import { __dirname } from "../../utils.js"//Importe el __dirname que arme para usar con ESmodules
import { productsModel } from "./models/productsModel.js"

class ProductManagerMongo {
    // constructor() {
    //     this.products = [] //Array con todos los productos
    //     // this.path = __dirname + "/db/db.json" (path sin join)
    //     this.path = path.join(__dirname, "src", "db", "products.json") //normalizo la ruta para cualquier OS con el modulo path
    //     this.idPath = path.join(__dirname, "src", "db", "idProducts.txt")
    // }

    //                              METODOS


    //1) Agregar nuevo producto a DB (SOLO AGREGAR USANDO ESTA FUNCION)
    async addProduct(obj) {
        try {     
           return await productsModel.create(obj)
    
        } catch (error) {
            return "error en la funcion al agregar producto"           
        }
    }

    //2) Devolver todos los productos de la DB
    async getProducts() {
        return await productsModel.find().lean()// Le agrego el lean() solo por el desperfecto de handlebars         
    }

    //2B) Devolver todos los productos con Paginación
    //indico que va a recibir una pagina como parametro y seteo defecto su valor en 1, lo saqué porque ya defini en la ruta eso
    async getProductsPaginate(page) { 
        //1 argumento es un filtro, el 2 es para indicar los aspectos del paginado
        return await productsModel.paginate({}, {limit:1, page, lean:true}) 
    }


    //3) Metodo especial para validar con MONGO cualquier propiedad o propiedades (Yo aca voy a usarlo solo para el code)
    async getProductsByFiltro(filtro) { //filtro= {code: 123, status:"ok", etc}
        return await productsModel.findOne(filtro)
    }

    //4) Metodo para borrar un producto
    async deleteProduct(id) {
       
        return await productsModel.deleteOne({_id:id})
    }

    //5) Metodo para actualizar productos
    async updateProduct(id, obj) {
        //updateOne(), no me va a devolver el producto modificado,por eso uso otro un metodo propio de MONGOOSE
        // return await productsModel.updateOne({_id:id}, obj)

        return await productsModel.findByIdAndUpdate(id, obj, {runValidators: true, returnDocument: "after"})
        //El tercer argumento es para correr validaciones de mongo y para que te muestre el documento actualizado, sino te muestra el original, así viene por defecto
    }

}


export { ProductManagerMongo };