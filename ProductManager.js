const fs = require("fs")

class ProductManager {
    //Atributos
    products
    path
    static idProducts //Variable Global, iniciada en 0 en DB

    constructor() {
        this.products = [] //Array con todos los productos
        this.path = "./db/db.json"
    }

    //                              METODOS


    //1) Agregar nuevo producto a DB (SOLO AGREGAR USANDO ESTA FUNCION)
    async addProduct(title, description, price, thumbnail, code, stock) {
        try {            
            //Requerir campos de forma obligatoria
            if (!title || !description || !price || !thumbnail || !code || !stock) {
                console.log("Faltan campos obligatorios")
                return "Faltan campos obligatorios"
            }
            //Validar que no se repita el atributo code
            const codigoRepetido = this.products.some(elem => elem.code == code)
            if (codigoRepetido) {
                console.log(`El codigo del ${title} esta repetido en otro producto`)
                return "El codigo esta repetido en otro producto"
            }
            //Traigo el id de la DB y actualizo mi variable Global
            await this.getIdProducts()
    
            //id autoincremental
            ProductManager.idProducts += 1
            const id = ProductManager.idProducts
            
            //Actualizo el valor de idProducts en la DB
            // fs.writeFileSync("./db/idProducts.txt", id.toString())
            await fs.promises.writeFile("./db/idProducts.txt", id.toString())

            //Confeccion del Nuevo producto
            const nuevoProducto = {
                id: id,
                title: title,
                description: description,
                price: price,
                thumbnail: thumbnail,
                code: code,
                stock: stock
            }
            //Agrego producto al array del constructor
            this.products.push(nuevoProducto)
            console.log(`${nuevoProducto.title} agregado al array de productos`)

            //Escribo el array actualizado en la db
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 4))
    
        } catch (error) {
            console.log("error al agregar producto")            
        }
    }

    //2) Devolver todos los productos de la DB
    async getProducts() { 
        try {
            // 1) Leer los productos de la DB de forma asíncrona            
            let resultado = await fs.promises.readFile("./db/db.json", { encoding: "utf-8" })        
    
            // 2) Parseo de productos para agregar al array products
            let productosParseados = JSON.parse(resultado);
    
            if (!Array.isArray(productosParseados)) {
                throw new Error("Error, la DB no tiene un formato de array valido");//throw corta la ejecución y te lleva al catch mas cercano
            }
    
            // 3) Agregar los productos al array this.products
            this.products.push(...productosParseados);
    
            // 4) Ordenar los productos por ID
            let sortedProducts = this.products.sort((a, b) => a.id - b.id);
    
            console.log({sortedProducts}); // Mostrar los productos ordenados
        } catch (error) {
            console.log("Error al leer o parsear la DB");
        }
    }


    //3) Consultar productos por id
    async getProductById(id) {
        try {            
            const producto = await this.products.find(elem => elem.id == id)
            if (producto) {
                console.log({producto})
            } else {
                console.log("No hay productos")
            }
        } catch (error) {
            console.error("Not found")            
        }        
    }

    async deleteProduct(id) { //PROBAR ESCRIBIR ASYNC FUNC DE ESCRIBIR Y LEER Y LLAMARLAS DENTRO DE CADA METODO
        try {            
            let producto = await this.products.find(elem => elem.id == id)
            if (producto) {
                let index = this.products.indexOf(producto)
                this.products.splice(index, 1)
                console.log(`${producto.title} eliminado`)

                //Actualizo el cambio en la db
                await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 4))
                
            } else {
                console.log("El id del producto que desea eliminar no existe")
            }            
        } catch (error) {
            console.error("Error al querer eliminar producto")            
        }
    }

    async updateProduct(id, title, description, price, thumbnail, code, stock) {
        try {
            let producto = await this.products.find(elem => elem.id == id)
            if (producto) {
                console.log("El producto a editar es el " + producto.title)
            } else {
                console.log("No se puede editar, el id del producto no existe")
                return
            }
            if (!title || !description || !price || !thumbnail || !code || !stock) {
                console.log("Faltan campos obligatorios para poder editar el producto")
                return "Faltan campos obligatorios"
            }
            const codigoRepetido = this.products.some(elem => elem.code == code)
            if (codigoRepetido) {
                console.log(`No es posible editar, el codigo del ${title} esta repetido en otro producto`)
                return "El codigo esta repetido en otro producto"
            }
            
            let index = this.products.indexOf(producto)
            this.products.splice(index, 1)
            console.log("eliminamos " + producto.title + " para pushear el nuevo producto editado")
    
    
            //Nuevos valores del producto
            producto = {
                id: id,
                title: title,
                description: description,
                price: price,
                thumbnail: thumbnail,
                code: code,
                stock: stock
            }
            this.products.push(producto)

            //Actualizo el cambio en la db
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 4))
        } catch (error) {
            console.log("Error al editar producto")            
        }

    }

    async getIdProducts() {
        try {
            const ultimoId = await fs.promises.readFile("./db/idProducts.txt", { encoding: "utf-8" })
            return ProductManager.idProducts = parseInt(ultimoId)

        } catch (error) {
            console.log("Error al traer el ultimo id de la DB")
        }
    }

}

module.exports = ProductManager;




