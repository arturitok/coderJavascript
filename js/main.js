
/******************************************
* Clase Cliente. Constructor y dos métodos
*
* pedirDni() Pide por prompt el Dni, y veriifca qu no sea nulo y que esté en un rango
*
*pedirNombre() Pide el nombre pro prompt
*
*******************************************/
class Cliente {
    constructor(dni, nombre) {
        this.dni = dni;
        this.nombre = nombre;

    }
    pedirDni() {
        while (true) {
            this.dni = parseInt(prompt("¿Me decís tu DNI? (0 para salir-sin puntos ni comas)"));
            if (this.dni === null || this.dni === "" || this.dni === 0 || isNaN(this.dni)) {
                this.dni = 0;
                break;
            }
            else if (this.dni < 999999 || this.dni > 99999999) {
                alert("Parece que pusiste un DNI inexistente, probemos de nuevo")
            }
            else {
                break;
            }
        }
    }

    pedirNombre() {
        this.nombre = prompt("¿Me decís tu Nombre? (enter para salir)");
    }
}

/*********************************************************************************
* Class Producto. Constructor (5 atributos) y tres métodos
*
* hayStock( numero) -> Devuelve true o false si hay stock >0 a numero
*
* aplciarCompra( numero) -> recibe la cantidad a aplicar, verifica si hay stock
*                           si hay descuenta de stock, 
*                           Si no hay solo alerta.                
*
* precioFinal() Calcula el precio final del articulo aplicando los impuestos 
*
***********************************************************************************/
class Producto {
    constructor(codigo, descripcion, categoria, imagen, precio, stock) {
        this.codigo = codigo;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.imagen = imagen;
        this.precio = precio;
        this.stock = stock;
    }
    hayStock(cantidad) {
        return (this.stock >= cantidad)
    }
    aplicarCompra(cantidad) {
        if (cantidad > this.stock) {
            alert(`No hay suficiente stock. Solo quedan ${this.stock} unidades.`);
        }
        else {
            this.stock -= cantidad;
        }
    }
    precioFinal() {
        return (this.precio * 1.21)
    }
}

let arrayProductos = [];
let clientes = [];
let carrito = [];
let total = 0;
const carritoGuardado = window.localStorage;

/******************************************
* Muestra  los productos a partir del array
*******************************************/
function mostrarProductos() {
    arrayProductos.forEach((item) => {

        let precioConFormato = Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(item.precio);
        $("#productos").append(`<div class="card col-sm-4">
                                <h3 class="card-title"> ${item.descripcion}</h3>
                                <p class="card-text">  ${precioConFormato}</p>
                                <img class="img-fluid" src=${item.imagen} >
                                <button id="btnAgregar${item.codigo}" class="btn-primary" clave="${item.codigo}">Agregar</button>
                                </div>`);

        $(`#btnAgregar${item.codigo}`).attr('clave', item.codigo);
        // $(`#btnAgregar${item.codigo}`).on('click', () => agregarCarrito());
        $(`#btnAgregar${item.codigo}`).on('click', agregarCarrito(item.codigo));
    });
}

/*******************************************************************
* Function callback para agregar a los botones y llenar el carrito
******************************************************************/
function agregarCarrito(codigo) {
    return function (e) {
        carrito.push(codigo.toString());
        // Calculo el total
        sumarCarrito();
        // Actualizamos el carrito 
        mostrarCarrito();
        //Actualizar el local storage
        guardarCarrito();

        mostrarMensaje("Agregaste un artículo al carrito");
    }
}

/********************************************
* Muestra los articulos en el carrito 
********************************************/
function mostrarCarrito() {
    // limpiar el carrito
    $('#listaCarrito').remove();
    // Que solo haya una linea por articulo
    const carritoUnico = [...new Set(carrito)];

    // Generar las lineas desde el carrito
    carritoUnico.forEach((item) => {

        // recuperamos el codigo desde el array
        const elItem = arrayProductos.filter((itemProductos) => {
            // es el mismo código? solo debería haber uno
            return parseInt(itemProductos.codigo) === parseInt(item);
        });
        // Contamos cuantas veces está el articulo en el carrito
        const cantidadUnidadesItem = carrito.reduce((total, itemId) => {
            // Si es el mismo articulo se suma al total, sino nada
            return parseInt(itemId) === parseInt(item) ? total += 1 : total;
        }, 0);

        // Armamos el nodo para la línea del carrito
        let auxPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(elItem[0].precio);
        $("#carrito").append(`<div id="listaCarrito"></div>`)
        $("#listaCarrito").append(`<li class="list-group-item text-right mx-2" id="itemLista">
                                    ${cantidadUnidadesItem} x ${elItem[0].descripcion} - ${auxPrecio}
                                    <button id="btnEliminar${elItem[0].codigo}" class="btn btn-success mx-2" >Eliminar</button>
                                </li>`);
        $(`#btnEliminar${elItem[0].codigo}`).on('click', eliminarItem(elItem[0].codigo));

    });
}

