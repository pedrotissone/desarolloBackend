import fs from "fs"
import path from "path"
import __dirname from "../../utils.js"//Importe el __dirname que arme para usar con ESmodules

class CartManager {

    static idCarts //Variable Global, iniciada en 0 en DB

    constructor() {
        this.carts = [] //Array con todos los carritos
        this.path = path.join(__dirname, "src", "db", "carts.json") //normalizo la ruta para cualquier OS con el modulo path
        this.idPath = path.join(__dirname, "src", "db", "idCarts.txt")

    }

    //                                          METODOS

    async getIdCart() {
        try {
            const ultimoId = await fs.promises.readFile(this.idPath, { encoding: "utf-8" })
            return CartManager.idCarts = parseInt(ultimoId)

        } catch (error) {
            return "Error al traer el ultimo id de la DB"
        }
    }

    async getCarts() {
        try {
            // 1) Leer los carritos de la DB de forma asíncrona            
            let carts = await fs.promises.readFile(this.path, { encoding: "utf-8" })        
    
            // 2) Parseo para agregar al array carts
            let parsedCarts = JSON.parse(carts);
    
            if (!Array.isArray(parsedCarts)) {
                throw new Error("Error, la DB no tiene un formato de array valido");//throw corta la ejecución y sale por el catch mas cercano
            }
    
            // 3) Agregar los carritos al array this.carts
            this.carts.push(...parsedCarts);
            
    
            // 4) Ordenar los carritos por ID para verlos por consola
            let sortedCarts = this.carts.sort((a, b) => a.id - b.id);    
            console.log(sortedCarts);

            // 5) Devuelvo los carritos
            return parsedCarts

        } catch (error) {
            return "Error en la función al querer leer o parsear la DB"
        }
    }

    async createCart() {
        try {            
            //Traigo el id de la DB y actualizo mi variable Global
            await this.getIdCart()

            //id autoincremental
            CartManager.idCarts += 1
            const id = CartManager.idCarts

            //Actualizo el valor de idProducts en la DB
            await fs.promises.writeFile(this.idPath, id.toString())

            //Confeccion del Nuevo producto
            const nuevoCarrito = {
                id: id,
                products: []
            }

            //Agrego producto al array del constructor
            this.carts.push(nuevoCarrito)            

            //Escribo el array actualizado en la db
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 4))

            return nuevoCarrito
    
        } catch (error) {
            return "error en la funcion al agregar carrito"           
        }
    }

    async getCartById(id) {
        try {            
            const carrito = await this.carts.find(elem => elem.id == id)
            if (carrito) {
                return carrito
            } else {
                return "No hay carritos con el id solicitado"
            }
        } catch (error) {
            return "Error en la función, el id proporcionado no es un número"           
        }        
    }

}

export default CartManager;