// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
  // --- Variables globales ---
  let pepitas = 0; // Contador de pepitas ganadas (compartido entre todos los juegos)
  let aciertos = 0; // Contador de respuestas correctas del quiz

  // Referencias a elementos del DOM
  const pepitasEl = document.getElementById("pepitas");
  const contenedor = document.getElementById("quiz-container");
  const resultado = document.getElementById("resultado");
  const zonaJuego = document.getElementById("zona-juego");
  const btnRascar = document.getElementById("btn-rascar");
  const btnResetExcavacion = document.getElementById("btn-reset-excavacion");
  const cartasContainer = document.getElementById("cartas-container");

  // --- Carga dinámica del header y footer desde index.html ---
  fetch('../index.html')
  .then(response => response.text())
  .then(data => {
    const headerMatch = data.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
    if (headerMatch) {
      document.getElementById('header-nave').innerHTML = headerMatch[1];
      // Ejecuta la animación del logo si la función existe
      if (typeof runLogoAnimation === 'function') {
        runLogoAnimation();
      }
    }

    const footerMatch = data.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    if (footerMatch) {
      document.getElementById('footer').innerHTML = footerMatch[1];
    }
  })
  .catch(error => console.log('Error cargando header/footer:', error));
  
  // --- Configuración del Mapa Leaflet ---
  const mapa = L.map("mapa").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Mapa: OpenStreetMap'
  }).addTo(mapa);

  const productores = [
    { pais: "China", coords: [35.8617, 104.1954], info: "🏆 China produce más de 400 toneladas al año." },
    { pais: "Australia", coords: [-25.2744, 133.7751], info: "🇦🇺 Segundo mayor productor de oro del mundo." },
    { pais: "Rusia", coords: [61.5240, 105.3188], info: "🇷🇺 Rusia es un gran exportador de oro." },
    { pais: "EE.UU.", coords: [37.0902, -95.7129], info: "🇺🇸 Nevada es su estado con más minas de oro." },
    { pais: "Sudáfrica", coords: [-30.5595, 22.9375], info: "🇿🇦 Fue el líder mundial durante el siglo XX." }
  ];

  productores.forEach(p => {
    L.marker(p.coords).addTo(mapa).bindPopup(`<strong>${p.pais}</strong><br>${p.info}`);
  });

  document.getElementById("btn-expandir-mapa").addEventListener("click", () => {
    const mapaDiv = document.getElementById("mapa");
    mapaDiv.classList.toggle("mapa-grande");
    mapa.invalidateSize();
  });

  // --- Efectos de sonido ---
  const sonidos = {
    correcto: new Audio("../public/sounds/correct.mp3"),
    incorrecto: new Audio("../public/sounds/error.mp3"),
    excavar: new Audio("../public/sounds/dig.mp3"),
    oro: new Audio("../public/sounds/correct.mp3"),
    piedra: new Audio("../public/sounds/stone.mp3")
  };

  // Función para reproducir sonido con manejo de errores
  function reproducirSonido(sonido) {
    try {
      const audio = sonido.cloneNode();
      audio.play().catch(e => console.log('No se pudo reproducir el sonido:', e));
    } catch (e) {
      console.log('Error con el sonido:', e);
    }
  }

  // --- Configuración del Quiz ---
  const preguntas = [
    {
      pregunta: "¿Cuál es el símbolo químico del oro?",
      respuestas: [
        { texto: "Au", correcta: true },
        { texto: "Ag", correcta: false },
        { texto: "Or", correcta: false }
      ]
    },
    {
      pregunta: "¿En qué país se produce más oro actualmente?",
      respuestas: [
        { texto: "China", correcta: true },
        { texto: "Sudáfrica", correcta: false },
        { texto: "Brasil", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué color tiene el oro puro?",
      respuestas: [
        { texto: "Amarillo", correcta: true },
        { texto: "Plateado", correcta: false },
        { texto: "Rojo", correcta: false }
      ]
    }
  ];

  function mezclarArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function cargarQuiz() {
    contenedor.innerHTML = "";
    aciertos = 0;

    const preguntasAleatorias = mezclarArray([...preguntas]);

    preguntasAleatorias.forEach((q, i) => {
      const div = document.createElement("div");
      div.classList.add("pregunta");

      const p = document.createElement("p");
      p.textContent = q.pregunta;
      div.appendChild(p);

      const respuestasAleatorias = mezclarArray([...q.respuestas]);

      respuestasAleatorias.forEach(r => {
        const btn = document.createElement("button");
        btn.textContent = r.texto;
        btn.onclick = () => responder(btn, r.correcta, div);
        div.appendChild(btn);
      });

      contenedor.appendChild(div);
    });
  }

  function responder(btn, correcta, div) {
    const botones = div.querySelectorAll("button");
    botones.forEach(b => b.disabled = true);

    if (correcta) {
      btn.style.backgroundColor = "#a5d6a7";
      pepitas++;
      aciertos++;
      actualizarContadorPepitas();
      reproducirSonido(sonidos.correcto);
    } else {
      btn.style.backgroundColor = "#ef9a9a";
      reproducirSonido(sonidos.incorrecto);
    }

    const respondidas = [...document.querySelectorAll(".pregunta")].filter(p =>
      [...p.querySelectorAll("button")].every(b => b.disabled)
    );

    if (respondidas.length === preguntas.length) {
      resultado.innerText = `🎉 Acertaste ${aciertos} de ${preguntas.length} preguntas.`;
    }

    actualizarEstadoBotones();
  }

  document.getElementById("btn-reset").addEventListener("click", () => {
    resultado.innerText = "";
    cargarQuiz();
    actualizarEstadoBotones();
  });

  // --- Juego de Excavación ---
  const totalBloques = 20;
  let bloquesConPepitas = new Set();
  let bloquesExcavados = new Set();

  function inicializarExcavacion() {
    zonaJuego.innerHTML = "";
    bloquesConPepitas.clear();
    bloquesExcavados.clear();
    
    while (bloquesConPepitas.size < 5) {
      bloquesConPepitas.add(Math.floor(Math.random() * totalBloques));
    }

    for (let i = 0; i < totalBloques; i++) {
      const bloque = document.createElement("div");
      bloque.className = "bloque";
      bloque.style.backgroundImage = "url('../public/img/dirt-block.png')";
      bloque.style.backgroundSize = "cover";
      bloque.addEventListener("click", () => excavarBloque(bloque, i));
      zonaJuego.appendChild(bloque);
    }
  }

  function excavarBloque(bloque, index) {
    if (bloquesExcavados.has(index)) return;

    bloquesExcavados.add(index);
    bloque.classList.add("excavado");
    
    reproducirSonido(sonidos.excavar);

    setTimeout(() => {
      if (bloquesConPepitas.has(index)) {
        pepitas++;
        actualizarContadorPepitas();
        bloque.style.backgroundImage = "url('../public/img/gold.png')";
        reproducirSonido(sonidos.oro);
      } else {
        bloque.style.backgroundImage = "url('../public/img/stone-block.png')";
        reproducirSonido(sonidos.piedra);
      }
      actualizarEstadoBotones();
    }, 300);
  }

  if (btnResetExcavacion) {
    btnResetExcavacion.addEventListener("click", () => {
      inicializarExcavacion();
      actualizarEstadoBotones();
    });
  }

  // --- Juego de Rasca y Gana (Cartas) ---
  const curiosidades = [
    "🔍 El oro es tan maleable que se puede estirar en hilos de nanómetros.",
    "🏛️ Los antiguos egipcios creían que el oro era carne de los dioses.",
    "🌡️ El oro no se oxida ni se corroe fácilmente.",
    "👑 Se han encontrado joyas de oro con más de 4000 años de antigüedad.",
    "🚀 La NASA usa oro en los trajes espaciales por su capacidad de reflejar radiación.",
    "⚡ El oro conduce perfectamente la electricidad.",
    "🌊 En el océano hay aproximadamente 20 millones de toneladas de oro disuelto.",
    "🔬 Una onza de oro se puede convertir en una lámina de 300 pies cuadrados.",
    "💎 El oro de 24 quilates es oro puro al 99.9%.",
    "🏺 El oro ha sido valorado por la humanidad durante más de 4,000 años."
  ];

  let cartasGeneradas = [];

  function generarCartasIniciales() {
    if (!cartasContainer) return;
    
    cartasContainer.innerHTML = "";
    cartasGeneradas = [];
    
    for (let i = 0; i < 3; i++) {
      generarNuevaCarta();
    }
  }

  function generarNuevaCarta() {
    if (!cartasContainer) return;
    
    const carta = document.createElement("div");
    carta.className = "carta";
    
    const curiosidadAleatoria = curiosidades[Math.floor(Math.random() * curiosidades.length)];
    carta.dataset.curiosidad = curiosidadAleatoria;
    
    carta.addEventListener("click", () => rascarCarta(carta));
    
    cartasContainer.appendChild(carta);
    cartasGeneradas.push(carta);
  }

  function rascarCarta(carta) {
    const resultadoRasca = document.getElementById("resultado-rasca");
    
    if (pepitas >= 2 && !carta.classList.contains("revelada")) {
      pepitas -= 2;
      actualizarContadorPepitas();

      carta.classList.add("revelada");
      carta.textContent = carta.dataset.curiosidad;

      reproducirSonido(sonidos.oro);

      if (resultadoRasca) {
        resultadoRasca.innerText = carta.dataset.curiosidad;
      }

      setTimeout(() => {
        carta.remove();
        cartasGeneradas = cartasGeneradas.filter(c => c !== carta);
        generarNuevaCarta();
      }, 2000);

      actualizarEstadoBotones();
    } else if (pepitas < 2) {
      if (resultadoRasca) {
        resultadoRasca.innerText = "❌ Necesitas al menos 2 pepitas para rascar una carta.";
      }
    }
  }

  if (btnRascar) {
    btnRascar.addEventListener("click", () => {
      const cartaNoRevelada = cartasGeneradas.find(carta => !carta.classList.contains("revelada"));
      const resultadoRasca = document.getElementById("resultado-rasca");
      
      if (cartaNoRevelada && pepitas >= 2) {
        rascarCarta(cartaNoRevelada);
      } else if (pepitas < 2) {
        if (resultadoRasca) {
          resultadoRasca.innerText = "❌ Necesitas al menos 2 pepitas para rascar una carta.";
        }
      } else {
        if (resultadoRasca) {
          resultadoRasca.innerText = "❌ No hay cartas disponibles para rascar.";
        }
      }
    });
  }

  // --- Funciones auxiliares globales ---
  function actualizarContadorPepitas() {
    if (pepitasEl) {
      pepitasEl.innerText = pepitas;
    }
  }

  function actualizarEstadoBotones() {
    if (btnRascar) {
      btnRascar.disabled = pepitas < 2;
      btnRascar.textContent = "Rascar Carta (2 pepitas)";
    }
    
    cartasGeneradas.forEach(carta => {
      if (!carta.classList.contains("revelada")) {
        if (pepitas >= 2) {
          carta.style.cursor = "pointer";
          carta.style.opacity = "1";
        } else {
          carta.style.cursor = "not-allowed";
          carta.style.opacity = "0.6";
        }
      }
    });
  }

  // --- Inicialización ---
  cargarQuiz();
  inicializarExcavacion();
  generarCartasIniciales();
  actualizarEstadoBotones();
});