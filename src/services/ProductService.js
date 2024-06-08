import { ProductManagerMongo as ProductManager } from "../dao/ProductManagerMongo"

class ProductService {
    constructor(dao) {
        this.dao = dao
    }

    getProducts = async () => {
        return this.dao.getProducts()
    }


}

//exporto e instancio mi servicio con una nuve instancia del product manager
export const ProductService = new ProductService(new ProductManager()) 