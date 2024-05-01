import fs from "fs"
import path from "path"
import { __dirname } from "../../utils.js"//Importe el __dirname que arme para usar con ESmodules
import { cartModel } from "./models/cartModel.js"

class CartManagerMongo {

    // static idCarts //Variable Global, iniciada en 0 en DB

    // constructor() {
    //     this.carts = [] //Array con todos los carritos
    //     this.path = path.join(__dirname, "src", "db", "carts.json") //normalizo la ruta para cualquier OS con el modulo path
    //     this.idPath = path.join(__dirname, "src", "db", "idCarts.txt")

    // }

    //                                          METODOS

    //1) METODO PARA CREAR CARRITO
    async createCart(obj) {

        return await cartModel.create(obj)
    }

    //2) METODO PARA TRAER TODOS LOS CARRITOS
    async getCarts() {
        return await cartModel.find()
    }


    //3) METODO PARA TRAER CARRITO POR ID
    async getCartById(id) {
        return await cartModel.findOne({_id:id})
    }


    async addToCart(carrito, pid) {

        for (let i = 0; i < carrito.products.length; i++) {
            for (let key in carrito.products[i])
                if (carrito.products[i][key] == pid) {
                    console.log("Existe la propiedad!")
                    carrito.products[i].quantity += 1
                    return await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 4))
                } else {
                    console.log("No hay propiedad")
                }
        }
        let nuevoProducto = {
            "producto": pid,
            "quantity": 1
        }
        carrito.products.push(nuevoProducto)
        return await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 4))

    }


}

export { CartManagerMongo };