
let agregar = async (pid) => {
    let inputCarrito = document.getElementById("carrito")
    let cid = inputCarrito.value
    console.log(cid)
    console.log(pid)

    let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`, {method: "post"})

}

function modificarPageQuery(url, amount) {
    return url.replace(/(page=) (\d+)/, (match, p1, p2) => {
        const newValue = parseInt(p2) + amount //Sumo o resto segun corresponda
        return p1 + newValue
    })

}