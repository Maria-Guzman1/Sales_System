import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAD7USPTMS7uuuqmVDeGPnZw54fAo8TMIA",
    authDomain: "sistema-de-ventas-ef94d.firebaseapp.com",
    projectId: "sistema-de-ventas-ef94d",
    storageBucket: "sistema-de-ventas-ef94d.appspot.com",
    messagingSenderId: "495607998971",
    appId: "1:495607998971:web:3277abae25304c3185c35e"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia a colecciones
const productosRef = collection(db, "Productos");
const entradasRef = collection(db, "Entradas");
const salidasRef = collection(db, "Salidas");

// Función para registrar un producto
document.getElementById("registrar").addEventListener("click", async () => {
    const id = document.getElementById("id").value;
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const precio = parseFloat(document.getElementById("precio").value);
    const cantidad = parseInt(document.getElementById("cantidad").value);

    try {
        await addDoc(productosRef, { id, nombre, descripcion, precio, cantidad });
        alert("Producto registrado exitosamente");
        mostrarProductos();
    } catch (error) {
        console.error("Error al registrar el producto: ", error);
    }
});

// Función para mostrar productos
async function mostrarProductos() {
    const querySnapshot = await getDocs(productosRef);
    const tbody = document.getElementById("productosTable").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    
    querySnapshot.forEach((doc) => {
        const producto = doc.data();
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.descripcion}</td>
            <td>Q. ${producto.precio.toFixed(2)}</td>
            <td>${producto.cantidad}</td>
            <td><button class="btn btn-danger btn-sm" onclick="eliminarProducto('${doc.id}')">Eliminar</button></td>
        `;
    });
}

// Función para registrar entrada de productos
document.getElementById("registrarEntrada").addEventListener("click", async () => {
    const entradaProductoId = document.getElementById("entradaProductoId").value;
    const entradaCantidad = parseInt(document.getElementById("entradaCantidad").value);

    try {
        const entrada = {
            idProducto: entradaProductoId,
            cantidad: entradaCantidad,
            fecha: Timestamp.now()
        };
        await addDoc(entradasRef, entrada);

        const productoSnapshot = await getDocs(productosRef);
        productoSnapshot.forEach(async (doc) => {
            if (doc.data().id === entradaProductoId) {
                const productoRef = doc.ref;
                await updateDoc(productoRef, { cantidad: doc.data().cantidad + entradaCantidad });
            }
        });
        
        alert("Entrada registrada correctamente");
        mostrarEntradas();
        mostrarProductos();
    } catch (error) {
        console.error("Error al registrar entrada: ", error);
    }
});

// Función para mostrar entradas
async function mostrarEntradas() {
    const querySnapshot = await getDocs(entradasRef);
    const tbody = document.getElementById("entradasTable").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const entrada = doc.data();
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${entrada.idProducto}</td>
            <td>${entrada.cantidad}</td>
            <td>${entrada.fecha.toDate().toLocaleDateString()}</td>
        `;
    });
}

// Función para mostrar historial de salidas
async function mostrarSalidas() {
    const querySnapshot = await getDocs(salidasRef);
    const tbody = document.getElementById("salidasTable").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const salida = doc.data();
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${salida.codigoProducto}</td>
            <td>${salida.nombreProducto}</td>
            <td>${salida.cantidad}</td>
            <td>${salida.fecha.toDate().toLocaleDateString()}</td>
            <td>${salida.numeroFactura}</td>
        `;
    });
}

// Inicializar tablas
mostrarProductos();
mostrarEntradas();
mostrarSalidas();

// Asegura que las funciones estén disponibles globalmente
window.mostrarProductos = mostrarProductos;
window.mostrarEntradas = mostrarEntradas;
window.mostrarSalidas = mostrarSalidas;
