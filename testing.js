const ProductManager = require("./ProductManager")

const Producto = new ProductManager()

//1)Cargamos un par de productos primero a la base de datos SOLO USAR UNA VEZ! (DESPUES SOLO AGREGAR LUEGO DE LLAMAR A GETPRODUCTS())
// Producto.addProduct("Taladro", "Gamma", 3000, "./img1", "awsdf23", 15)
// Producto.addProduct("Reposera", "Mor", 9000, "./img1", "awsdf29", 6)

//2)Traigo los productos de la DB (NO AGREGAR SIN ANTES TRAER LOS PRODUCTOS O NO FUNCIONAN LAS VALIDACIONES)
Producto.getProducts()

//3) A continuacion puedo agregar mas productos, editarlos o eliminarlos.

// Producto.addProduct("Martillo", "Stanley", 3000, "./img1", "awds", 10)
// Producto.addProduct("Navaja", "Stanley", 3000, "./img1", "awdssss", 10)
// Producto.deleteProduct(4)
// Producto.updateProduct(1,"Notebook", "Hp", 3000, "./img1", "awsdf20", 10)
// Producto.getProductById(2)
