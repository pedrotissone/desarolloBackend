const middleware1 = (req, res,next) => {
    console.log(`Paso por middleware1 - url: ${req.url} - metodo: ${req.method}`)
    next()
}

const middleware2 = (req, res,next) => {
    console.log(`Paso por middleware2`)
    next()
}

const middleware3 = (req, res,next) => {
    console.log(`Paso por middleware3`)
    next()
}



export {middleware1, middleware2, middleware3};