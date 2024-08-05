import { __dirname } from "../utils/utils.js"//Importe el __dirname que arme para usar con ESmodules
import { cartModel } from "./models/cartModel.js"

class CartManagerMongo {
    //                                          METODOS

    //CREAR CARRITO
    async createCart(obj) {        
        return await cartModel.create(obj)        
    }

    //TRAER TODOS LOS CARRITOS
    async getCarts() {
        return await cartModel.find()
    }

    //TRAER CARRITO POR ID
    async getCartById(id) {
        //Le agrego el metodo POPULATE() para poblar ese documento, sino SOLO me traería el id de los productos agregados
        return await cartModel.findOne({ _id: id }).populate("productos.producto").lean()
    }


    //AGREGAR PRODUCTOS AL CARRITO (Nuevos o agrega cantidad)
    async addToCart(cid, productos) {
        return await cartModel.updateOne({_id:cid}, {$set: {productos: productos}})
    }

    //MODIFICAR SOLO LA CANTIDAD DE UN PRODUCTO (Esto solo lo uso en postman, porque para las vistas uso addToCart que agrega un nuevo producto o suma +1 la cantidad si existe el producto en el carrito)
    async updateQuantity(cid, pid, nuevaCantidad) {
        return await cartModel.updateOne({_id:cid, "productos.producto": pid}, {$set:{"productos.$.quantity": nuevaCantidad}})

    }
    //SUMAR + 1 A LA CANTIDAD DE UN PRODUCTO (Usé en algun lado esto?, no se que es)
    async updateQuantityHandlebars(cid, pid) {
        return await cartModel.updateOne({_id:cid, "productos.producto": pid},{$inc: {"productos.$.quantity": 1}})
    }

    //ELIMINAR CARRITO
    async deleteCart(id) {
        return await cartModel.deleteOne({_id:id})
    }

    //ELIMINAR PRODUCTO DEL CARRITO
    async deleteProductInCart(cid, pid) {
        return await cartModel.updateOne({_id:cid}, {$pull: {productos: {producto: pid}}})
    }
}

export { CartManagerMongo };