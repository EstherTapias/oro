// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {
  // --- Carga dinámica del header y footer desde index.html ---
  
  // Realiza una petición fetch para obtener el contenido de index.html
  fetch('../index.html')
  .then(response => response.text()) // Convierte la respuesta a texto
  .then(data => {
    // Busca el contenido del header usando expresión regular
    const headerMatch = data.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
    if (headerMatch) {
      // Inserta el header encontrado en el elemento con id 'header-nave'
      document.getElementById('header-nave').innerHTML = headerMatch[1];
      runLogoAnimation(); // Ejecuta la animación del logo después de insertar el header
    }

    // Busca el contenido del footer usando expresión regular
    const footerMatch = data.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    if (footerMatch) {
      // Inserta el footer encontrado en el elemento con id 'footer'
      document.getElementById('footer').innerHTML = footerMatch[1];
    }
  });
  
  // --- Configuración del Mapa Leaflet ---
  
  // Inicializa el mapa centrado en coordenadas [latitud: 20, longitud: 0] con zoom nivel 2
  const mapa = L.map("mapa").setView([20, 0], 2);

  // Añade la capa de tiles de OpenStreetMap al mapa
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Mapa: OpenStreetMap' // Atribución requerida por OpenStreetMap
  }).addTo(mapa);

  // Array con información de los principales países productores de oro
  const productores = [
    { pais: "China", coords: [35.8617, 104.1954], info: "🏆 China produce más de 400 toneladas al año." },
    { pais: "Australia", coords: [-25.2744, 133.7751], info: "🇦🇺 Segundo mayor productor de oro del mundo." },
    { pais: "Rusia", coords: [61.5240, 105.3188], info: "🇷🇺 Rusia es un gran exportador de oro." },
    { pais: "EE.UU.", coords: [37.0902, -95.7129], info: "🇺🇸 Nevada es su estado con más minas de oro." },
    { pais: "Sudáfrica", coords: [-30.5595, 22.9375], info: "🇿🇦 Fue el líder mundial durante el siglo XX." }
  ];

  // Itera sobre cada país productor y añade un marcador al mapa
  productores.forEach(p => {
    L.marker(p.coords).addTo(mapa).bindPopup(`<strong>${p.pais}</strong><br>${p.info}`);
  });

  // Event listener para el botón de expandir/contraer mapa
  document.getElementById("btn-expandir-mapa").addEventListener("click", () => {
    const mapaDiv = document.getElementById("mapa");
    // Alterna la clase CSS para cambiar el tamaño del mapa
    mapaDiv.classList.toggle("mapa-grande");
    // Recalcula el tamaño del mapa después del cambio CSS
    mapa.invalidateSize();
  });

  // --- Configuración del Quiz ---

  // Array con las preguntas del quiz
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

  // Variables globales para controlar el estado del juego
  let pepitas = 0; // Contador de pepitas ganadas (compartido entre quiz y excavación)
  let aciertos = 0; // Contador de respuestas correctas

  // Referencias a elementos del DOM
  const pepitasEl = document.getElementById("pepitas");
  const contenedor = document.getElementById("quiz-container");
  const resultado = document.getElementById("resultado");

  // Objetos Audio para los efectos de sonido
  const sonidoCorrecto = new Audio("../public/sounds/correct.mp3");
  const sonidoIncorrecto = new Audio("../public/sounds/error.mp3");
  const sonidoExcavacion = new Audio("../public/sounds/dig.mp3");

  // Función para mezclar aleatoriamente un array
  function mezclarArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  // Función que genera y carga el quiz dinámicamente
  function cargarQuiz() {
    contenedor.innerHTML = ""; // Limpia el contenedor
    aciertos = 0; // Reinicia el contador de aciertos

    // Mezcla las preguntas para que aparezcan en orden aleatorio
    const preguntasAleatorias = mezclarArray([...preguntas]);

    // Itera sobre cada pregunta para crear el HTML
    preguntasAleatorias.forEach((q, i) => {
      const div = document.createElement("div");
      div.classList.add("pregunta");

      // Crea el párrafo con la pregunta
      const p = document.createElement("p");
      p.textContent = q.pregunta;
      div.appendChild(p);

      // Mezcla las respuestas para que aparezcan en orden aleatorio
      const respuestasAleatorias = mezclarArray([...q.respuestas]);

      // Crea un botón para cada respuesta
      respuestasAleatorias.forEach(r => {
        const btn = document.createElement("button");
        btn.textContent = r.texto;
        // Asigna el evento click que llama a la función responder
        btn.onclick = () => responder(btn, r.correcta, div);
        div.appendChild(btn);
      });

      contenedor.appendChild(div);
    });
  }

  // Función que maneja la respuesta del usuario
  function responder(btn, correcta, div) {
    // Obtiene todos los botones de la pregunta y los deshabilita
    const botones = div.querySelectorAll("button");
    botones.forEach(b => b.disabled = true);

    if (correcta) {
      // Si la respuesta es correcta
      btn.style.backgroundColor = "#a5d6a7"; // Colorea el botón de verde claro
      pepitas++; // Incrementa las pepitas (variable global)
      aciertos++; // Incrementa los aciertos
      actualizarContadorPepitas(); // Actualiza el contador visual
      sonidoCorrecto.play(); // Reproduce sonido de acierto
    } else {
      // Si la respuesta es incorrecta
      btn.style.backgroundColor = "#ef9a9a"; // Colorea el botón de rojo claro
      sonidoIncorrecto.play(); // Reproduce sonido de error
    }

    // Verifica si todas las preguntas han sido respondidas
    const respondidas = [...document.querySelectorAll(".pregunta")].filter(p =>
      [...p.querySelectorAll("button")].every(b => b.disabled)
    );

    // Si todas las preguntas están respondidas, muestra el resultado final
    if (respondidas.length === preguntas.length) {
      resultado.innerText = `🎉 Acertaste ${aciertos} de ${preguntas.length} preguntas.`;
    }

    // Actualiza el estado de los botones del juego
    actualizarEstadoBotones();
  }

  // Event listener para el botón de reiniciar quiz
  document.getElementById("btn-reset").addEventListener("click", () => {
    pepitas = 0; // Reinicia las pepitas
    actualizarContadorPepitas(); // Actualiza el contador visual
    resultado.innerText = ""; // Limpia el resultado
    cargarQuiz(); // Vuelve a cargar el quiz
    actualizarEstadoBotones(); // Actualiza estado de botones
  });

  // Carga inicial del quiz
  cargarQuiz();
});