/*********************************************
* Eliminar  un elemento del carrito
*********************************************/
function eliminarItem(codigo) {
    return function (e) {
        carrito = carrito.filter((codigoCarrito) => {
            return parseInt(codigoCarrito) !== parseInt(codigo);
        })   // Calculo el total

        mostrarCarrito();
        //Actualizar el local storage
        guardarCarrito();
        // sumar de nuevo los precios
        sumarCarrito();

        mostrarMensaje("Eliminaste un artículo del carrito")
    }
}

/*******************************************************
* Suma los precios teniendo en cuenta si hay repetidos
********************************************************/
function sumarCarrito() {
    // poner en 0 el total
    total = 0;
    // recorrer el array del carrito
    carrito.forEach((item) => {
        // buscar el precio de cada elemento
        const itemPrecio = arrayProductos.filter((itemProducto) => {
            return parseInt(itemProducto.codigo) === parseInt(item);
        });
        total = total + itemPrecio[0].precio;
    });
    // Mostrar el nuevo total
    $('#totalCarrito').text(Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(total.toFixed(2)));
}

/*********************************************************
* vacía el carrito y lo muestra de nuevo
********************************************************/
function vaciarCarrito() {
    // Limpiamos los productos guardados
    carrito = [];
    // mostrar  los cambios
    $('#listaCarrito').remove();

    mostrarCarrito();

    sumarCarrito();
    // Borrar del storage
    localStorage.clear();

    mostrarMensaje("Vaciaste el carrito");

}

/*********************************************************
* Guarda el carrito en el local storage usando stringify
********************************************************/
function guardarCarrito() {
    carritoGuardado.setItem('carrito', JSON.stringify(carrito));
}

/*********************************************************
* recupera el carrito desde el localstorage
********************************************************/
function recuperarCarrito() {
    // ¿hay un carrito guardado en LocalStorage?
    if (carritoGuardado.getItem('carrito') !== null) {
        // Recupera el carrito desde el json
        carrito = JSON.parse(carritoGuardado.getItem('carrito'));
    }
}


/*********************************************************
* leer los porductos desde un JSON usando fetch
********************************************************/

function cargarProductos() {
    fetch('./data/articulos.json')
        .then((response) => response.json())
        .then((json) => {
            json.forEach((item) => {
                arrayProductos.push(new Producto(item.codigo, item.descripcion, item.categoria, item.imagen, item.precio, item.stock));
            })
            mostrarProductos();
            recuperarCarrito();
            sumarCarrito();
            mostrarCarrito();
        })
        .catch(error => {
            $("#productos").append(`
    <p style="width: 100%; text-align: center;">Error al cargar los productos. Correr la aplicación desde un server(por ejemplo liveserver)</p>`)
        });
}

/*
/*********************************************************
* Leer usando XMLHttpRequest
********************************************************

function cargarProductos() {
    var request = new XMLHttpRequest();
    request.open('GET', 'data/articulos.json');
    request.responseType = 'json';
    request.send();
    request.onload = function (db) {
        db = request.response;
        for (let item of db) {
            arrayProductos.push(new Producto(item.codigo, item.descripcion, item.categoria, item.imagen, item.precio, item.stock));
        }
        mostrarProductos();
        recuperarCarrito();
        sumarCarrito();
        mostrarCarrito();
    }
}
*/
/*
/*********************************************************
* Otra manera de leer sin usar fetch. la dejo para efectos de estudio
********************************************************

function cargarProductos(callback) {
    $.getJSON('./data/articulos.json', function (respuesta, estado) {
        if (estado === "success") {
            const db = respuesta;
            for (let item of db) {
                arrayProductos.push(new Producto(item.codigo, item.descripcion, item.categoria, item.imagen, item.precio, item.stock));
            }
            mostrarProductos();
            recuperarCarrito();
            sumarCarrito();
            mostrarCarrito();
        }
    })
        .done(callback)
        .fail(function () {
            $("#productos").append(`
    <p style="width: 100%; text-align: center;">Error al cargar los productos</p>`)
        })
}
*/

function mostrarMensaje(mensaje) {
    $("#infoText").text(mensaje)
    let $message = $("#infoText");

    $message.slideToggle("fast");
    setTimeout(() => {
        $message.slideToggle("fast");
    }, 2000);

}
/*********************************************************
* Agregar la funcion al evento click del elemento
********************************************************/
$('#botonVaciar').on('click', vaciarCarrito);

cargarProductos();

