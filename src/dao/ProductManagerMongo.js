import { __dirname } from "../utils/utils.js"//Importe el __dirname que arme para usar con ESmodules
import { productsModel } from "./models/productsModel.js"

class ProductManagerMongo {    

    //Agregar nuevo producto a DB
    async addProduct(obj) {
        try {
            return await productsModel.create(obj)
        } catch (error) {
            return "error en la funcion al agregar producto"
        }
    }


    // Devolver todos los productos de la DB
    async getProducts() {
        return await productsModel.find().lean()// Le agrego el lean() solo por el desperfecto de handlebars         
    }


    //Devolver productos con Paginación
    async getProductsPaginate(filtro, opciones, sortOptions) {

        let resultado = await productsModel.paginate(filtro, {limit: opciones.limit, page: opciones.page, lean: true, sort: sortOptions})
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


    //Metodo especial para validar con MONGO cualquier propiedad o propiedades (Lo enseñó el profe, tengo que repasarlo)
    async getProductsByFiltro(filtro) { //filtro= {code: 123, status:"ok", etc}
        return await productsModel.findOne(filtro)
    }


    //Metodo de filtrado por prop y value (Esta en uso esto???? Creo que no, lo comento)
    // async getProductsByPropValue(productos, propiedad, valor) {
    //     return productos.filter(producto => producto[propiedad] == valor)
    // }


    //Metodo para borrar un producto
    async deleteProduct(id) {
        return await productsModel.deleteOne({ _id: id })
    }


    //Metodo para actualizar productos
    async updateProduct(id, obj) {
        //updateOne(), no me va a devolver el producto modificado,por eso uso otro un metodo propio de MONGOOSE
        // return await productsModel.updateOne({_id:id}, obj)

        return await productsModel.findByIdAndUpdate(id, obj, { runValidators: true, returnDocument: "after" })
        //El tercer argumento es para correr validaciones de mongo y para que te muestre el documento actualizado, sino te muestra el original, así viene por defecto
    }
}


export { ProductManagerMongo };