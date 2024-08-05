import { CartManagerMongo as CartManager } from "../dao/CartManagerMongo.js"

class CartService {
    constructor(dao) {
        this.dao = dao
    }

    getCartById = async (id) => {
        return this.dao.getCartById(id)
    }

    createCart = async (obj) => {        
        return this.dao.createCart(obj)
    }

    addToCart = async (cid, productos) => {
        return this.dao.addToCart(cid, productos)
    }

    updateQuantity = async (cid, pid, nuevaCantidad) => {
        return this.dao.updateQuantity(cid, pid, nuevaCantidad)
    }

    deleteProductInCart = async (cid, pid) => {
        return this.dao.deleteProductInCart(cid, pid)
    }

    deleteCart = async (id) => {
        return this.dao.deleteCart(id)
    }




}

export const cartService = new CartService(new CartManager())