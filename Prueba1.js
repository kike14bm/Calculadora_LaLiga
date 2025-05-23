// Función para obtener equipos y sus puntos inicializados a 0
function inicializarEquipos() {
  const equipos = new Set();

  // Recorrer todas las filas de resultados para obtener nombres únicos de equipos
  document.querySelectorAll('.resultados tbody tr').forEach(tr => {
    const local = tr.children[0].textContent.trim();
    const visitante = tr.children[2].textContent.trim();
    equipos.add(local);
    equipos.add(visitante);
  });

  // Crear objeto con equipos y puntos iniciales a 0
  const objEquipos = {};
  equipos.forEach(equipo => {
    objEquipos[equipo] = 0;
  });

  return objEquipos;
}

// Función para analizar resultado y asignar puntos a equipos
function asignarPuntos(equipos) {
  // Recorrer todas las jornadas
  document.querySelectorAll('.jornada').forEach(jornada => {
    jornada.querySelectorAll('tbody tr').forEach(tr => {
      const local = tr.children[0].textContent.trim();
      const resultado = tr.children[1].textContent.trim();
      const visitante = tr.children[2].textContent.trim();

      // Extraer goles locales y visitantes del texto "X - Y"
      const goles = resultado.match(/^(\d+)\s*-\s*(\d+)$/);
      if (!goles) return; // Si no coincide formato, saltar esta fila

      const golesLocal = parseInt(goles[1], 10);
      const golesVisitante = parseInt(goles[2], 10);

      // Limpiar clases previas para colores de fondo de equipos y resultado
      tr.children[0].classList.remove('ganador-bg', 'perdedor-bg', 'empate-bg');
      tr.children[2].classList.remove('ganador-bg', 'perdedor-bg', 'empate-bg');
      tr.children[1].classList.remove('ganador', 'perdedor', 'empate');

      // Asignar puntos y clases según resultado
      if (golesLocal > golesVisitante) {
        equipos[local] += 3;                      // Local gana 3 puntos
        tr.children[0].classList.add('ganador-bg');   // Fondo verde para local ganador
        tr.children[2].classList.add('perdedor-bg');  // Fondo rojo para visitante perdedor
      } else if (golesLocal < golesVisitante) {
        equipos[visitante] += 3;                   // Visitante gana 3 puntos
        tr.children[2].classList.add('ganador-bg');   // Fondo verde para visitante ganador
        tr.children[0].classList.add('perdedor-bg');  // Fondo rojo para local perdedor
      } else {
        equipos[local] += 1;                        // Empate, 1 punto cada uno
        equipos[visitante] += 1;
        tr.children[0].classList.add('empate-bg');    // Fondo gris para empate
        tr.children[2].classList.add('empate-bg');
      }
    });
  });
}

// Función para ordenar y mostrar la tabla de clasificación
function mostrarClasificacion(equipos) {
  const tbody = document.querySelector('.clasif-tabla tbody');
  tbody.innerHTML = ''; // limpiar contenido previo

  // Convertir objeto a array y ordenar por puntos descendente, y por nombre ascendente si hay empate
  const ordenado = Object.entries(equipos)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  // Crear filas y asignar clases de colores según posición
  ordenado.forEach(([equipo, puntos], index) => {
    const tr = document.createElement('tr');

    // Añadir clase según posición para colorear según clasificación
    if (index < 4) {               // 1º a 4º → Champions (azul oscuro)
      tr.classList.add('clasif-champions');
    } else if (index >= 4 && index < 6) {  // 5º y 6º → Europa League (naranja)
      tr.classList.add('clasif-europa');
    } else if (index === 6) {      // 7º → Conference League (verde oscuro)
      tr.classList.add('clasif-conference');
    }

    // Crear celdas de posición, equipo y puntos
    const tdPos = document.createElement('td');
    tdPos.textContent = index + 1;

    const tdEquipo = document.createElement('td');
    tdEquipo.textContent = equipo;

    const tdPuntos = document.createElement('td');
    tdPuntos.textContent = puntos;

    // Añadir celdas a la fila
    tr.appendChild(tdPos);
    tr.appendChild(tdEquipo);
    tr.appendChild(tdPuntos);

    // Añadir fila al tbody de clasificación
    tbody.appendChild(tr);
  });
}

// Función para actualizar la clasificación cuando cambia algún resultado editable
function actualizar() {
  const equipos = inicializarEquipos();
  asignarPuntos(equipos);
  mostrarClasificacion(equipos);
}

// Añadir event listeners a todas las celdas de resultados editables
function prepararEventos() {
  document.querySelectorAll('.resultados td[contenteditable="true"]').forEach(td => {
    td.addEventListener('input', () => {
      actualizar();
    });
  });
}

// Función para filtrar la clasificación con el buscador
function prepararBuscador() {
  const buscador = document.getElementById('buscador');
  buscador.addEventListener('input', () => {
    const filtro = buscador.value.toLowerCase();
    document.querySelectorAll('.clasif-tabla tbody tr').forEach(tr => {
      const equipo = tr.children[1].textContent.toLowerCase();
      tr.style.display = equipo.includes(filtro) ? '' : 'none';
    });
  });
}

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  prepararEventos();
  prepararBuscador();
  actualizar(); // Primera carga para mostrar tabla y colores
});
