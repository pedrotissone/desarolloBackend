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
    async getProductsPaginate(filtro, opciones) {
        //1 argumento es un filtro, el 2do es para indicar ciertos aspectos del paginado
        console.log(opciones)
        let resultado = await productsModel.paginate(filtro, opciones)
        console.log(resultado)

        //Agrego validaciones para el sort
        let sortOrder = opciones.sort
        if (sortOrder == "asc") {
            return resultado = resultado.docs.sort(function (a, b) { return a.price - b.price })

        } else if (sortOrder == "desc") {
            return resultado = resultado.docs.sort(function (a, b) { return b.price - a.price })

        } else {
            return resultado = {
                status: "success",
                payload: resultado.docs,
                totalPages: resultado.totalPages,
                prevPage: resultado.prevPage,
                nextPage: resultado.nextPage,
                page: resultado.page,
                hasPrevPage: resultado.hasPrevPage,
                hasNextPage: resultado.hasNextPage,
                prevLink: "En construccion",
                nextLink: "En construccion"
            }
        }        
    }


    //3) Metodo especial para validar con MONGO cualquier propiedad o propiedades (Lo enseñó el profe, tengo que repasarlo)
    async getProductsByFiltro(filtro) { //filtro= {code: 123, status:"ok", etc}
        return await productsModel.findOne(filtro)
    }

    //4) METODO DE FILTRO POR PROP Y VALUE
    async getProductsByPropValue(productos, propiedad, valor) {
        return productos.filter(producto => producto[propiedad] == valor)
    }

    //4) Metodo para borrar un producto
    async deleteProduct(id) {

        return await productsModel.deleteOne({ _id: id })
    }

    //5) Metodo para actualizar productos
    async updateProduct(id, obj) {
        //updateOne(), no me va a devolver el producto modificado,por eso uso otro un metodo propio de MONGOOSE
        // return await productsModel.updateOne({_id:id}, obj)

        return await productsModel.findByIdAndUpdate(id, obj, { runValidators: true, returnDocument: "after" })
        //El tercer argumento es para correr validaciones de mongo y para que te muestre el documento actualizado, sino te muestra el original, así viene por defecto
    }

}


export { ProductManagerMongo };