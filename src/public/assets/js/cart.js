
const eliminar = async (cid, pid) => {
    console.log(cid)
    console.log(pid)

    let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`, {method: "DELETE"})
    let productDiv = document.getElementById(`productDiv-${cid}-${pid}`)
    productDiv.innerHTML = ""
}

const restar = async (cid, pid, quantity) => {
    // console.log(cid)
    // console.log(pid)
    // console.log(quantity)
    if (quantity == 1) {
        console.log("no se puede restar a 1")
        return
    }

    let data = {
        cantidad: -1
    }
    //Al hacer fetch tengo que configurar tambien los headers y el contenido que va a viajar en el body
    let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });    

    if(respuesta.ok) {
        console.log("cantidad actualizada")
        //Extraigo solo el json que devuelve mi api, que en este caso es la cantidad (sino me devuelve un choclo de cosas)
        let resultado = await respuesta.json()
        // console.log(resultado)
        let listQuantity = document.getElementById(`cartQuantity-${cid}-${pid}`)
        listQuantity.innerHTML = `<li id="cartQuantity-${cid}-${pid}">Cantidad: ${resultado} <button id="cartButtonRestar" onclick="restar('${cid}', '${pid}', '${resultado}')">-</button> <button id="cartButtonSumar" onclick="sumar('${cid}', '${pid}')">+</button> </li>`        
    } else {
        console.log("error al actualizar cantidad")
    }
    
}

const sumar = async (cid, pid) => {
    console.log(cid)
    console.log(pid)

    let data = {
        cantidad: 1
    }
    //Al hacer fetch tengo que configurar tambien los headers y el contenido que va a viajar en el body
    let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });    

    if(respuesta.ok) {        
        //Extraigo solo el json que devuelve mi api, que en este caso es la cantidad (sino me devuelve un choclo de cosas)
        let resultado = await respuesta.json()
        // console.log(resultado)
        let listQuantity = document.getElementById(`cartQuantity-${cid}-${pid}`)
        listQuantity.innerHTML = `<li id="cartQuantity-${cid}-${pid}">Cantidad: ${resultado} <button id="cartButtonRestar" onclick="restar('${cid}', '${pid}', '${resultado}')">-</button> <button id="cartButtonSumar" onclick="sumar('${cid}', '${pid}')">+</button> </li>`        
    } else {
        console.log("error al actualizar cantidad")
    }
}

const vaciarCarrito = async (cid) => {
    let respuesta = await fetch(`/api/carts/${cid}`, {method: "delete"})
    if (respuesta.ok) {
        const carrito = document.getElementById("cartUl")        
        carrito.innerHTML = ""
    }
}

const comprar = async (cid) => {
    let respuesta = await fetch(`/api/carts/${cid}/purchase`, {method: "post"})
    if(respuesta.ok) {
        alert("Compra realizada con exito, recibirás un email con los datos de la compra")
        window.location.href = "/"
    } else {
        alert("Se produció un error al realizar la compra")
    }
}