
class ProductManager {
    //Atributos
    products
    static idProducts = 0 //Variable Global

    constructor() {
        this.products = [] //Array con todos los productos       
    }

    //Metodos
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
        //id autoincremental
        ProductManager.idProducts += 1
        const id = ProductManager.idProducts

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
    }

    getProducts() {
        //devolver todos los productos
        return this.products
    }

    getProductById(id) {
       const producto = this.products.find(elem => elem.id == id)
       if (producto) {
        console.log(producto)
       } else {
        console.error("Not found")
       }
    }
}

const producto = new ProductManager()
producto.addProduct("taladro", "Gamma", 3000, "./img1", "awsdf23", 15)
producto.addProduct("laptop", "hp", 3000, "./img1", "awsdf23", 10)
producto.addProduct("reposera", "mor", 9000, "./img1", "awsdf29", 6)
console.log(producto.getProducts())
