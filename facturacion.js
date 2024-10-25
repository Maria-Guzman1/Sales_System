import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAD7USPTMS7uuuqmVDeGPnZw54fAo8TMIA",
    authDomain: "sistema-de-ventas-ef94d.firebaseapp.com",
    projectId: "sistema-de-ventas-ef94d",
    storageBucket: "sistema-de-ventas-ef94d.appspot.com",
    messagingSenderId: "495607998971",
    appId: "1:495607998971:web:3277abae25304c3185c35e"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a los elementos del DOM
const nitInput = document.getElementById("nit");
const nombreCliente = document.getElementById("nombreCliente");
const clientePuntosElement = document.getElementById("clientePuntos");
const productoInput = document.getElementById("producto");
const agregarProductoButton = document.getElementById("agregarProducto");
const facturaTableBody = document.querySelector('#facturaTable tbody');
const totalFacturaElement = document.getElementById("totalFactura");
const descuentoFacturaElement = document.getElementById("descuentoFactura");
const totalConDescuentoElement = document.getElementById("totalConDescuento");
const finalizarFacturaButton = document.getElementById("finalizarFactura");

// Array para almacenar los productos seleccionados en la factura
let productosFactura = [];

// Cargar productos en el select
async function cargarProductos() {
    const querySnapshot = await getDocs(collection(db, "Productos"));
    querySnapshot.forEach((doc) => {
        const producto = doc.data();
        const option = document.createElement("option");
        option.value = doc.id; // Asumimos que el ID del documento es el código del producto
        option.textContent = `${producto.nombre} - Q.${producto.precio.toFixed(2)}`; 
        productoInput.appendChild(option);
    });
}

// Evento para buscar cliente por NIT
nitInput.addEventListener("change", async function() {
    const nit = nitInput.value;

    if (nit === "0") {
        nombreCliente.value = "Consumidor Final";
        clientePuntosElement.textContent = "0";
    } else {
        const clienteRef = doc(db, "Clientes", nit);
        const clienteDoc = await getDoc(clienteRef);

        if (clienteDoc.exists()) {
            const cliente = clienteDoc.data();
            nombreCliente.value = cliente.nombre;
            clientePuntosElement.textContent = cliente.puntos || 0; 
        } else {
            alert("Cliente no encontrado. Asegúrate de que el NIT esté correcto.");
            nombreCliente.value = ""; 
            clientePuntosElement.textContent = "0";
        }
    }
});

// Evento para buscar producto por código
productoInput.addEventListener("change", async function() {
    const codigoProducto = productoInput.value;
    const productoRef = doc(db, "Productos", codigoProducto);
    const productoDoc = await getDoc(productoRef);

    if (productoDoc.exists()) {
        const producto = productoDoc.data();
        document.getElementById("nombreProducto").textContent = producto.nombre;
        document.getElementById("descripcionProducto").textContent = producto.descripcion;
        document.getElementById("precioProducto").textContent = `Q.${producto.precio.toFixed(2)}`;
    } else {
        alert("Producto no encontrado. Asegúrate de que el código sea correcto.");
        document.getElementById("nombreProducto").textContent = "";
        document.getElementById("descripcionProducto").textContent = "";
        document.getElementById("precioProducto").textContent = "";
    }
});

