
//VARIABLES GLOBALES
let datosDeCompra //Acá están los productos facturables, productos sin stock, etc
let amount
let cartId


const obtenerDatosDeCompra = async () => {
    const currentUrl = window.location.href; // Obtiene la URL actual completa
    const url = new URL(currentUrl); // Crea un nuevo objeto URL con la URL actual
    const pathSegments = url.pathname.split('/'); // Divide la ruta de la URL en segmentos
    let cid = pathSegments[2]
    //Le doy a mi variable global el valor del cid
    cartId = cid

    let respuesta = await fetch(`/api/carts/${cid}/obtenerDatosDeCompra`, { method: "get" })
    let data = await respuesta.json()

    let monto = document.getElementById("mediosDePago_divTotal_monto")
    if (data.products.length == 0) {//Si no hay productos facturables le doy directamente el valor de 0 al total y me va a servir para la validacion de los medios de pago
        monto.textContent = "0"
        //Le doy a mis variables globales amount, el valor del monto total (asi evito manipulación del mismo a traves de html) y a datosDeCompra el valor de data
        amount = 0
        datosDeCompra = data
    } else {
        monto.textContent = data.amount
        //Le doy a mis variables globales amount, el valor del monto total (asi evito manipulación del mismo a traves de html) y a datosDeCompra el valor de data
        amount = data.amount
        datosDeCompra = data
    }

    if (data.products.length > 0) {
        let listadoDeProductos = document.getElementById("mediosDePago_divProducts_ul")
        listadoDeProductos.textContent = "Productos seleccionados"
        data.products.forEach(elem => {
            // Crea una nueva etiqueta <li>
            const li = document.createElement("li")
            // Asigna el texto del elemento al <li>
            li.textContent = `${elem.producto.title}, Cantidad: ${elem.quantity}`
            // Agrega el <li> al <ul>
            listadoDeProductos.appendChild(li);
        })
    }

    if (data.productosRestantes.length > 0) {
        let listadoProductosSinStock = document.getElementById("mediosDePago_divProducts_sinStock")
        const h3 = document.createElement("h3")
        h3.textContent = "ATENCIÓN, NO HAY STOCK SUFICIENTE DE LOS SIGUIENTES PRODUCTOS"
        listadoProductosSinStock.appendChild(h3)

        data.productosRestantes.forEach(elem => {
            const li = document.createElement("li")
            // Asigna el texto del elemento al <li>
            li.textContent = `${elem.producto.title}, Cantidad: ${elem.quantity}`
            // Agrega el <li> al <ul>
            listadoProductosSinStock.appendChild(li);
        })
    }
    console.log(data)
}
//                                                          EJECUTO FUNCIÓN!!!!!!!!!!!!!!!!!!
obtenerDatosDeCompra()

//                                                                  S T R I P E

//1) Me conecto a la plataforma de Stripe (Creo que puedo utilizar Stripe del script que tengo en el frontend, donde me conecté a la libreria, xq no lo tengo importado)
const stripe = Stripe("pk_test_51Pvx99I4zZn1LBXUhAwg3BEpTz4hODNeB6b4WPTh27PxMzWIyvpZ1KZcUVpDVMcV70qTv05qguoWEiuYagG49k4F00TaLMLZ3S") //Clave publicable

//VARIABLE GLOBAL
let elements


const cargarMediosDePago = async () => {
    let importe = amount
    if (amount < 1 || isNaN(importe)) {
        alert("Error en el importe")
        return
    }

    // 2) Solicitar al back que genere un payment intent enviando el importe
    const respuesta = await fetch("/api/carts/create-payment-intent", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ importe })
    })

    let datos = await respuesta.json()
    console.log(datos)

    //5) Generar el "elements con los medios de pago"
    elements = stripe.elements({ clientSecret: datos.paymentIntent.client_secret })//Inicializo elements
    const paymentElement = elements.create("payment")
    paymentElement.mount("#payment-element")
}


//6), enviar a Sripe los datos de tarjeta seleccionados
const pagar = async () => {
    const resultado = await stripe.confirmPayment(
        {
            elements,
            confirmParams: {
                return_url: `http://localhost:8080/handlebars/${cartId}/mediosDePago`
            }
        }
    )

    //Solo si hay algun error se ejecutará lo siguiente
    document.getElementById("resultado").textContent = resultado.error.message
}


const mostrarResultado = async () => {
    //7) Verificar el estado del pago y mostrarlo (AGREGO MODIFICAR STOCK EN DB Y ENVIAR EMAIL EN CASO DE PAGO EXITOSO)
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
    console.log(paymentIntent)
    if (paymentIntent.status = "succeeded") {
        let respuesta = await fetch(`/api/carts/${cartId}/finalizarCompra`, {method: "post"})
        let data = await respuesta.json()
        console.log(data)
        alert("Pago realizado con éxito, recibirás un  correo electrónico con el detalle de tu compra")        
        window.location.href = "/"
    } else {
        document.getElementById("resultado").textContent = resultado.error.message
    }
}
//Solo se ejecuta la funcion si existe el parametro requerido en la URL
let params = new URLSearchParams(location.search)
let clientSecret = params.get("payment_intent_client_secret")

if (clientSecret) {
    mostrarResultado(clientSecret)
}



