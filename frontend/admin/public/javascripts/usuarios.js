document.addEventListener('DOMContentLoaded', () => {
    const tabla = document.getElementById('tablaUsuarios');
    const btnEliminar = document.getElementById('btnEliminar');
    let filaSeleccionada = null;

    // Selección de fila con click (para eliminar)
    tabla.querySelector('tbody').addEventListener('click', (e) => {
        const fila = e.target.closest('tr');
        if (!fila) return;

        // Quitar selección previa
        if (filaSeleccionada) {
            filaSeleccionada.classList.remove('selected');
        }

        // Seleccionar nueva fila
        filaSeleccionada = fila;
        filaSeleccionada.classList.add('selected');
        btnEliminar.disabled = false;
    });

    // Botón eliminar
    btnEliminar.addEventListener('click', async () => {
        if (!filaSeleccionada) return;

        const idUsuario = filaSeleccionada.dataset.id;
        const celdas = filaSeleccionada.querySelectorAll('td');
        const usuario = celdas[1].innerText;

        if (!confirm(`¿Seguro que quieres eliminar el usuario: ${usuario}?`)) return;

        try {
            const res = await fetch(`/eliminarUsuario`, {
                method: 'POST',  // O 'DELETE' si lo prefieres y está soportado
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUsuario })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error desconocido');
            }
            filaSeleccionada.remove();
            filaSeleccionada = null;
            btnEliminar.disabled = true;
            alert('Usuario eliminado correctamente');
        } catch (err) {
            alert(err.message);
        }
    });


    // Doble click para editar celdas
    tabla.addEventListener('dblclick', function (e) {
        const celda = e.target;

        if (!celda.classList.contains('editable')) return;

        const valorActual = celda.innerText;
        const campo = celda.dataset.campo;
        const fila = celda.closest('tr');
        const idUsuario = fila.dataset.id;
        let guardado = false;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = valorActual;
        input.classList.add('form-control');
        celda.innerHTML = '';
        celda.appendChild(input);
        input.focus();

        input.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                const nuevoValor = input.value;

                const celdas = fila.querySelectorAll('td');
                const data = {
                    usuario: celdas[1].innerText,
                    nombre: celdas[2].innerText,
                    apellido: celdas[3].innerText,
                    correo: celdas[4].innerText,
                    nivel: parseInt(celdas[5].innerText)
                };

                data[campo] = nuevoValor;

                try {
                    const res = await fetch('/actualizaUsuario', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            idUsuario,
                            usuario: data.usuario,
                            nombre: data.nombre,
                            apellido: data.apellido,
                            correo: data.correo,
                            nivel: data.nivel
                        })
                    });

                    if (!res.ok) throw new Error('Error al actualizar usuario');

                    celda.innerText = nuevoValor;
                    input.remove();
                    guardado = true;
                } catch (err) {
                    alert(err.message);
                    celda.innerText = valorActual;
                }
            } else if (event.key === 'Escape') {
                celda.innerText = valorActual;
                input.remove();
                guardado = true;
            }
        });

        input.addEventListener('blur', () => {
            if (!guardado) {
                celda.innerText = valorActual;
                input.remove();
            }
        });
    });
});
