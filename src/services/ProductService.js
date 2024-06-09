import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo"
//NOTA: La capa de servicios es el nexo entre controller y dao, esta capa es la que se va a conectar con el dao y podes aprovecharla para agregarle a los metodos tradicionales de crud que hay en el dao, nuevas funcionalidades o caracteristicas para ajustarlos a las necesidades especificas del proyecto (Ej: te traes todos los productos(crud) y luego los filtras en la capa de servicios o los modificas de x forma antes de devolverlo)

class ProductService {
    constructor(dao) {
        this.dao = dao
    }

    getProducts = async () => {
        return this.dao.getProducts()
    }


}

//Podria ir al controlador y generar mi instancia de esta clase ahi pero para no tener que tocar nunca nada ahi si despues tengo que hacer algun cambio, lo que hago es instanciar mi ProductService aca y exportar esa instancia a la que ya le paso el dao como argumento
export const ProductService = new ProductService(new ProductManager()) 