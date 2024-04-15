//                  F R O N T  -  E N D
Swal.fire({
    title: "Identifíquese",
    input: "text",
    text: "Ingrese su nikname",
    inputValidator: (value) => {
        return !value && "Debe ingresar su nombre"
    },
    allowOutsideClick: false
}).then(datos => {//Todo el código va ir dentro de este then, sino debería armarlo distinto con async/await
    let nombre = datos.value
    document.title = nombre

    //Creo variables para conectarme con las etiquetas HTML
    let inputMensaje = document.getElementById("mensaje")
    let divMensajes = document.getElementById("mensajes")
    inputMensaje.focus()

    //1) Disparo peticion de conexion
    const socket = io()
    socket.emit("id", nombre)

    socket.on("nuevoUsuario", nombre => {
      Swal.fire({
          text: `${nombre} se ha conectado...!!!`,
          toast: true,
          position: "top-right"
      })     
    })

    socket.on("mensajesPrevios", mensajes => {//Esto es un array
        mensajes.forEach(m => {
            divMensajes.innerHTML += `<span class="mensaje"><strong>${m.nombre}</strong> dice: <i>${m.mensaje}</i></span><br>`
            //Linea para que siempre me muestre el fondo del div y así evitar el scroll
            divMensajes.scrollTop = divMensajes.scrollHeight           
        });
    })

    socket.on("saleUsuario", nombre => {
        divMensajes.innerHTML += `<span class="mensaje"><strong>${nombre} ha salido del chat...:( </strong></span><br>`
        divMensajes.scrollTop = divMensajes.scrollHeight
    })

    inputMensaje.addEventListener("keyup", e => {
        e.preventDefault()
        //console.log(e, e.target.value)
        if(e.code === "Enter" && e.target.value.trim().length > 0){ //Validación para no enviar solo espacios en blanco
            socket.emit("mensaje", nombre, e.target.value.trim() )
            e.target.value = ""
            e.target.focus()
        }
    })

    socket.on("nuevoMensaje", (nombre, mensaje) => {
        divMensajes.innerHTML += `<span class="mensaje"><strong>${nombre}</strong> dice: <i>${mensaje}</i></span><br>`
        divMensajes.scrollTop = divMensajes.scrollHeight
    })

  })// Fin then Swal


  



  