import {afterEach, before, describe, it} from "mocha"
import {expect} from "chai"
import supertest from "supertest"
import mongoose from "mongoose"
import { config } from "../src/config/config.js"


const requester = supertest("http://localhost:8080")
// let resultado = await requester.get("/api/products")
// console.log(resultado)
let {body, status, ok, headers} = await requester.get("/api/products")
console.log(body)

const conectionDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URL, {dbName: config.DB_NAME}
    )
    logger.debug("DB online..")
    console.log(config.DB_NAME)
        
    } catch (error) {
        logger.debug("Error al conectar a la DB")        
    }
}
conectionDB()

describe("Tests del proyecto ecommerce", function(){
    this.timeout(10000)

    //Aca van los before y aftereach

    describe("Test productRouter", function(){

        it("ruta GET api/products, que devuelve todos los productos", async ()=> {
            let {body} = await requester.get("/api/products")
            expect(Array.isArray(body.payload)).to.be.true
        })

    })
})