// Agregar producto a la factura
agregarProductoButton.addEventListener("click", function() {
    const productoSeleccionado = productoInput.value;
    const cantidad = parseInt(document.getElementById("cantidadProducto").value);
    
    if (!productoSeleccionado || cantidad <= 0) {
        alert("Seleccione un producto y una cantidad válida.");
        return;
    }

    const productoNombre = document.getElementById("nombreProducto").textContent;
    const productoPrecio = parseFloat(document.getElementById("precioProducto").textContent.replace("Q.", ""));

    const totalProducto = productoPrecio * cantidad;

    // Agregar producto al array de productos en la factura
    productosFactura.push({
        nombre: productoNombre,
        precio: productoPrecio,
        cantidad: cantidad,
        total: totalProducto,
        id: productoSeleccionado // Guarda el ID del producto
    });

    // Agregar una nueva fila a la tabla de factura
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${productoNombre}</td>
        <td>Q.${productoPrecio.toFixed(2)}</td>
        <td>${cantidad}</td>
        <td>Q.${totalProducto.toFixed(2)}</td>
        <td><button class="btn btn-danger btn-sm eliminarProducto">Eliminar</button></td>
    `;
    facturaTableBody.appendChild(row);

    actualizarTotalFactura();

    // Agregar funcionalidad de eliminar producto
    row.querySelector(".eliminarProducto").addEventListener("click", function() {
        productosFactura = productosFactura.filter(p => p.nombre !== productoNombre);
        row.remove();
        actualizarTotalFactura();
    });
});

// Actualizar total de la factura y aplicar descuento basado en puntos
function actualizarTotalFactura() {
    const total = productosFactura.reduce((acc, producto) => acc + producto.total, 0);
    totalFacturaElement.textContent = total.toFixed(2);

    const puntosCliente = parseInt(clientePuntosElement.textContent);
    let descuento = 0;

    if (puntosCliente >= 50) {
        descuento = total * 0.10; 
    } else if (puntosCliente >= 25) {
        descuento = total * 0.05; 
    }

    const totalConDescuento = total - descuento;
    
    descuentoFacturaElement.textContent = descuento.toFixed(2);
    totalConDescuentoElement.textContent = totalConDescuento.toFixed(2);
}

// Función para registrar la salida de productos
async function registrarSalida(productoInput, numeroFactura, producto) {
    const salidaData = {
        numeroFactura: numeroFactura,
        codigoProducto: productoInput, // Usamos el ID del producto
        nombreProducto: producto.nombre,
        cantidad: producto.cantidad,
        fecha: new Date()
    };

    try {
        await addDoc(collection(db, "Salidas"), salidaData);
        console.log("Salida registrada:", salidaData);
    } catch (error) {
        console.error("Error al registrar salida:", error);
    }
}

// Función para limpiar los campos
function limpiarCampos() {
    nitInput.value = "";
    nombreCliente.value = "";
    clientePuntosElement.textContent = "0";
    productoInput.value = "";
    document.getElementById("nombreProducto").textContent = "";
    document.getElementById("descripcionProducto").textContent = "";
    document.getElementById("precioProducto").textContent = "";
    document.getElementById("cantidadProducto").value = "";
    facturaTableBody.innerHTML = "";
    totalFacturaElement.textContent = "0.00";
    descuentoFacturaElement.textContent = "0.00";
    totalConDescuentoElement.textContent = "0.00";
    productosFactura = [];
}

// Finalizar factura
finalizarFacturaButton.addEventListener("click", async function() {
    if (productosFactura.length === 0) {
        alert("No hay productos en la factura.");
        return;
    }

    const nit = nitInput.value;
    const nombreFactura = nombreCliente.value;

    const totalFactura = parseFloat(totalFacturaElement.textContent);
    
    // Obtener el número de factura
    const contadorRef = doc(db, "Configuracion", "contadorFacturas");
    const contadorDoc = await getDoc(contadorRef);
    let numeroFactura = 1; // Valor por defecto

    if (contadorDoc.exists()) {
        numeroFactura = contadorDoc.data().numeroFactura + 1;
        // Actualizar el contador en Firestore
        await updateDoc(contadorRef, { numeroFactura: numeroFactura });
    } else {
        // Si no existe, crearlo
        await setDoc(contadorRef, { numeroFactura: numeroFactura });
    }

    const nuevaFactura = {
        nit: nit,
        nombre: nombreFactura,
        puntos: parseInt(clientePuntosElement.textContent),
        fecha: new Date(),
        numero: numeroFactura,
        productos: productosFactura.map(producto => ({
            cantidad: producto.cantidad,
            nombre: producto.nombre,
            precio: producto.precio,
            total: producto.total
        })),
        total: totalFactura.toFixed(2)
    };

    await addDoc(collection(db, "Facturas"), nuevaFactura);

    // Registrar salidas de productos
    for (const producto of productosFactura) {
        const productoRef = doc(db, "Productos", producto.id); // Usamos el ID del producto
        const docSnap = await getDoc(productoRef);

        if (docSnap.exists()) {
            const productoData = docSnap.data();
            const nuevaCantidad = productoData.cantidad - producto.cantidad;
            await updateDoc(productoRef, { cantidad: nuevaCantidad });
        }

        await registrarSalida(producto.id, numeroFactura, producto);
    }

    alert("Factura generada con éxito.");
    
    // Limpiar los campos
    limpiarCampos();
});

// Inicializar carga de productos al cargar la página
cargarProductos();
