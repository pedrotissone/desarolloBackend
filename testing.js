import ProductManager from "./src/dao/ProductManager.js"

const Producto = new ProductManager() // Instancio mi clase para trabajar

//1)SIEMPRE llamar primero a la funcion getProducts(), sino no funcionan las validaciones.

//2) A continuacion puedo agregar mas productos, editarlos o eliminarlos, pero debo hacerlo dentro de la funcion entorno si voy a ejecutar varias operaciones una detras de otra para ordenar el orden de ejecucion

// Producto.addProduct("Martillo", "Stanley", 3000, "./img1", "001", 10, "herramientas", true)
// Producto.addProduct("Radio", "Phillips", 3000, "./img1", "002", 10, "electronica", true)
// Producto.deleteProduct(2)
// Producto.updateProduct(1,"Notebook", "Hp", 3000, "./img1", "003", 10, "electronica", true)
// Producto.getProductById(1)

//ENTORNO PARA MANEJAR EL ORDEN DE EJECUCION DE OPERACIONES ASYNCRONAS!!!
let executeAsyncFunctions = async () => {
    await Producto.getProducts()
    // await Producto.addProduct("Taladro", "Gamma", 3000, "./img1", "004", 15, "herramientas", true)
    // await Producto.addProduct("Reposera", "Mor", 9000, "./img1", "005", 6, "aire libre", true)
    // await Producto.addProduct("Amoladora", "Stanley", 3000, "./img1", "006", 10, "herramientas", true)
    // await Producto.updateProduct(2,"Notebook", "Hp", 3000, "./img1", "007", 10, "electronica", true)
    // await Producto.deleteProduct(3)
    // await Producto.deleteProduct(2)
}

// executeAsyncFunctions()


//                                  P O P U L A T E!!!!

//Estructura del schema cart para usar con populate

// productos: {
//     [
//         {
//             producto: {type: mongoose.Types.ObjectId, ref: "products"}, //Aca indico nombre del Modelo/coleccion para popuate
//             quantity: {type: Number}
//         }
//     ]
// }

// export {Producto};