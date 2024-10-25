// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAD7USPTMS7uuuqmVDeGPnZw54fAo8TMIA",
    authDomain: "sistema-de-ventas-ef94d.firebaseapp.com",
    projectId: "sistema-de-ventas-ef94d",
    storageBucket: "sistema-de-ventas-ef94d.appspot.com",
    messagingSenderId: "495607998971",
    appId: "1:495607998971:web:3277abae25304c3185c35e"
};

// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Manejo del botón "Enviar"
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    const nombre = document.getElementById("inputNombre").value.trim();
    const correo = document.getElementById("inputCorreo").value.trim();
    const contraseña = document.getElementById("inputContraseña").value;

    const messageDiv = document.getElementById("message"); // Div para mostrar mensajes

    // Validación de campos
    if (!nombre || !correo || !contraseña) {
        messageDiv.innerText = "Todos los campos son obligatorios.";
        messageDiv.classList.add("text-danger");
        return;
    }

    try {
        // Crear un nuevo usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, correo, contraseña);
        const user = userCredential.user;

        // Guardar información adicional en Firestore (incluyendo contraseña)
        const newUserRef = doc(db, "Administracion", user.uid);
        await setDoc(newUserRef, {
            nombre: nombre,
            correo: correo,
            contraseña: contraseña, // Guardar la contraseña (NO RECOMENDADO)
            estado: true // Estado activo por defecto
        });

        messageDiv.innerText = `Bienvenido ${nombre}`;
        messageDiv.classList.remove("text-danger");
        messageDiv.classList.add("text-success");

        // Limpiar los campos del formulario
        document.getElementById("inputNombre").value = "";
        document.getElementById("inputCorreo").value = "";
        document.getElementById("inputContraseña").value = "";

        // Mostrar usuarios después de registrar uno nuevo
        mostrarUsuarios();

    } catch (error) {
        console.error("Error al registrar el usuario: ", error);
        let errorMessage = "Hubo un error al registrar el usuario.";
        if (error.code === "auth/invalid-email") {
            errorMessage = "El correo electrónico no es válido.";
        } else if (error.code === "auth/email-already-in-use") {
            errorMessage = "El correo electrónico ya está en uso.";
        }
        messageDiv.innerText = errorMessage;
        messageDiv.classList.add("text-danger");
    }
});

// Mostrar usuarios
async function mostrarUsuarios() {
    const querySnapshot = await getDocs(collection(db, "Administracion"));
    const usuariosElement = document.getElementById("usuariosTable").getElementsByTagName('tbody')[0];
    usuariosElement.innerHTML = ""; // Limpiar la tabla antes de llenarla

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.nombre}</td>
            <td>${data.correo}</td>
            <td>${data.contraseña}</td> <!-- Mostrar la contraseña -->
            <td>${data.estado ? 'Activo' : 'Desactivado'}</td>
            <td>
                <button class="btn btn-danger" onclick="eliminarUsuario('${doc.id}')">Eliminar</button>
            </td>
        `;
        usuariosElement.appendChild(row);
    });
}

// Función para eliminar un usuario
async function eliminarUsuario(usuarioId) {
    try {
        // Lógica para eliminar el usuario
        console.log("Eliminando usuario con ID:", usuarioId);
        // Aquí deberías implementar la lógica de eliminación de usuarios
        // ...
        mostrarListaUsuarios(); // Actualiza la lista después de eliminar
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
    }
}


// Hacer las funciones accesibles globalmente
window.eliminarUsuario = eliminarUsuario;

// Inicializar la lista de usuarios al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    mostrarUsuarios();
});
