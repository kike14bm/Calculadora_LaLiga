document.addEventListener("DOMContentLoaded", () => {
  const jornadas = document.querySelectorAll(".jornada");
  let jornadaActual = 1;

  const prevBtn = document.getElementById("prevJornada");
  const nextBtn = document.getElementById("nextJornada");

  function mostrarJornada(jornada) {
    jornadas.forEach(jornadaDiv => {
      jornadaDiv.style.display = jornadaDiv.dataset.jornada == jornada ? 'block' : 'none';
    });
  }

  prevBtn.addEventListener("click", () => {
    if (jornadaActual > 1) {
      jornadaActual--;
      mostrarJornada(jornadaActual);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (jornadaActual < jornadas.length) {
      jornadaActual++;
      mostrarJornada(jornadaActual);
    }
  });

  // Función para inicializar objeto de equipos
  function obtenerEquipos() {
    const equipos = {};
    document.querySelectorAll(".clasif-tabla thead th").forEach(() => {});
    document.querySelectorAll(".resultados tbody tr").forEach(tr => {
      const local = tr.children[0].textContent.trim();
      const visitante = tr.children[2].textContent.trim();
      if (!equipos[local]) equipos[local] = crearEstadisticas(local);
      if (!equipos[visitante]) equipos[visitante] = crearEstadisticas(visitante);
    });
    return equipos;
  }

  function crearEstadisticas(nombre) {
    return {
      nombre,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0
    };
  }

  function calcularClasificacion() {
    const equipos = obtenerEquipos();

    document.querySelectorAll(".resultados tbody tr").forEach(tr => {
      const local = tr.children[0].textContent.trim();
      const resultado = tr.children[1].textContent.trim();
      const visitante = tr.children[2].textContent.trim();

      const goles = resultado.match(/^(\d+)\s*-\s*(\d+)$/);
      if (!goles) return;

      const gl = parseInt(goles[1]);
      const gv = parseInt(goles[2]);

      // Actualiza partidos jugados y goles
      equipos[local].pj++;
      equipos[visitante].pj++;
      equipos[local].gf += gl;
      equipos[local].gc += gv;
      equipos[visitante].gf += gv;
      equipos[visitante].gc += gl;

      if (gl > gv) {
        equipos[local].pg++;
        equipos[visitante].pp++;
        equipos[local].pts += 3;
      } else if (gl < gv) {
        equipos[visitante].pg++;
        equipos[local].pp++;
        equipos[visitante].pts += 3;
      } else {
        equipos[local].pe++;
        equipos[visitante].pe++;
        equipos[local].pts += 1;
        equipos[visitante].pts += 1;
      }

      // Colorear celdas
      tr.children[0].classList.remove("ganador-bg", "perdedor-bg", "empate-bg");
      tr.children[2].classList.remove("ganador-bg", "perdedor-bg", "empate-bg");
      if (gl > gv) {
        tr.children[0].classList.add("ganador-bg");
        tr.children[2].classList.add("perdedor-bg");
      } else if (gl < gv) {
        tr.children[2].classList.add("ganador-bg");
        tr.children[0].classList.add("perdedor-bg");
      } else {
        tr.children[0].classList.add("empate-bg");
        tr.children[2].classList.add("empate-bg");
      }
    });

    // Calcula diferencias
    Object.values(equipos).forEach(eq => {
      eq.dg = eq.gf - eq.gc;
    });

    // Ordena equipos
    const ordenados = Object.values(equipos).sort((a, b) =>
      b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.nombre.localeCompare(b.nombre)
    );

    const tbody = document.querySelector(".clasif-tabla tbody");
    tbody.innerHTML = "";
    ordenados.forEach((eq, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${eq.nombre}</td>
        <td>${eq.pj}</td>
        <td>${eq.pg}</td>
        <td>${eq.pe}</td>
        <td>${eq.pp}</td>
        <td>${eq.gf}</td>
        <td>${eq.gc}</td>
        <td>${eq.dg > 0 ? "+" + eq.dg : eq.dg}</td>
        <td>${eq.pts}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function prepararEventos() {
    document.querySelectorAll(".editable.resultado").forEach(cell => {
      cell.addEventListener("input", calcularClasificacion);
    });
  }

  function prepararBuscador() {
    const buscador = document.getElementById("buscador");
    buscador.addEventListener("input", () => {
      const filtro = buscador.value.toLowerCase();
      document.querySelectorAll(".clasif-tabla tbody tr").forEach(tr => {
        const equipo = tr.children[1].textContent.toLowerCase();
        tr.style.display = equipo.includes(filtro) ? "" : "none";
      });
    });
  }

  prepararEventos();
  prepararBuscador();
  calcularClasificacion();
  mostrarJornada(jornadaActual);
});
