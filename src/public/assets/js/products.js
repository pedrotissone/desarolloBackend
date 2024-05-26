
let agregar = async (pid) => {
    let inputCarrito = document.getElementById("carrito")
    let cid = inputCarrito.value
    console.log(cid)
    console.log(pid)

    let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`, {method: "post"})

}

function getQueryParams() { //Obtengo la url
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}

function changePage(page) { //Modifico solo el query page de la url
    const params = getQueryParams();
    params.page = page;
    const queryString = new URLSearchParams(params).toString();
    window.location.href = './products?' + queryString;
}
