document.addEventListener("DOMContentLoaded", function() {
    const app = document.getElementById("app");

    const vistas = {
        login: `
            <div class="contenedor">
                <h2>Iniciar Sesión</h2>
                <input type="text" id="login-usuario" placeholder="Usuario">
                <input type="password" id="login-contrasena" placeholder="Contraseña">
                <button id="boton-login">Iniciar Sesión</button>
                <button id="boton-ir-registro">Ir a Registrarse</button>
            </div>
        `,
        registro: `
            <div class="contenedor">
                <h2>Registrarse</h2>
                <input type="text" id="registro-usuario" placeholder="Usuario">
                <input type="text" id="registro-nombre" placeholder="Nombre">
                <input type="password" id="registro-contrasena" placeholder="Contraseña">
                <button id="boton-registro">Registrarse</button>
                <button id="boton-ir-login">Ir a Iniciar Sesión</button>
            </div>
        `,
        perfil: `
            <div class="contenedor">
                <h2>Perfil</h2>
                <input type="text" id="perfil-nombre" placeholder="Nombre">
                <input type="password" id="perfil-contrasena" placeholder="Nueva Contraseña">
                <button id="boton-actualizar-perfil">Actualizar Perfil</button>
                <button id="boton-cerrar-sesion">Cerrar Sesión</button>
            </div>
        `,
        tablero: `
            <div class="contenedor">
                <h2>Bienvenido, <span id="usuario-mostrar"></span></h2>
                <button id="boton-ir-perfil">Ir a Perfil</button>
                <button id="boton-cerrar-sesion">Cerrar Sesión</button>
                
                <div>
                    <h3>Agregar Transacción</h3>
                    <select id="tipo-transaccion">
                        <option value="ingreso">Ingreso</option>
                        <option value="gasto">Gasto</option>
                    </select>
                    <input type="number" id="monto-transaccion" placeholder="Monto">
                    <input type="text" id="descripcion-transaccion" placeholder="Descripción">
                    <button id="boton-agregar-transaccion">Agregar Transacción</button>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-transacciones">
                        <!-- Las transacciones se agregarán aquí -->
                    </tbody>
                </table>
                <canvas id="grafico-transacciones" width="400" height="400"></canvas>
            </div>
        `
    };

    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return hash;
    }

    function mostrarVista(vista) {
        app.innerHTML = vistas[vista];
        if (vista === 'tablero') {
            document.getElementById("usuario-mostrar").textContent = localStorage.getItem("usuario");
            cargarTransacciones();
            dibujarGrafico();
        }
    }

    function guardarUsuario(usuario, nombre, contrasena) {
        const contrasenaHasheada = hashCode(contrasena);
        localStorage.setItem("usuario", usuario);
        localStorage.setItem("nombre", nombre);
        localStorage.setItem("contrasena", contrasenaHasheada);
    }

    function validarUsuario(usuario, contrasena) {
        const usuarioAlmacenado = localStorage.getItem("usuario");
        const contrasenaAlmacenada = localStorage.getItem("contrasena");
        return usuario === usuarioAlmacenado && hashCode(contrasena) == contrasenaAlmacenada;
    }

    function cargarTransacciones() {
        const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
        const tablaCuerpo = document.getElementById("tabla-transacciones");
        tablaCuerpo.innerHTML = '';
        transacciones.forEach(transaccion => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${transaccion.tipo}</td>
                <td>${transaccion.monto}</td>
                <td>${transaccion.descripcion}</td>
            `;
            tablaCuerpo.appendChild(fila);
        });
    }

    function agregarTransaccion(tipo, monto, descripcion) {
        const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
        transacciones.push({ tipo, monto, descripcion });
        localStorage.setItem("transacciones", JSON.stringify(transacciones));
    }

    function dibujarGrafico() {
        const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
        const ingreso = transacciones.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0);
        const gasto = transacciones.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.monto, 0);

        const ctx = document.getElementById('grafico-transacciones').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                etiquetas: ['Ingreso', 'Gasto'],
                conjuntosDatos: [{
                    datos: [ingreso, gasto],
                    coloresFondo: ['#28a745', '#dc3545']
                }]
            }
        });
    }

    function manejarLogin() {
        const usuario = document.getElementById("login-usuario").value;
        const contrasena = document.getElementById("login-contrasena").value;
        if (validarUsuario(usuario, contrasena)) {
            mostrarVista('tablero');
        } else {
            alert("Usuario o contraseña inválidos");
        }
    }

    function manejarRegistro() {
        const usuario = document.getElementById("registro-usuario").value;
        const nombre = document.getElementById("registro-nombre").value;
        const contrasena = document.getElementById("registro-contrasena").value;
        guardarUsuario(usuario, nombre, contrasena);
        mostrarVista('login');
    }

    function manejarActualizacionPerfil() {
        const nombre = document.getElementById("perfil-nombre").value;
        const contrasena = document.getElementById("perfil-contrasena").value;
        if (nombre) {
            localStorage.setItem("nombre", nombre);
        }
        if (contrasena) {
            localStorage.setItem("contrasena", hashCode(contrasena));
        }
        mostrarVista('tablero');
    }

    function manejarCerrarSesion() {
        localStorage.removeItem("usuario");
        localStorage.removeItem("nombre");
        localStorage.removeItem("contrasena");
        mostrarVista('login');
    }

    document.addEventListener("click", function(event) {
        if (event.target.id === "boton-login") {
            manejarLogin();
        } else if (event.target.id === "boton-registro") {
            manejarRegistro();
        } else if (event.target.id === "boton-actualizar-perfil") {
            manejarActualizacionPerfil();
        } else if (event.target.id === "boton-cerrar-sesion") {
            manejarCerrarSesion();
        } else if (event.target.id === "boton-ir-registro") {
            mostrarVista('registro');
        } else if (event.target.id === "boton-ir-login") {
            mostrarVista('login');
        } else if (event.target.id === "boton-ir-perfil") {
            mostrarVista('perfil');
        } else if (event.target.id === "boton-agregar-transaccion") {
            const tipo = document.getElementById("tipo-transaccion").value;
            const monto = parseFloat(document.getElementById("monto-transaccion").value);
            const descripcion = document.getElementById("descripcion-transaccion").value;
            if (monto && descripcion) {
                agregarTransaccion(tipo, monto, descripcion);
                cargarTransacciones();
                dibujarGrafico();
            } else {
                alert("Por favor, complete todos los campos");
            }
        }
    });

    const usuarioAlmacenado = localStorage.getItem("usuario");
    if (usuarioAlmacenado) {
        mostrarVista('tablero');
    } else {
        mostrarVista('login');
    }
});
