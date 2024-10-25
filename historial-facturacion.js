// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAD7USPTMS7uuuqmVDeGPnZw54fAo8TMIA",
    authDomain: "sistema-de-ventas-ef94d.firebaseapp.com",
    projectId: "sistema-de-ventas-ef94d",
    storageBucket: "sistema-de-ventas-ef94d.appspot.com",
    messagingSenderId: "495607998971",
    appId: "1:495607998971:web:3277abae25304c3185c35e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para cargar el historial de facturación desde Firestore
async function cargarHistorialFacturacion() {
    try {
        // Obtener los documentos de la colección "facturas" en Firebase
        const querySnapshot = await getDocs(collection(db, "Facturas"));
        const tablaFacturacion = document.getElementById("facturacionTable").getElementsByTagName("tbody")[0];

        // Limpiar la tabla antes de agregar las nuevas filas
        tablaFacturacion.innerHTML = ""; 

        // Recorrer los documentos obtenidos y agregarlos a la tabla
        querySnapshot.forEach((doc) => {
            const data = doc.data(); // Obtener los datos de cada factura

            // Verificar qué datos se están recibiendo
            console.log(data);

            // Verificar que el cliente y su nombre existan
            const clienteNombre = data.nombre ? data.nombre : 'Sin cliente';

            // Crear una nueva fila para cada factura
            const row = document.createElement("tr");

            // Rellenar la fila con los datos de la factura
            row.innerHTML = `
                <td>${data.numero || 'Sin número'}</td>
                <td>${data.fecha ? new Date(data.fecha.seconds * 1000).toLocaleDateString() : 'Sin fecha'}</td>
                <td>${clienteNombre}</td>
                <td>Q. ${data.total || '0.00'}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarFactura('${doc.id}')">Eliminar</button>
                </td>
            `;

            // Agregar la fila a la tabla
            tablaFacturacion.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar el historial de facturación: ", error);
    }
}

// Función para eliminar una factura de Firebase
async function eliminarFactura(id) {
    try {
        // Eliminar el documento con el ID proporcionado de la colección "facturas"
        await deleteDoc(doc(db, "Facturas", id));
        
        // Mostrar mensaje de éxito
        alert("Factura eliminada con ID: " + id);
        
        // Recargar el historial de facturación después de la eliminación
        cargarHistorialFacturacion();
    } catch (error) {
        console.error("Error al eliminar la factura: ", error);
    }
}

// Hacer la función eliminarFactura globalmente accesible
window.eliminarFactura = eliminarFactura;

// Inicializar el historial de facturación cuando se carga la página
window.onload = function() {
    cargarHistorialFacturacion();
};
