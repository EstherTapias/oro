// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
  // --- Variables globales ---
  let pepitas = 0; // Contador de pepitas ganadas (compartido entre todos los juegos)
  let aciertos = 0; // Contador de respuestas correctas del quiz
  let preguntasActuales = []; // Array para almacenar las preguntas actuales del quiz
  let curiosidadesActuales = []; // Array para almacenar las curiosidades actuales

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

  // países productores de oro con información detallada
  const productores = [
    { pais: "China", coords: [35.8617, 104.1954], info: "🏆 China produce más de 400 toneladas al año. Líder mundial desde 2007." },
    { pais: "Australia", coords: [-25.2744, 133.7751], info: "🇦🇺 Segundo mayor productor con 320 toneladas anuales. Rica en minas a cielo abierto." },
    { pais: "Rusia", coords: [61.5240, 105.3188], info: "🇷🇺 Produce 300 toneladas anuales. Grandes reservas en Siberia." },
    { pais: "EE.UU.", coords: [37.0902, -95.7129], info: "🇺🇸 Nevada produce el 75% del oro estadounidense. Minas como Carlin son famosas mundialmente." },
    { pais: "Sudáfrica", coords: [-30.5595, 22.9375], info: "🇿🇦 Fue el líder mundial durante el siglo XX. El complejo Witwatersrand es legendario." },
    { pais: "Canadá", coords: [56.1304, -106.3468], info: "🇨🇦 Cuarto productor mundial. Ontario y Quebec son las regiones más productivas." },
    { pais: "Ghana", coords: [7.9465, -1.0232], info: "🇬🇭 Mayor productor africano actual. Rica tradición minera desde tiempos ancestrales." },
    { pais: "Brasil", coords: [-14.2350, -51.9253], info: "🇧🇷 Importante productor sudamericano. Minas en Minas Gerais y Pará." },
    { pais: "Uzbekistán", coords: [41.3775, 64.5853], info: "🇺🇿 Séptimo productor mundial. Mina Muruntau es una de las más grandes." },
    { pais: "México", coords: [23.6345, -102.5528], info: "🇲🇽 Rico en minerales preciosos. Sonora y Zacatecas son estados mineros importantes." }
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

  // --- AMPLIADO: Banco de preguntas más extenso para el Quiz ---
  const bancoPreguntas = [
    {
      pregunta: "¿Cuál es el símbolo químico del oro?",
      respuestas: [
        { texto: "Au", correcta: true },
        { texto: "Ag", correcta: false },
        { texto: "Or", correcta: false },
        { texto: "Go", correcta: false }
      ]
    },
    {
      pregunta: "¿En qué país se produce más oro actualmente?",
      respuestas: [
        { texto: "China", correcta: true },
        { texto: "Sudáfrica", correcta: false },
        { texto: "Brasil", correcta: false },
        { texto: "Australia", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué color tiene el oro puro de 24 quilates?",
      respuestas: [
        { texto: "Amarillo intenso", correcta: true },
        { texto: "Plateado", correcta: false },
        { texto: "Rojo", correcta: false },
        { texto: "Blanco", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál es la densidad aproximada del oro?",
      respuestas: [
        { texto: "19.3 g/cm³", correcta: true },
        { texto: "10.5 g/cm³", correcta: false },
        { texto: "7.8 g/cm³", correcta: false },
        { texto: "2.7 g/cm³", correcta: false }
      ]
    },
    {
      pregunta: "¿En qué temperatura se funde el oro?",
      respuestas: [
        { texto: "1064°C", correcta: true },
        { texto: "850°C", correcta: false },
        { texto: "1200°C", correcta: false },
        { texto: "950°C", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál era la moneda de oro más famosa de la antigua Roma?",
      respuestas: [
        { texto: "Aureus", correcta: true },
        { texto: "Denarius", correcta: false },
        { texto: "Solidus", correcta: false },
        { texto: "Sestertius", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué método químico se usa comúnmente para extraer oro de la roca?",
      respuestas: [
        { texto: "Cianuración", correcta: true },
        { texto: "Electrólisis", correcta: false },
        { texto: "Destilación", correcta: false },
        { texto: "Cristalización", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál es el mayor yacimiento de oro del mundo?",
      respuestas: [
        { texto: "Witwatersrand (Sudáfrica)", correcta: true },
        { texto: "Klondike (Canadá)", correcta: false },
        { texto: "California (EE.UU.)", correcta: false },
        { texto: "Yukon (Alaska)", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué civilización antigua llamaba al oro 'lágrimas del sol'?",
      respuestas: [
        { texto: "Los Incas", correcta: true },
        { texto: "Los Egipcios", correcta: false },
        { texto: "Los Griegos", correcta: false },
        { texto: "Los Romanos", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuánto oro hay aproximadamente en el cuerpo humano?",
      respuestas: [
        { texto: "0.2 miligramos", correcta: true },
        { texto: "2 gramos", correcta: false },
        { texto: "No hay oro", correcta: false },
        { texto: "20 miligramos", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué aleación forma el oro blanco?",
      respuestas: [
        { texto: "Oro + Paladio/Platino", correcta: true },
        { texto: "Oro + Plata", correcta: false },
        { texto: "Oro + Cobre", correcta: false },
        { texto: "Oro + Níquel únicamente", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál fue la fiebre del oro más famosa de la historia?",
      respuestas: [
        { texto: "California 1849", correcta: true },
        { texto: "Alaska 1890", correcta: false },
        { texto: "Australia 1850", correcta: false },
        { texto: "Sudáfrica 1870", correcta: false }
      ]
    }
  ];

  function mezclarArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  // NUEVO: Función para seleccionar preguntas aleatorias del banco
  function seleccionarPreguntasAleatorias() {
    const preguntasMezcladas = mezclarArray([...bancoPreguntas]);
    preguntasActuales = preguntasMezcladas.slice(0, 5); // Selecciona 5 preguntas aleatorias
  }

  function cargarQuiz() {
    contenedor.innerHTML = "";
    aciertos = 0;
    
    // Selecciona nuevas preguntas aleatorias cada vez que se carga el quiz
    seleccionarPreguntasAleatorias();

    preguntasActuales.forEach((q, i) => {
      const div = document.createElement("div");
      div.classList.add("pregunta");

      const p = document.createElement("p");
      p.innerHTML = `<span class="numero-pregunta">${i + 1}.</span> ${q.pregunta}`;
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
      btn.style.backgroundColor = "#4caf50";
      btn.style.color = "white";
      btn.innerHTML = `✓ ${btn.textContent}`;
      pepitas += 2; // Más pepitas por respuesta correcta
      aciertos++;
      actualizarContadorPepitas();
      reproducirSonido(sonidos.correcto);
    } else {
      btn.style.backgroundColor = "#f44336";
      btn.style.color = "white";
      btn.innerHTML = `✗ ${btn.textContent}`;
      reproducirSonido(sonidos.incorrecto);
      
      // Mostrar la respuesta correcta
      const respuestaCorrecta = [...botones].find(b => 
        preguntasActuales.find(p => p.respuestas.some(r => r.texto === b.textContent && r.correcta))
      );
      if (respuestaCorrecta) {
        respuestaCorrecta.style.backgroundColor = "#4caf50";
        respuestaCorrecta.style.color = "white";
        respuestaCorrecta.innerHTML = `✓ ${respuestaCorrecta.textContent} (Correcta)`;
      }
    }

    const respondidas = [...document.querySelectorAll(".pregunta")].filter(p =>
      [...p.querySelectorAll("button")].every(b => b.disabled)
    );

    if (respondidas.length === preguntasActuales.length) {
      const porcentaje = Math.round((aciertos / preguntasActuales.length) * 100);
      let mensaje = `🎉 Acertaste ${aciertos} de ${preguntasActuales.length} preguntas (${porcentaje}%)`;
      
      if (porcentaje >= 80) {
        mensaje += "\n🏆 ¡Excelente! Eres todo un experto en oro.";
      } else if (porcentaje >= 60) {
        mensaje += "\n👍 ¡Bien! Tienes buenos conocimientos sobre el oro.";
      } else {
        mensaje += "\n📚 Sigue aprendiendo, ¡puedes mejorar!";
      }
      
      resultado.innerText = mensaje;
    }

    actualizarEstadoBotones();
  }

  document.getElementById("btn-reset").addEventListener("click", () => {
    resultado.innerText = "";
    cargarQuiz(); // Carga nuevas preguntas aleatorias
    actualizarEstadoBotones();
  });

  // --- Juego de Excavación ---
  const totalBloques = 25; //  bloques 
  let bloquesConPepitas = new Set();
  let bloquesExcavados = new Set();

  function inicializarExcavacion() {
    zonaJuego.innerHTML = "";
    bloquesConPepitas.clear();
    bloquesExcavados.clear();
    
    // Más pepitas escondidas
    while (bloquesConPepitas.size < 8) {
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
        pepitas += 3; // Más pepitas por excavación exitosa
        actualizarContadorPepitas();
        bloque.style.backgroundImage = "url('../public/img/gold.png')";
        bloque.classList.add("oro-encontrado");
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

  // --- Banco de curiosidades  ---
  const bancoCuriosidades = [
    "🔬 El oro es tan maleable que una onza puede estirarse en un hilo de 80 kilómetros de largo.",
    "🏛️ Los antiguos egipcios creían que el oro era la carne de los dioses y que sus huesos eran de plata.",
    "🌡️ El oro es prácticamente indestructible: no se oxida, no se corroe y resiste la mayoría de ácidos.",
    "👑 La máscara funeraria de Tutankamón contiene más de 20 kilos de oro puro.",
    "🚀 Los astronautas llevan una fina capa de oro en sus viseras para protegerse de la radiación solar.",
    "⚡ El oro conduce la electricidad mejor que el cobre, por eso se usa en electrónicos de alta gama.",
    "🌊 Los océanos contienen aproximadamente 20 millones de toneladas de oro disuelto.",
    "🍃 Una lámina de oro puede ser tan fina que deja pasar la luz, creando un color verde azulado.",
    "💎 El oro de 24 quilates es oro puro al 99.9%, mientras que el de 18k contiene 75% de oro.",
    "🏺 El oro ha sido valorado por la humanidad durante más de 6,000 años de historia registrada.",
    "🧬 El cuerpo humano contiene aproximadamente 0.2 miligramos de oro, principalmente en la sangre.",
    "💍 Todo el oro extraído en la historia mundial cabría en un cubo de apenas 22 metros de lado.",
    "🌟 El oro se forma en el núcleo de estrellas moribundas y llega a la Tierra mediante meteoritos.",
    "🏔️ La mina de oro más profunda del mundo está en Sudáfrica, a más de 4 km bajo tierra.",
    "🎭 Los antiguos romanos usaban oro para empastar dientes, una práctica que duró siglos.",
    "🔥 El oro se funde a 1,064°C y hierve a 2,700°C.",
    "🏛️ El Partenón de Atenas tenía una estatua de Atenea recubierta con 1,140 kilos de oro.",
    "📱 Tu teléfono móvil contiene aproximadamente 0.034 gramos de oro en sus circuitos.",
    "🍯 Los antiguos alquimistas creían que podían convertir plomo en oro usando la 'piedra filosofal'.",
    "🏆 Las medallas olímpicas de oro contienen solo 6 gramos de oro, el resto es plata.",
    "🌍 Australia produce tanto oro que si fuera un país independiente, sería el 2º productor mundial.",
    "⚖️ Un kilogramo de oro puro tiene el mismo valor que aproximadamente 50 iPhones nuevos.",
    "🧪 El agua regia (mezcla de ácidos) es una de las pocas sustancias que pueden disolver oro.",
    "🎨 Gustav Klimt usó pan de oro real en muchas de sus famosas pinturas como 'El Beso'.",
    "🏴‍☠️ Los piratas preferían las monedas de oro porque no se corroían con el agua salada.",
    "🔍 Los detectores de metales pueden encontrar oro hasta 30 cm bajo tierra.",
    "🌡️ El oro es tan buen conductor del calor que una cuchara de oro se calentaría instantáneamente.",
    "💰 Fort Knox contiene 4,176 toneladas de oro, valoradas en más de 200 mil millones de dólares.",
    "🎪 Los trapecistas del circo usan redes con hilos de oro porque son más resistentes y duraderos.",
    "🦷 Los dientes de oro no solo son decorativos: el oro es biocompatible y antibacteriano."
  ];

  let cartasGeneradas = [];
  let cartasReveladas = []; // NUEVO: Array para mantener las cartas reveladas

  // NUEVO: Función para seleccionar curiosidades aleatorias
  function seleccionarCuriosidadesAleatorias() {
    const curiosidadesMezcladas = mezclarArray([...bancoCuriosidades]);
    curiosidadesActuales = curiosidadesMezcladas.slice(0, 10); // Selecciona 10 curiosidades
  }

  function generarCartasIniciales() {
    if (!cartasContainer) return;
    
    cartasContainer.innerHTML = "";
    cartasGeneradas = [];
    cartasReveladas = []; // Limpia las cartas reveladas
    
    // Selecciona nuevas curiosidades aleatorias
    seleccionarCuriosidadesAleatorias();
    
    for (let i = 0; i < 4; i++) { // AMPLIADO: 4 cartas iniciales en lugar de 3
      generarNuevaCarta();
    }
  }

  function generarNuevaCarta() {
    if (!cartasContainer || curiosidadesActuales.length === 0) return;
    
    const carta = document.createElement("div");
    carta.className = "carta";
    
    // Selecciona una curiosidad que no haya sido usada
    const curiosidadIndex = Math.floor(Math.random() * curiosidadesActuales.length);
    const curiosidadAleatoria = curiosidadesActuales[curiosidadIndex];
    
    // Remueve la curiosidad usada para evitar repeticiones
    curiosidadesActuales.splice(curiosidadIndex, 1);
    
    carta.dataset.curiosidad = curiosidadAleatoria;
    
    // CORREGIDO: Establece la imagen de fondo correctamente
    carta.style.backgroundImage = "url('../public/img/carta-rascar.png')";
    carta.style.backgroundSize = "cover";
    carta.style.backgroundPosition = "center";
    
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
      
      // NUEVO: Agrega la carta a las reveladas para mantenerla visible
      cartasReveladas.push({
        elemento: carta,
        curiosidad: carta.dataset.curiosidad
      });

      reproducirSonido(sonidos.oro);

      if (resultadoRasca) {
        resultadoRasca.innerHTML = `<strong>¡Descubierto!</strong><br>${carta.dataset.curiosidad}`;
      }

      // MODIFICADO: Las cartas ya no desaparecen, se mantienen reveladas
      actualizarEstadoBotones();
      
      // Genera una nueva carta después de un tiempo para mantener siempre cartas disponibles
      setTimeout(() => {
        if (cartasGeneradas.filter(c => !c.classList.contains("revelada")).length < 2) {
          generarNuevaCarta();
        }
      }, 1000);
      
    } else if (pepitas < 2) {
      if (resultadoRasca) {
        resultadoRasca.innerHTML = "<strong>❌ Necesitas al menos 2 pepitas para rascar una carta.</strong>";
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
          resultadoRasca.innerHTML = "<strong>❌ Necesitas al menos 2 pepitas para rascar una carta.</strong>";
        }
      } else {
        if (resultadoRasca) {
          resultadoRasca.innerHTML = "<strong>❌ No hay cartas disponibles para rascar.</strong>";
        }
      }
    });
  }

  // --- Funciones auxiliares globales ---
  function actualizarContadorPepitas() {
    if (pepitasEl) {
      pepitasEl.innerText = pepitas;
      
      // NUEVO: Animación del contador cuando aumentan las pepitas
      pepitasEl.parentElement.classList.add("contador-animado");
      setTimeout(() => {
        pepitasEl.parentElement.classList.remove("contador-animado");
      }, 600);
    }
  }

  function actualizarEstadoBotones() {
    if (btnRascar) {
      btnRascar.disabled = pepitas < 2;
      btnRascar.textContent = `Rascar Carta (2 pepitas) ${pepitas >= 2 ? '✨' : '❌'}`;
    }
    
    cartasGeneradas.forEach(carta => {
      if (!carta.classList.contains("revelada")) {
        if (pepitas >= 2) {
          carta.style.cursor = "pointer";
          carta.style.opacity = "1";
          carta.style.filter = "brightness(1)";
        } else {
          carta.style.cursor = "not-allowed";
          carta.style.opacity = "0.7";
          carta.style.filter = "brightness(0.5)";
        }
      }
    });
  }

  // --- Inicialización ---
  cargarQuiz();
  inicializarExcavacion();
  generarCartasIniciales();
  actualizarEstadoBotones();
  
  // Mensaje de bienvenida
  setTimeout(() => {
    if (pepitas === 0) {
      alert("🌟 ¡Bienvenido al mundo del oro! 🌟\n\nResponde el quiz y excava para ganar pepitas de oro.\nUsa las pepitas para descubrir curiosidades fascinantes.\n\n¡Que comience la aventura! ⛏️💰");
    }
  }, 1000);
});