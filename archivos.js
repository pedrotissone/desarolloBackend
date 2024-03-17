const fs = require("fs")

let rutaArchivo = "./carpetaArchivos/archivo1.txt"

let texto1 = '"Raja turrito raja" (Los Siete Locos - Roberto Arlt)'

//Crear y escribir un archivo
// fs.writeFileSync(rutaArchivo, texto1)

//Leer archivo y luego agregar contenido nuevo
// try {
//     if (fs.existsSync(rutaArchivo)) {
//         let lecturaDeArchivo = fs.readFileSync(rutaArchivo, { encoding: "utf-8" })
//         console.log(lecturaDeArchivo)
//         //Agrego contenido
//         fs.appendFileSync(rutaArchivo, `\n\n este contenido fue agregado con fecha ${new Date()}`)
//     }

// } catch (error) {
//     console.log(error)
// }


//Eliminar archivo
// setTimeout(() => {
//     fs.unlinkSync(rutaArchivo)
//     console.log("Archivo eliminado")
// }, 3000)



//                     FS ASINCRONO (usan callbacks)

//Crear y guardar archivo
// fs.writeFile(rutaArchivo, texto1, (error) => {
//     if (error) {
//         console.log(error)
//         return
//     } else {
//         console.log("Archivo creado y guardado")
//     }
// } )

// //Leer archivo

// fs.readFile(rutaArchivo, {encoding: "utf-8"}, (error, contenidoDelArchivo) => {
//     if (error) {
//         console.log(error)
//         return
//     } else {
//         console.log(contenidoDelArchivo)
//     }
// } )

// //Agregar contenido nuevo
// fs.appendFile(rutaArchivo, "\n\n\t Editorial Planeta", (error) => {
//     if (error) {
//         console.log(error)
//         return
//     } else {
//         console.log("Nuevo contenido agregado exitosamente")
//     }
// })

// //Eliminar archivo
// setTimeout(() => {
//     fs.unlink(rutaArchivo, (error) => {
//         if (error) {
//             console.log(error)
//             return
//         } else {
//             console.log("Archivo eliminado")
//         }
//     })
   
// }, 3000)


//                          JSON           

// let rutaArchivoJson = "./carpetaArchivos/archivo.json"
// let db = [
//     {
//         "id": 1,
//         "nombre": "Pedro",
//         "apellido": "Tissone"
//     },

//     {
//         "id": 2,
//         "nombre": "Alfonso",
//         "apellido": "Martinez"
//     }
// ]

// //Escribir un objeto (Hay que transformarlo en string primero)
// fs.writeFileSync(rutaArchivoJson, JSON.stringify(db, null, 4)) //Los argumentos null y 4 son para que no me quede en una sola linea

// let lecturaDeArchivoJson = fs.readFileSync(rutaArchivoJson, {encoding:"utf-8"})
// console.log(lecturaDeArchivoJson, typeof lecturaDeArchivoJson)
// console.log(lecturaDeArchivoJson[1].nombre) //No lo puedo trabajar asi


// //PARSEO el contenido del archivoJSON para poderlo manipular con js

// let lecturaDeArchivoJsonParseado = JSON.parse(fs.readFileSync(rutaArchivoJson, {encoding:"utf-8"}))
// console.log(lecturaDeArchivoJsonParseado, typeof lecturaDeArchivoJsonParseado)
// console.log(lecturaDeArchivoJsonParseado[1].nombre)

