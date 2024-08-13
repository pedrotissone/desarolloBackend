import {afterEach, before, describe, it} from "mocha"
import {expect} from "chai"
import supertest from "supertest"
import mongoose, { isValidObjectId } from "mongoose"
import { config } from "../src/config/config.js"
import jwt from "jsonwebtoken"
import { response } from "express"


const requester = supertest("http://localhost:8080")


describe("TESTS DEL PROYECTO DESARROLLO BACKEND", async function(){
    this.timeout(50000)
   
    describe("Tests del productRouter, metodo GET a api/products", async function(){
        
        it("Se tienen que devolver todos los productos con un status code 200", async ()=> {
            let {statusCode} = await requester.get("/api/products")
            expect(statusCode).to.be.equal(200)            
        })
        it("El body es un array con una propiedad payload", async ()=> {
            let {body} = await requester.get("/api/products")
            expect(Array.isArray(body.payload)).to.be.true
        })
        it("El body tiene una propiedad status que es igual a 'success'", async ()=> {
            let {body} = await requester.get("/api/products")
            expect(body.status).to.be.equal("success")
        })
        it("Cada objeto del array debe tener una propiedad _id valida para mongo", async ()=> {
            let {body} = await requester.get("/api/products")
            let arr = body.payload
            arr.forEach(item => {
                expect(isValidObjectId(item._id)).to.be.true
            })
        })
    })

    describe("Tests del productRouter, metodo POST a api/products", async function(){
        //Variables globales de mi describe
        let productId
        let nombreCookie
        let valorCookie

        it("Primero realizo login con admin y obtengo como respuesta un status code 200 y una cookie llamada codercookie", async ()=> {
            let usuario = {
                email: "adminCoder@coder.com",
                password: "adminCod3r123"
            }
            let {body, header, statusCode} = await requester.post("/api/sessions/login").send(usuario)
            nombreCookie = header["set-cookie"][0].split("=")[0]
            let valorCookieEnBruto = header["set-cookie"][0].split("=")[1]
            //Limpio la cookie para que me quede el dato que necesito limpio (el token)
            valorCookie = valorCookieEnBruto.split(";")[0]
            
            expect(statusCode).to.be.equal(200)      
            expect(nombreCookie).to.be.equal("codercookie")                      
        })        

        it("Al crear un nuevo producto debo obtener como respuesta un status code 200 y me tiene que devolver un objeto con 11 propiedades", async ()=> {
            let testProduct = {
                title: "producto para test",
                description: "metalico",
                price: 100000,
                thumbnail: "/img",
                code: "1233332",
                stock: 50,
                category: "herramienta",
                status: "ok"
            }

            let {body, statusCode} = await requester.post("/api/products")
                                    .set("Cookie", `${nombreCookie}=${valorCookie}`)//Seteo manualmente la cookie para peticionar a los endpoints protegidos porque supertest no las conserva
                                    .field("title", testProduct.title)
                                    .field("description", testProduct.description)
                                    .field("price", testProduct.price)
                                    .attach("thumbnail", "./test/sinstock.jpg")
                                    .field("code", testProduct.code)
                                    .field("stock", testProduct.stock)
                                    .field("category", testProduct.category)
                                    .field("status", testProduct.status)

            productId =body._id            
              
            expect(statusCode).to.be.equal(200)
            expect(body).to.be.an('object')
            expect(Object.keys(body)).to.have.lengthOf(11)                    
        })

        it("Obtengo un status code 400 al querer crear otro producto con el mismo codigo que el anterior", async ()=> {
            let testProduct = {
                title: "producto para test",
                description: "metalico",
                price: 100000,
                thumbnail: "/img",
                code: "1233332",
                stock: 50,
                category: "herramienta",
                status: "ok"
            }

            let {body, statusCode} = await requester.post("/api/products")
                                    .set("Cookie", `${nombreCookie}=${valorCookie}`)//Seteo manualmente la cookie para peticionar a los endpoints protegidos porque supertest no las conserva
                                    .field("title", testProduct.title)
                                    .field("description", testProduct.description)
                                    .field("price", testProduct.price)
                                    .attach("thumbnail", "./test/sinstock.jpg")
                                    .field("code", testProduct.code)
                                    .field("stock", testProduct.stock)
                                    .field("category", testProduct.category)
                                    .field("status", testProduct.status)
            
              
            expect(statusCode).to.be.equal(400)
        })
        
        it ("Elimino el producto creado", async () => {
            let { statusCode } = await requester.delete(`/api/products/${productId}`)
                                            .set("Cookie", `${nombreCookie}=${valorCookie}`)
            
            expect(statusCode).to.be.equal(200)
        })        

    })


    describe("Test del cartRouter Metodo POST a /:cid/products/:pid", async function(){
        //Variables globales de mi describe
        let nombreCookie
        let valorCookie
        let carrito

        it("Primero realizo login con usuario y obtengo como respuesta un status code 200 y una cookie llamada codercookie", async ()=> {
            let usuario = {
                email: "jopirusinol@gmail.com",
                password: "123"
            }
            let {body, header, statusCode} = await requester.post("/api/sessions/login").send(usuario)
            nombreCookie = header["set-cookie"][0].split("=")[0]
            let valorCookieEnBruto = header["set-cookie"][0].split("=")[1]
            //Limpio la cookie para que me quede el dato que necesito limpio (el token)
            valorCookie = valorCookieEnBruto.split(";")[0]
            
            expect(statusCode).to.be.equal(200)      
            expect(nombreCookie).to.be.equal("codercookie")                      
        })
        
        it("Recupero los datos del usuario logeado de la ruta /api/sessions/current y obtengo el id del carrito", async () => {
            let {body} = await requester.get("/api/sessions/current")
                                            .set("Cookie", `${nombreCookie}=${valorCookie}`)
            
            carrito = body.carrito //asigno el id del carrito a mi variable global del describe            
        })

        it("Agrego un producto al carrito del usuario y la respuesta me devuelve un status code 200 y un objeto", async () => {
            let {body, statusCode} = await requester.post(`/api/carts/${carrito}/products/66a0d9f4dadeecd5b88cb900`)
                                                            .set("Cookie", `${nombreCookie}=${valorCookie}`)

            expect(statusCode).to.be.equal(200)
            expect(body).to.be.an('object')
        })

        it("Obtengo un status code 400 al querer agregar un producto del cual el usuario es owner", async () => {
            let {body, statusCode} = await requester.post(`/api/carts/${carrito}/products/66a0d8dddadeecd5b88cb8d9`)
                                                            .set("Cookie", `${nombreCookie}=${valorCookie}`)

            expect(statusCode).to.be.equal(400)            
        })
    })





})

