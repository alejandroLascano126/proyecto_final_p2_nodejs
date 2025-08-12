document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaUsuarios').querySelector('tbody');
  const btnRegistrar = document.getElementById('btnRegistrar');
  const btnEnviarNuevo = document.getElementById('btnEnviarNuevo');
  const btnEliminar = document.getElementById('btnEliminar');

  let filaSeleccionada = null;
  let nuevaFila = null;
  let nuevoUsuarioData = {};
  const usuariosEditados = {}; // { idUsuario: { campo1: valor, campo2: valor } }

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

  // Delegación de evento para doble clic en celdas editables (funciona para filas existentes y nuevas)
  tabla.addEventListener('dblclick', e => {
    const celda = e.target.closest('.editable');
    if (!celda) return;

    editarCelda({ target: celda });
  });

  btnRegistrar.addEventListener('click', () => {
    if (nuevaFila) {
      alert('Ya hay un registro nuevo en edición.');
      return;
    }
    limpiarSeleccion();

    // Crear nueva fila editable vacía con select para nivel
    nuevaFila = document.createElement('tr');
    nuevaFila.classList.add('nueva-fila');
    nuevaFila.innerHTML = `
      <td>Nuevo</td>
      <td class="editable" data-campo="usuario"></td>
      <td class="editable" data-campo="nombre"></td>
      <td class="editable" data-campo="apellido"></td>
      <td class="editable" data-campo="correo"></td>
      <td class="editable" data-campo="nivel">
        <select style="width: 100%;">
          <option value="">--Selecciona nivel--</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </td>
      <td>---</td>
    `;
    tabla.prepend(nuevaFila);
    btnEnviarNuevo.disabled = false;
    btnEliminar.disabled = true;
    nuevoUsuarioData = {};

    // Listener para actualizar nuevoUsuarioData cuando cambie el select nivel
    const selectNivel = nuevaFila.querySelector('select');
    selectNivel.addEventListener('change', (e) => {
      nuevoUsuarioData.nivel = parseInt(e.target.value) || null;
    });
  });

  function editarCelda(e) {
    const celda = e.target;
    if (celda.querySelector('input') || celda.querySelector('select')) return; // Ya está en edición

    const valorActual = celda.innerText.trim();
    const campo = celda.dataset.campo;

    if (campo === 'nivel') {
      // Crear un select con opciones 1 y 2
      const select = document.createElement('select');
      const opciones = [1, 2];
      opciones.forEach(opcion => {
        const option = document.createElement('option');
        option.value = opcion;
        option.text = opcion;
        if (valorActual == opcion) option.selected = true;
        select.appendChild(option);
      });
      select.style.width = '100%';

      celda.innerHTML = '';
      celda.appendChild(select);
      select.focus();

      function guardarValor() {
        const nuevoValor = select.value;
        celda.innerText = nuevoValor;

        if (nuevaFila && nuevaFila.contains(celda)) {
          nuevoUsuarioData[campo] = parseInt(nuevoValor);
        } else {
          const fila = celda.closest('tr');
          const idUsuario = fila.dataset.id;
          if (!usuariosEditados[idUsuario]) usuariosEditados[idUsuario] = {};
          usuariosEditados[idUsuario][campo] = parseInt(nuevoValor);
        }
        btnEnviarNuevo.disabled = false;
      }

      select.addEventListener('change', guardarValor);
      select.addEventListener('blur', guardarValor);

    } else {
      // Input texto para otros campos
      const input = document.createElement('input');
      input.type = 'text';
      input.value = valorActual;
      input.style.width = '100%';

      celda.innerHTML = '';
      celda.appendChild(input);
      input.focus();

      function guardarValor() {
        const nuevoValor = input.value.trim();
        celda.innerText = nuevoValor;

        if (nuevaFila && nuevaFila.contains(celda)) {
          nuevoUsuarioData[campo] = nuevoValor;
        } else {
          const fila = celda.closest('tr');
          const idUsuario = fila.dataset.id;
          if (!usuariosEditados[idUsuario]) usuariosEditados[idUsuario] = {};
          usuariosEditados[idUsuario][campo] = nuevoValor;
        }
        btnEnviarNuevo.disabled = false;
      }

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          guardarValor();
        } else if (event.key === 'Escape') {
          celda.innerText = valorActual;
        }
      });

      input.addEventListener('blur', () => {
        guardarValor();
      });
    }
  }

  btnEnviarNuevo.addEventListener('click', async () => {
    try {
      // Primero verificamos si hay fila nueva que guardar
      if (nuevaFila) {
        // Validar campos obligatorios para nuevo usuario
        if (!nuevoUsuarioData.usuario || !nuevoUsuarioData.nombre || !nuevoUsuarioData.apellido || !nuevoUsuarioData.correo) {
          alert('Por favor completa los campos: usuario, nombre, apellido y correo.');
          return;
        }
        if (!nuevoUsuarioData.nivel) nuevoUsuarioData.nivel = 1;

        const resNuevo = await fetch('/registerAdmin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoUsuarioData)
        });

        if (!resNuevo.ok) {
          const errorData = await resNuevo.json();
          throw new Error(errorData.error || 'Error creando usuario');
        }
        alert('Usuario creado exitosamente');
        location.reload();
        return;
      }

      // Luego verificamos si hay usuarios editados existentes que actualizar
      const idsEditar = Object.keys(usuariosEditados);
      if (idsEditar.length === 0) {
        alert('No hay cambios para guardar.');
        return;
      }

      // Enviar los cambios al backend en un solo arreglo
      // Ejemplo: [{id: '1', usuario: 'nuevo', nombre: 'Nombre', ...}, {...}]
      const cambios = idsEditar.map(id => ({
        id,
        ...usuariosEditados[id]
      }));

      const resEdit = await fetch('/actualizarUsuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios)
      });

      if (!resEdit.ok) {
        const errorData = await resEdit.json();
        throw new Error(errorData.error || 'Error actualizando usuarios');
      }

      alert('Usuarios actualizados correctamente');
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