// --- Variables globales y referencias DOM para el juego de excavación ---

// Referencias a elementos del DOM para el juego de excavación
const zonaJuego = document.getElementById("zona-juego");
const btnRascar = document.getElementById("btn-rascar");
const btnResetExcavacion = document.getElementById("btn-reset-excavacion");

// Objeto con las rutas de las imágenes utilizadas
const imagenes = {
  tierra: "../public/img/dirt-block.png",
  piedra: "../public/img/stone-block.png",
  oro: "../public/img/gold.png"
};

// Objeto con los efectos de sonido del juego
const sonidos = {
  excavar: new Audio("../public/sounds/dig.mp3"),
  oro: new Audio("../public/sounds/correct.mp3"),
  piedra: new Audio("../public/sounds/stone.mp3")
};

// Configuración del juego de excavación
const totalBloques = 20; // Total de bloques en el juego
let bloquesConPepitas = new Set(); // Set para almacenar los índices de bloques con pepitas
let bloquesExcavados = new Set(); // Set para trackear bloques ya excavados

// Función para inicializar el juego de excavación
function inicializarExcavacion() {
  // Limpia la zona de juego
  zonaJuego.innerHTML = "";
  bloquesConPepitas.clear();
  bloquesExcavados.clear();
  
  // Genera aleatoriamente 5 posiciones con pepitas (sin repetir)
  while (bloquesConPepitas.size < 5) {
    bloquesConPepitas.add(Math.floor(Math.random() * totalBloques));
  }

  // Crea todos los bloques del juego
  for (let i = 0; i < totalBloques; i++) {
    const bloque = document.createElement("div");
    bloque.className = "bloque";
    // Establece la imagen de fondo inicial (tierra)
    bloque.style.backgroundImage = `url(${imagenes.tierra})`;
    bloque.style.backgroundSize = "cover";
    // Asigna el evento click para excavar
    bloque.addEventListener("click", () => excavarBloque(bloque, i));
    zonaJuego.appendChild(bloque);
  }
}

// Función que maneja la excavación de un bloque
function excavarBloque(bloque, index) {
  // Si el bloque ya fue excavado, no hace nada
  if (bloquesExcavados.has(index)) return;

  // Marca el bloque como excavado
  bloquesExcavados.add(index);
  bloque.classList.add("excavado");
  
  // Reproduce el sonido de excavación primero
  const audioExcavar = sonidos.excavar.cloneNode();
  audioExcavar.play();

  // Después de un breve delay, reproduce el sonido del contenido y cambia la imagen
  setTimeout(() => {
    // Verifica si este bloque contiene una pepita
    if (bloquesConPepitas.has(index)) {
      pepitas++; // Incrementa las pepitas (variable global)
      actualizarContadorPepitas(); // Actualiza el contador visual
      bloque.style.backgroundImage = `url(${imagenes.oro})`; // Cambia la imagen a oro
      sonidos.oro.cloneNode().play(); // Reproduce sonido de oro encontrado
    } else {
      bloque.style.backgroundImage = `url(${imagenes.piedra})`; // Cambia la imagen a piedra
      sonidos.piedra.cloneNode().play(); // Reproduce sonido de piedra
    }

    // Actualiza el estado de los botones
    actualizarEstadoBotones();
  }, 300); // Delay de 300ms para que se escuche primero el sonido de excavación
}

