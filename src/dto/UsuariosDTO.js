export class UsuariosDTO {
    constructor(usuario) {
        this.nombre = usuario.nombre             
        this.email = usuario.email
        this.rol = usuario.rol
        this.carrito = usuario.carrito
    }
}
