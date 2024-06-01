import fs from "fs"
import path from "path"
import { __dirname } from "../utils/utils.js"//Importe el __dirname que arme para usar con ESmodules

class ProductManager {
    //Atributos (No se para que sirve tener products, path y idPath escritos aca fuera del constructor)
    products
    path
    idPath
    static idProducts //Variable Global, iniciada en 0 en DB

    constructor() {
        this.products = [] //Array con todos los productos
        // this.path = __dirname + "/db/db.json" (path sin join)
        this.path = path.join(__dirname, "src", "db", "products.json") //normalizo la ruta para cualquier OS con el modulo path
        this.idPath = path.join(__dirname, "src", "db", "idProducts.txt")
    }

    //                              METODOS


    //1) Agregar nuevo producto a DB (SOLO AGREGAR USANDO ESTA FUNCION)
    async addProduct(obj) {
        try {            
            //Traigo el id de la DB y actualizo mi variable Global
            await this.getIdProducts()
            //id autoincremental
            ProductManager.idProducts += 1
            const id = ProductManager.idProducts

            //Actualizo el valor de idProducts en la DB
            await fs.promises.writeFile(this.idPath, id.toString())

            //Confeccion del Nuevo producto
            const nuevoProducto = {
                id: id,
                ...obj
            }

            //Agrego producto al array del constructor
            this.products.push(nuevoProducto)            

            //Escribo el array actualizado en la db
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 4))
            //Devuelvo array con todos los productos
            return this.products
    
        } catch (error) {
            return "error en la funcion al agregar producto"           
        }
    }

    //2) Devolver todos los productos de la DB
    async getProducts() { 
    
            // 1) Leer los productos de la DB de forma asíncrona            
            let resultado = await fs.promises.readFile(this.path, { encoding: "utf-8" })        
    
            // 2) Parseo de productos para agregar al array products
            let productosParseados = JSON.parse(resultado);
    
            if (!Array.isArray(productosParseados)) {
                throw new Error("Error, la DB no tiene un formato de array valido");//throw corta la ejecución y sale por el catch mas cercano
            }
    
            // 3) Agregar los productos al array this.products lo vacio antes por las dudas que me duplique los productos
                this.products = []
                this.products.push(...productosParseados);
            
            
    
            // 4) Ordenar los productos por ID para verlos por consola
            let sortedProducts = this.products.sort((a, b) => a.id - b.id);    
            console.log(sortedProducts);

            // 5) Devuelvo los productos
            return productosParseados        
    }


    //3) Consultar productos por id
    async getProductById(id) {
        try {            
            const producto = await this.products.find(elem => elem.id == id)
            if (producto) {
                return producto
            } else {
                return "No hay productos con el id solicitado"
            }
        } catch (error) {
            return "Error en la función, el id proporcionado no es un número"           
        }        
    }

    async deleteProduct(id) {
        try {          
            let producto = await this.products.find(elem => elem.id == id)
            if (producto) {
                let index = this.products.indexOf(producto)
                this.products.splice(index, 1)
                console.log(`${producto.title} eliminado`)

                //Actualizo el cambio en la db
                await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 4))
                console.log(this.products)
                return producto
                
            } else {
                return "El id del producto que desea eliminar no existe"
            }            
        } catch (error) {
            return "Error en la función al querer eliminar producto"          
        }
    }

    async updateProduct(id, obj) {
        try {
            
            let producto = await this.products.find(elem => elem.id == id)
            if (producto) {
                console.log("El producto a editar es el " + producto.title)
            } else {
                return "El ID del producto a editar no existe"                
            }

            
            let index = this.products.indexOf(producto)
            this.products.splice(index, 1)
            console.log("eliminamos " + producto.title + " para pushear el nuevo producto editado")
    
    
            //Nuevos valores del producto
            producto = {
                id: id,
                title: obj.title,
                description: obj.description,
                price: obj.price,
                thumbnail: obj.thumbnail,
                code: obj.code,
                stock: obj.stock,
                category: obj.category,
                status: obj.status
            }
            this.products.push(producto)

            //Actualizo el cambio en la db
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 4))
            console.log(this.products)
            return producto

        } catch (error) {
            return "Error en la función al editar producto"            
        }
    }

    async getIdProducts() {
        try {
            const ultimoId = await fs.promises.readFile(this.idPath, { encoding: "utf-8" })
            return ProductManager.idProducts = parseInt(ultimoId)

        } catch (error) {
            console.log("Error al traer el ultimo id de la DB")
        }
    }
}


export default ProductManager