// Event listener para el botón de reiniciar excavación
if (btnResetExcavacion) {
  btnResetExcavacion.addEventListener("click", () => {
    inicializarExcavacion(); // Reinicia completamente el juego de excavación
    actualizarEstadoBotones(); // Actualiza el estado de los botones
  });
}

// Inicializa el juego de excavación al cargar la página
inicializarExcavacion();

// --- Juego de Rasca y Gana (Cartas) ---

// Array con datos curiosos sobre el oro para las cartas
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

// Referencia al contenedor de cartas
const cartasContainer = document.getElementById("cartas-container");
let cartasGeneradas = []; // Array para trackear las cartas generadas

// Función para generar cartas iniciales
function generarCartasIniciales() {
  cartasContainer.innerHTML = ""; // Limpia el contenedor
  cartasGeneradas = []; // Reinicia el array de cartas
  
  // Genera 3 cartas iniciales
  for (let i = 0; i < 3; i++) {
    generarNuevaCarta();
  }
}

// Función para generar una nueva carta
function generarNuevaCarta() {
  const carta = document.createElement("div");
  carta.className = "carta";
  
  // Selecciona una curiosidad aleatoria
  const curiosidadAleatoria = curiosidades[Math.floor(Math.random() * curiosidades.length)];
  
  // Almacena la curiosidad en un atributo de datos
  carta.dataset.curiosidad = curiosidadAleatoria;
  
  // Añade evento click para rascar la carta
  carta.addEventListener("click", () => rascarCarta(carta));
  
  cartasContainer.appendChild(carta);
  cartasGeneradas.push(carta);
}

// Función para rascar una carta
function rascarCarta(carta) {
  // Verifica si el usuario tiene suficientes pepitas (2 pepitas por carta)
  if (pepitas >= 2 && !carta.classList.contains("revelada")) {
    pepitas -= 2; // Descuenta 2 pepitas
    actualizarContadorPepitas(); // Actualiza el contador
    
    // Revela el contenido de la carta
    carta.classList.add("revelada");
    carta.textContent = carta.dataset.curiosidad;
    
    // Reproduce sonido de éxito
    sonidos.oro.cloneNode().play();
    
    // Actualiza el resultado en la sección de rasca
    document.getElementById("resultado-rasca").innerText = carta.dataset.curiosidad;
    
    // Genera una nueva carta para reemplazar la rascada después de un delay
    setTimeout(() => {
      carta.remove();
      cartasGeneradas = cartasGeneradas.filter(c => c !== carta);
      generarNuevaCarta();
    }, 2000);
    
    // Actualiza el estado de los botones
    actualizarEstadoBotones();
  } else if (pepitas < 2) {
    // Si no tiene suficientes pepitas, muestra mensaje
    document.getElementById("resultado-rasca").innerText = "❌ Necesitas al menos 2 pepitas para rascar una carta.";
  }
}

// Event listener para el botón de rascar (funcionalidad alternativa)
if (btnRascar) {
  btnRascar.addEventListener("click", () => {
    // Busca la primera carta no revelada
    const cartaNoRevelada = cartasGeneradas.find(carta => !carta.classList.contains("revelada"));
    
    if (cartaNoRevelada && pepitas >= 2) {
      rascarCarta(cartaNoRevelada);
    } else if (pepitas < 2) {
      document.getElementById("resultado-rasca").innerText = "❌ Necesitas al menos 2 pepitas para rascar una carta.";
    } else {
      document.getElementById("resultado-rasca").innerText = "❌ No hay cartas disponibles para rascar.";
    }
  });
}

// --- Funciones auxiliares globales ---

// Función para actualizar el contador visual de pepitas
function actualizarContadorPepitas() {
  const pepitasEl = document.getElementById("pepitas");
  if (pepitasEl) {
    pepitasEl.innerText = pepitas;
  }
}

// Función para actualizar el estado de todos los botones según las pepitas disponibles
function actualizarEstadoBotones() {
  // Actualiza el botón de rascar carta
  if (btnRascar) {
    btnRascar.disabled = pepitas < 2;
    btnRascar.textContent = `Rascar Carta (2 pepitas)`;
  }
  
  // Actualiza el estilo visual de las cartas según si se pueden rascar
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

// Inicializa las cartas al cargar la página
generarCartasIniciales();

// Actualiza el estado inicial de los botones
actualizarEstadoBotones();