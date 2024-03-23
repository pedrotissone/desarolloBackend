const express = require("express")
const fs = require("fs")
const Producto = require("../testing")


const PORT = 3000

const app = express()

app.get("/", (req, res) => {
    res.send("Home page")
})

app.get("/products", async (req, res) => {

    let resultado = await Producto.getProducts()

    //         Query Params
    let limit = parseInt(req.query.limit)
    if (limit) {
        let productosLimitados = resultado.slice(0, limit)        
        return res.json(productosLimitados)
    }
    
    res.json(resultado)
})

app.get("/products/:pid", async (req, res) => { //PARAMS

    await Producto.getProducts()
    
    let id = parseInt(req.params.pid)
    let resultado = await Producto.getProductById(id)
    res.json(resultado)
})


app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`))

//01:44:30 