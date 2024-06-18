import { TicketManagerMongo as TicketManager } from "../dao/TicketManagerMongo.js"

class TicketService {
    constructor(dao) {
        this.dao = dao
    }

    createTicket = async (obj) => {
        let resultado = await this.dao.create(obj)
        return resultado
    }
}

export const ticketService = new TicketService(new TicketManager())