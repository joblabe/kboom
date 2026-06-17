// Referencias de UI
const tableroElement = document.getElementById('tablero');
const txtSaldo = document.getElementById('txtSaldo');
const txtDiamantes = document.getElementById('txtDiamantes');

// Botones de control de modales
const btnInstrucciones = document.getElementById('btnInstrucciones');
const btnReinicioContador = document.getElementById('btnReinicioContador');
const btnGanaPuntos = document.getElementById('btnGanaPuntos');
const btnPierdePuntos = document.getElementById('btnPierdePuntos');

// Variables de estado del Juego
let arregloTablero = [];
let diamantesEncontrados = 0;
let juegoActivo = true;

// ===================================================
// Inicialización del Juego
// ===================================================
function inicializarJuego() {
  if (localStorage.getItem('saldo') === null) {
    localStorage.setItem('saldo', '50');
  }
  if (localStorage.getItem('usuarioNuevo') === null) {
    localStorage.setItem('usuarioNuevo', 'true');
  }

  actualizarMarcadorSaldo();
  verificarEstadoUsuario();
  generarNuevoTableroAleatorio();
}

function actualizarMarcadorSaldo() {
  txtSaldo.textContent = localStorage.getItem('saldo');
}

function verificarEstadoUsuario() {
  const esUsuarioNuevo = localStorage.getItem('usuarioNuevo');
  if (esUsuarioNuevo === 'true') {
    mostrarModal('modalInstrucciones');
    localStorage.setItem('usuarioNuevo', 'false');
  }
}

// ===================================================
// Gestión de Modales
// ===================================================
function mostrarModal(idModal) {
  const modal = document.getElementById(idModal);
  if (modal) modal.classList.add('show');
}

function ocultarModal(idModal) {
  const modal = document.getElementById(idModal);
  if (modal) modal.classList.remove('show');
}

// Listeners para cerrar modales y continuar el juego
btnInstrucciones.addEventListener('click', () => ocultarModal('modalInstrucciones'));
btnReinicioContador.addEventListener('click', () => {
  ocultarModal('modalReincioContador');
  generarNuevoTableroAleatorio();
});
btnGanaPuntos.addEventListener('click', () => {
  ocultarModal('modalGanaPuntos');
  generarNuevoTableroAleatorio();
});
btnPierdePuntos.addEventListener('click', () => {
  ocultarModal('modalPierdePuntos');
  generarNuevoTableroAleatorio();
});

// ===================================================
// Generación Aleatoria (20 Diamantes, 5 Minas)
// ===================================================
function generarNuevoTableroAleatorio() {
  juegoActivo = true;
  diamantesEncontrados = 0;
  txtDiamantes.textContent = "0 / 5";
  tableroElement.innerHTML = ""; 

  // Creación estricta de las 25 casillas requeridas: 20 Diamantes ('d') y 5 Minas ('m')
  let baseCasillas = [
    'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd',
    'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd', 'd',
    'm', 'm', 'm', 'm', 'm'
  ];

  // Barajado aleatorio (Fisher-Yates)
  for (let i = baseCasillas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baseCasillas[i], baseCasillas[j]] = [baseCasillas[j], baseCasillas[i]];
  }
  arregloTablero = baseCasillas;

  // Inyección de casillas en el DOM
  arregloTablero.forEach((tipo, indice) => {
    const casillaDiv = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = "/img/interrogante.png";
    imgElement.alt = "Casilla oculta";
    
    casillaDiv.appendChild(imgElement);
    casillaDiv.dataset.indice = indice;
    tableroElement.appendChild(casillaDiv);
  });
}

// ===================================================
// Lógica de Clic y Reglas del Juego
// ===================================================
tableroElement.addEventListener('click', (evento) => {
  if (!juegoActivo) return;

  const casillaClickeada = evento.target.closest('div');
  if (!casillaClickeada || casillaClickeada.classList.contains('flip-vertical-left')) return;

  const indice = parseInt(casillaClickeada.dataset.indice);
  const tipoFicha = arregloTablero[indice];
  const imagenFicha = casillaClickeada.querySelector('img');

  casillaClickeada.classList.add('flip-vertical-left');

  if (tipoFicha === 'd') {
    // REGLA DIAMANTE
    imagenFicha.src = "/img/diamante.png";
    diamantesEncontrados++;
    txtDiamantes.textContent = `${diamantesEncontrados} / 5`;

    if (diamantesEncontrados === 5) {
      juegoActivo = false;
      modificarSaldo(5); // Aumenta saldo 5 puntos
      setTimeout(() => mostrarModal('modalGanaPuntos'), 400);
    }

  } else if (tipoFicha === 'm') {
    // REGLA MINA
    imagenFicha.src = "/img/mina.png";
    juegoActivo = false;
    modificarSaldo(-5); // Pierde 5 puntos automáticamente al tocar la primera mina
    
    setTimeout(() => {
      let saldoActual = parseInt(localStorage.getItem('saldo'));
      if (saldoActual <= 0) {
        localStorage.setItem('saldo', '50'); // Restauración automática de saldo
        actualizarMarcadorSaldo();
        mostrarModal('modalReincioContador');
      } else {
        mostrarModal('modalPierdePuntos');
      }
    }, 400);
  }
});

function modificarSaldo(puntos) {
  let saldo = parseInt(localStorage.getItem('saldo'));
  saldo += puntos;
  localStorage.setItem('saldo', saldo.toString());
  actualizarMarcadorSaldo();
}

// Lanzamiento inicial
inicializarJuego();