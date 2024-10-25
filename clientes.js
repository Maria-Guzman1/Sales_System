import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, getDocs, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

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
const auth = getAuth();

// Referencia a los elementos del DOM
const tableBody = document.querySelector('#clientesTable tbody');
const registrarButton = document.getElementById("registrar");

// Variable para controlar si estamos editando
let editandoClienteId = null;

// Evento para registrar o actualizar clientes
registrarButton.addEventListener("click", async function() {
    const nit = document.getElementById("nit").value; // Obtiene el NIT
    const nombre = document.getElementById("nombre").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const correo = document.getElementById("correo").value;

    // Validar si los campos están completos
    if (nit === "" || nombre === "" || direccion === "" || telefono === "" || correo === "") {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        if (editandoClienteId) {
            // Si estamos editando, actualizamos el cliente existente
            await updateDoc(doc(db, "Clientes", editandoClienteId), {
                nit: nit,
                nombre: nombre,
                direccion: direccion,
                telefono: telefono,
                correo: correo
            });
            alert("Cliente actualizado exitosamente");
            editandoClienteId = null;
            registrarButton.textContent = "Registrar Cliente";
        } else {
            // Si no estamos editando, creamos un nuevo cliente usando el NIT como ID
            await setDoc(doc(db, "Clientes", nit), { // Usa el NIT como ID
                nit: nit,
                nombre: nombre,
                direccion: direccion,
                telefono: telefono,
                correo: correo,
                timestamp: new Date()
            });
            alert("Cliente registrado exitosamente con Id: " + nit);
        }

        // Limpiar los campos del formulario
        limpiarFormulario();
        // Actualizar la tabla con los clientes registrados
        cargarClientes();
    } catch (error) {
        console.log("Error al registrar o actualizar el cliente: ", error);
        alert("Hubo un error al registrar o actualizar el cliente.");
    }
});

// Función para cargar los clientes desde Firebase y mostrarlos en la tabla
async function cargarClientes() {
    if (!tableBody) {
        console.error('No se encontró la tabla de clientes');
        return;
    }

    const querySnapshot = await getDocs(collection(db, "Clientes"));
    tableBody.innerHTML = "";  // Limpiar el contenido previo de la tabla

    querySnapshot.forEach((doc) => {
        const cliente = doc.data();
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${cliente.nit}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.direccion}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.correo}</td>
            <td>
                <button class="editar btn btn-warning btn-sm" onclick="editarCliente('${cliente.nit}')">Editar</button>
                <button class="eliminar btn btn-danger btn-sm" onclick="eliminarCliente('${cliente.nit}')">Eliminar</button>
            </td>
        `;

        // Añadir la nueva fila a la tabla
        tableBody.appendChild(newRow);
    });
}

// Función para eliminar un cliente
window.eliminarCliente = async function(nit) {
    console.log("Eliminando cliente con NIT: ", nit); // Verifica el NIT
    const confirmacion = confirm("¿Estás seguro de que quieres eliminar este cliente?");
    if (confirmacion) {
        try {
            await deleteDoc(doc(db, "Clientes", nit)); // Cambiado a usar nit
            alert("Cliente eliminado exitosamente");
            cargarClientes();  // Recargar los clientes en la tabla
        } catch (error) {
            console.log("Error al eliminar el cliente: ", error);
            alert("Hubo un error al eliminar el cliente. " + error.message);
        }
    }
}

// Función para cargar los datos del cliente a editar en el formulario
window.editarCliente = async function(nit) {
    const clienteRef = doc(db, "Clientes", nit);
    const clienteDoc = await getDoc(clienteRef);

    if (clienteDoc.exists()) {
        const cliente = clienteDoc.data();
        document.getElementById("nombre").value = cliente.nombre;
        document.getElementById("nit").value = cliente.nit; // Cargar el NIT en el formulario
        document.getElementById("direccion").value = cliente.direccion;
        document.getElementById("telefono").value = cliente.telefono;
        document.getElementById("correo").value = cliente.correo;

        // Cambiar el texto del botón a "Guardar Cambios"
        registrarButton.textContent = "Guardar Cambios";
        editandoClienteId = nit;  // Guardamos el NIT del cliente que se está editando
    } else {
        alert("Cliente no encontrado");
    }
}

// Función para limpiar los campos del formulario
function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("nit").value = ""; // Limpiar el NIT
    document.getElementById("direccion").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("correo").value = "";
    registrarButton.textContent = "Registrar Cliente";  // Resetear el botón
    editandoClienteId = null;
}

// Cargar clientes al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
});
