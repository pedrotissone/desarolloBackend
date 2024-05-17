
let agregar = async (pid) => {
    let inputCarrito = document.getElementById("carrito")
    let cid = inputCarrito.value
    console.log(cid)
    console.log(pid)

    let respuesta = await fetch(`/api/carts/${cid}/products/${pid}`, {method: "post"})

}

function modificarPageQuery(url, amount) { //Esta funcion la tengo que modificar para mantener el resto de las queries al cambiar de pagina
    const urlObject = new URL(url);
    const searchParams = new URLSearchParams(urlObject.search);

    // Obtener el valor actual de la página
    let currentPage = parseInt(searchParams.get("page")) || 1;

    // Sumar o restar según corresponda
    currentPage += amount;

    // Establecer el nuevo valor de página
    searchParams.set("page", currentPage);

    // Establecer el nuevo parámetro de búsqueda en la URL
    urlObject.search = searchParams.toString();

    return urlObject.toString();
}
