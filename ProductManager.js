const fs = require("fs")
const path = require("path")

class ProductManager {
    //Atributos
    products
    path
    static idProducts //Variable Global, iniciada en 0 en DB

    constructor() {
        this.products = [] //Array con todos los productos
        // this.path = __dirname + "/db/db.json"
        this.path = path.join(__dirname, "db", "db.json") //normalizo la ruta para cualquier OS con el modulo path
    }

    //                              METODOS
    

    //1) Agregar nuevo producto a DB (SOLO AGREGAR USANDO ESTA FUNCION)
    addProduct(title, description, price, thumbnail, code, stock) {
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
        this.getIdProducts()

        //id autoincremental
        ProductManager.idProducts += 1
        const id = ProductManager.idProducts

        //Actualizo el valor de idProducts en la DB
        fs.writeFileSync("./db/idProducts.txt", id.toString())

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
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4))
    }

    //2) Devolver todos los productos de la DB
    getProducts() {
        //1)Primero los traigo de mi db
        const lecturaDeProductosEnDB = fs.readFileSync(this.path, { encoding: "utf-8" })
        
        //2)Parseo de productos para agregar al array products
        let productosParseados
        try {
            productosParseados = JSON.parse(lecturaDeProductosEnDB)
            
        } catch (error) {
            console.log("Error al parsear la DB")
            return         
        }
        
        if (Array.isArray(productosParseados)) {
            for(let i = 0; i < productosParseados.length; i++ ) {
                this.products.push(productosParseados[i])
            }
        } else {
            console.log("Error, la DB no tiene un formato de array valido")
            return
        }
        let sortedArr = this.products.sort((a, b) => a.id - b.id)
        console.log(sortedArr)
    }


    //3) Consultar productos por id
    getProductById(id) {
        const producto = this.products.find(elem => elem.id == id)
        if (producto) {
            console.log(producto)
            return producto
        } else {
            console.error("Not found")
        }
    }

    async deleteProduct(id) {
        let producto = this.products.find(elem => elem.id == id)
        if (producto) {
            let index = this.products.indexOf(producto)
            this.products.splice(index, 1)
            console.log("Producto eliminado con exito")
            //Actualizo el cambio en la db
            fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4))
            return
        } else {
            console.log("El id del producto que desea eliminar no existe")

        }
    }

    updateProduct(id, title, description, price, thumbnail, code, stock) {
        let producto = this.products.find(elem => elem.id == id)
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
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4))
    }

    getIdProducts() {
        try {
            const ultimoId = fs.readFileSync(__dirname + "/db/idProducts.txt", { encoding: "utf-8" })
            return ProductManager.idProducts = parseInt(ultimoId)
            
        } catch (error) {
            console.log("Error al traer el ultimo id de la DB")            
        }
    }
}

module.exports = ProductManager;




