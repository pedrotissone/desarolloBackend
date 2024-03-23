const ProductManager = require("./ProductManager")


const Producto = new ProductManager()

//1)SIEMPRE llamar primero a la funcion getProducts(), sino no funcionan las validaciones.

//2) A continuacion puedo agregar mas productos, editarlos o eliminarlos, pero debo hacerlo dentro de la funcion entorno si voy a ejecutar varias operaciones una detras de otra para ordenar el orden de ejecucion

// Producto.addProduct("Martillo", "Stanley", 3000, "./img1", "001", 10)
// Producto.addProduct("Radio", "Stanley", 3000, "./img1", "002", 10)
// Producto.deleteProduct(2)
// Producto.updateProduct(1,"Notebook", "Hp", 3000, "./img1", "003", 10)
// Producto.getProductById(1)

//ENTORNO PARA MANEJAR EL ORDEN DE EJECUCION DE OPERACIONES ASYNCRONAS!!!
let executeAsyncFunctions = async () => {
    await Producto.getProducts()
    await Producto.addProduct("Taladro", "Gamma", 3000, "./img1", "004", 15)
    await Producto.addProduct("Reposera", "Mor", 9000, "./img1", "005", 6)
    await Producto.addProduct("Martillo", "Stanley", 3000, "./img1", "006", 10)
    // await Producto.updateProduct(2,"Notebook", "Hp", 3000, "./img1", "007", 10)
    // await Producto.deleteProduct(3)
    // await Producto.deleteProduct(2)
}
// executeAsyncFunctions()

module.exports = Producto;