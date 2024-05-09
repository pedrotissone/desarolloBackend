
let agregar = async (pid) => {
    let inputCarrito = document.getElementById("carrito")
    let cid = inputCarrito.value
    console.log(cid)
    console.log(pid)

    let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`, {method: "post"})

}