import { usersModel } from "./models/usersModel.js";

export class UsersManagerMongo{

    async create(usuario) {
        let nuevoUsuario = await usersModel.create(usuario)
        return nuevoUsuario.toJSON()//Transformo a JSON el usuario retornado 
    }

    async getBy(filtro={}) {
        return await usersModel.findOne(filtro).lean()
    }

}