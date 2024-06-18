import {ticketModel} from "./models/ticketModel.js"

export class TicketManagerMongo {

    async create(obj) {        
        return await ticketModel.create(obj)
    }
}
