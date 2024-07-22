import { usersModel } from "./models/usersModel.js";

export class UsersManagerMongo{

    async create(usuario) {
        let nuevoUsuario = await usersModel.create(usuario)
        return nuevoUsuario.toJSON()//Transformo a JSON el usuario retornado 
    }

    async getBy(filtro={}) {
        return await usersModel.findOne(filtro).lean()
    }

    async update(id, hashedPassword) {
        //El tercer argumento es para correr validaciones de mongo y para que te muestre el documento actualizado, sino te muestra el original, así viene por defecto
        return await usersModel.findByIdAndUpdate(id, {password: hashedPassword}, { runValidators: true, returnDocument: "after" })
    }

}