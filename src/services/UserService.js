import { UsersManagerMongo as UserManager } from "../dao/UsersManagerMongo.js"

class UserService {
    constructor(dao) {
        this.dao = dao
    }

    checkEmail = async (email) => {
        return this.dao.getBy(email)
    }

    updatePassword = async (id, hashedPassword) => {
        console.log("Nueva contraseña hasheada:" + hashedPassword)
        return this.dao.update(id, hashedPassword)
    }
}

//Podria ir al controlador y generar mi instancia de esta clase ahi pero para no tener que tocar nunca nada ahi si despues tengo que hacer algun cambio, lo que hago es instanciar mi ProductService aca y exportar esa instancia a la que ya le paso el dao como argumento
export const userService = new UserService(new UserManager()) 