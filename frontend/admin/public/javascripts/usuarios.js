document.addEventListener('DOMContentLoaded', () => {
      const tabla = document.getElementById('tablaUsuarios').querySelector('tbody');
      const btnRegistrar = document.getElementById('btnRegistrar');
      const btnEnviarNuevo = document.getElementById('btnEnviarNuevo');
      const btnEliminar = document.getElementById('btnEliminar');
      let filaSeleccionada = null;
      let nuevaFila = null;
      let nuevoUsuarioData = {};

      // Función para limpiar selección
      function limpiarSeleccion() {
        if (filaSeleccionada) {
          filaSeleccionada.classList.remove('selected');
          filaSeleccionada = null;
          btnEliminar.disabled = true;
        }
      }

      // Selección fila para eliminar (solo una a la vez)
      tabla.addEventListener('click', e => {
        const tr = e.target.closest('tr');
        if (!tr || tr.classList.contains('nueva-fila')) return; // Ignorar fila nueva en edición
        limpiarSeleccion();
        filaSeleccionada = tr;
        filaSeleccionada.classList.add('selected');
        btnEliminar.disabled = false;
      });

      btnRegistrar.addEventListener('click', () => {
        if (nuevaFila) {
          alert('Ya hay un registro nuevo en edición.');
          return;
        }
        limpiarSeleccion();

        // Crear nueva fila editable vacía
        nuevaFila = document.createElement('tr');
        nuevaFila.classList.add('nueva-fila');
        nuevaFila.innerHTML = `
          <td>Nuevo</td>
          <td class="editable" data-campo="usuario"></td>
          <td class="editable" data-campo="nombre"></td>
          <td class="editable" data-campo="apellido"></td>
          <td class="editable" data-campo="correo"></td>
          <td class="editable" data-campo="nivel"></td>
          <td>---</td>
        `;
        tabla.prepend(nuevaFila);
        btnEnviarNuevo.disabled = false;
        btnEliminar.disabled = true;

        // Hacer editable cada celda con clase editable
        nuevaFila.querySelectorAll('.editable').forEach(celda => {
          celda.addEventListener('dblclick', editarCelda);
        });
      });

      function editarCelda(e) {
        const celda = e.target;
        if (celda.querySelector('input')) return; // Ya está en edición

        const valorActual = celda.innerText;
        const campo = celda.dataset.campo;

        const input = document.createElement('input');
        input.type = campo === 'nivel' ? 'number' : 'text';
        input.value = valorActual;
        input.style.width = '100%';

        celda.innerHTML = '';
        celda.appendChild(input);
        input.focus();

        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            const nuevoValor = input.value.trim();
            celda.innerText = nuevoValor;
            nuevoUsuarioData[campo] = nuevoValor;
          }
          if (event.key === 'Escape') {
            celda.innerText = valorActual;
          }
        });

        input.addEventListener('blur', () => {
          celda.innerText = input.value.trim() || valorActual;
          nuevoUsuarioData[campo] = celda.innerText;
        });
      }

      btnEnviarNuevo.addEventListener('click', async () => {
        
        
        if (!nuevoUsuarioData.usuario || !nuevoUsuarioData.nombre || !nuevoUsuarioData.apellido || !nuevoUsuarioData.correo) {
          alert('Por favor completa los campos: usuario, nombre, apellido y correo.');
          return;
        }
        if (!nuevoUsuarioData.nivel) nuevoUsuarioData.nivel = 1;

        try {
            console.log("Debug 1");
          const res = await fetch('/registerAdmin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuarioData)
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error creando usuario');
          }

          alert('Usuario creado exitosamente');
          location.reload();
        } catch (error) {
          alert(error.message);
        }
      });

      // Eliminar usuario
      btnEliminar.addEventListener('click', async () => {
        if (!filaSeleccionada) return;

        const idUsuario = filaSeleccionada.dataset.id;
        const celdas = filaSeleccionada.querySelectorAll('td');
        const usuario = celdas[1].innerText;

        if (!confirm(`¿Seguro que quieres eliminar el usuario: ${usuario}?`)) return;

        try {
          const res = await fetch(`/eliminarUsuario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUsuario })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');

          filaSeleccionada.remove();
          filaSeleccionada = null;
          btnEliminar.disabled = true;
          alert('Usuario eliminado correctamente');
        } catch (err) {
          alert(err.message);
        }
      });

    });