// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
// Esto asegura que todos los elementos HTML estén disponibles para manipular
document.addEventListener("DOMContentLoaded", () => {

  // --- VARIABLES GLOBALES ---
  // Estas variables mantienen el estado del juego durante toda la sesión
  let pepitas = 0; // Contador de pepitas de oro ganadas por el jugador
  let aciertos = 0; // Contador de respuestas correctas en el quiz actual
  let preguntasActuales = []; // Array que almacena las preguntas seleccionadas aleatoriamente para el quiz
  let curiosidadesActuales = []; // Array que almacena las curiosidades seleccionadas aleatoriamente para las cartas

  // --- REFERENCIAS AL DOM ---
  // Obtenemos referencias a los elementos HTML que vamos a manipular
  const pepitasEl = document.getElementById("pepitas");// Elemento span que muestra el contador de pepitas
  const contenedor = document.getElementById("quiz-container");// Div contenedor donde se muestran las preguntas del quiz
  const resultado = document.getElementById("resultado");// Div donde se muestra el resultado final del quiz
  const zonaJuego = document.getElementById("zona-juego");// Div donde se muestran los bloques para excavar
  const btnRascar = document.getElementById("btn-rascar");// Botón para rascar cartas de curiosidades
  const btnResetExcavacion = document.getElementById("btn-reset-excavacion");// Botón para reiniciar el juego de excavación
  const cartasContainer = document.getElementById("cartas-container"); // Div contenedor donde se muestran las cartas rasca y gana

  
  // --- MAPA INTERACTIVO (Leaflet) ---
  // Inicializa un mapa interactivo usando la librería Leaflet
  const mapa = L.map("mapa").setView([20, 0], 2); // Crea el mapa centrado en coordenadas [latitud, longitud] con zoom nivel 2

  // Carga los tiles (capas de imagen) desde OpenStreetMap para mostrar el mapa base
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Mapa: OpenStreetMap' // Texto de atribución que aparece en el mapa
  }).addTo(mapa); // Añade la capa de tiles al mapa

  // Lista de países productores de oro con sus coordenadas geográficas e información descriptiva
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

  // Itera sobre cada país productor para añadir marcadores al mapa
  productores.forEach(p => {
    // Crea un marcador en las coordenadas del país
    L.marker(p.coords).addTo(mapa) // Añade el marcador al mapa
    .bindPopup(`<strong>${p.pais}</strong><br>${p.info}`); // Asocia un popup con información que aparece al hacer clic
  });

  // Añade funcionalidad al botón para expandir el mapa a pantalla completa
  document.getElementById("btn-expandir-mapa").addEventListener("click", () => {
    const mapaDiv = document.getElementById("mapa"); // Obtiene el div contenedor del mapa
    mapaDiv.classList.toggle("mapa-grande"); // Añade o quita la clase CSS "mapa-grande" para cambiar el tamaño
    mapa.invalidateSize(); // Recalcula el tamaño del mapa para que se ajuste correctamente al nuevo contenedor
  });

  // --- EFECTOS DE SONIDO ---
  // Crea objetos Audio para los diferentes sonidos del juego
  const sonidos = {
    correcto: new Audio("./public/sounds/correct.mp3"), // Sonido que se reproduce cuando se acierta una pregunta
    incorrecto: new Audio("./public/sounds/error.mp3"), // Sonido que se reproduce cuando se falla una pregunta
    excavar: new Audio("./public/sounds/dig.mp3"), // Sonido que se reproduce al hacer clic en un bloque para excavar
    oro: new Audio("./public/sounds/correct.mp3"), // Sonido que se reproduce al encontrar oro
    piedra: new Audio("./public/sounds/stone.mp3") // Sonido que se reproduce al encontrar piedra
  };

  // Función para reproducir un sonido de forma segura (con manejo de errores)
  function reproducirSonido(sonido) {
    try {
      const audio = sonido.cloneNode(); // Crea una copia del objeto audio para permitir múltiples reproducciones simultáneas
      audio.play().catch(e => console.log('No se pudo reproducir el sonido:', e)); // Intenta reproducir y captura errores
    } catch (e) {
      console.log('Error con el sonido:', e); // Maneja errores si el navegador no soporta audio
    }
  }

  // --- QUIZ SOBRE EL ORO ---
  // Banco de preguntas con sus respectivas respuestas múltiples
  // Cada pregunta tiene un array de respuestas donde solo una tiene "correcta: true"
  const bancoPreguntas = [
    {
      pregunta: "¿Cuál es el símbolo químico del oro?", // Texto de la pregunta
      respuestas: [ // Array de posibles respuestas
        { texto: "Au", correcta: true }, // La respuesta correcta (Aurum en latín)
        { texto: "Ag", correcta: false }, // Respuesta incorrecta (Ag es plata)
        { texto: "Or", correcta: false }, // Respuesta incorrecta
        { texto: "Go", correcta: false } // Respuesta incorrecta
      ]
    },
    {
      pregunta: "¿En qué país se produce más oro actualmente?",
      respuestas: [
        { texto: "China", correcta: true }, // China es actualmente el mayor productor
        { texto: "Sudáfrica", correcta: false }, // Fue líder pero ya no
        { texto: "Brasil", correcta: false },
        { texto: "Australia", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué color tiene el oro puro de 24 quilates?",
      respuestas: [
        { texto: "Amarillo intenso", correcta: true }, // El oro puro tiene un color amarillo muy característico
        { texto: "Plateado", correcta: false },
        { texto: "Rojo", correcta: false },
        { texto: "Blanco", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál es la densidad aproximada del oro?",
      respuestas: [
        { texto: "19.3 g/cm³", correcta: true }, // El oro es muy denso, por eso es tan pesado
        { texto: "10.5 g/cm³", correcta: false },
        { texto: "7.8 g/cm³", correcta: false },
        { texto: "2.7 g/cm³", correcta: false }
      ]
    },
    {
      pregunta: "¿En qué temperatura se funde el oro?",
      respuestas: [
        { texto: "1064°C", correcta: true }, // Punto de fusión específico del oro
        { texto: "850°C", correcta: false },
        { texto: "1200°C", correcta: false },
        { texto: "950°C", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál era la moneda de oro más famosa de la antigua Roma?",
      respuestas: [
        { texto: "Aureus", correcta: true }, // La moneda de oro romana más importante
        { texto: "Denarius", correcta: false }, // Era de plata
        { texto: "Solidus", correcta: false },
        { texto: "Sestertius", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué método químico se usa comúnmente para extraer oro de la roca?",
      respuestas: [
        { texto: "Cianuración", correcta: true }, // Proceso químico industrial para extraer oro
        { texto: "Electrólisis", correcta: false },
        { texto: "Destilación", correcta: false },
        { texto: "Cristalización", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál es el mayor yacimiento de oro del mundo?",
      respuestas: [
        { texto: "Witwatersrand (Sudáfrica)", correcta: true }, // El complejo minero más grande históricamente
        { texto: "Klondike (Canadá)", correcta: false },
        { texto: "California (EE.UU.)", correcta: false },
        { texto: "Yukon (Alaska)", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué civilización antigua llamaba al oro 'lágrimas del sol'?",
      respuestas: [
        { texto: "Los Incas", correcta: true }, // Los Incas tenían esta poética denominación
        { texto: "Los Egipcios", correcta: false },
        { texto: "Los Griegos", correcta: false },
        { texto: "Los Romanos", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuánto oro hay aproximadamente en el cuerpo humano?",
      respuestas: [
        { texto: "0.2 miligramos", correcta: true }, // Cantidad microscópica pero presente
        { texto: "2 gramos", correcta: false },
        { texto: "No hay oro", correcta: false },
        { texto: "20 miligramos", correcta: false }
      ]
    },
    {
      pregunta: "¿Qué aleación forma el oro blanco?",
      respuestas: [
        { texto: "Oro + Paladio/Platino", correcta: true }, // Aleación que crea oro blanco
        { texto: "Oro + Plata", correcta: false },
        { texto: "Oro + Cobre", correcta: false },
        { texto: "Oro + Níquel únicamente", correcta: false }
      ]
    },
    {
      pregunta: "¿Cuál fue la fiebre del oro más famosa de la historia?",
      respuestas: [
        { texto: "California 1849", correcta: true }, // La fiebre del oro más conocida mundialmente
        { texto: "Alaska 1890", correcta: false },
        { texto: "Australia 1850", correcta: false },
        { texto: "Sudáfrica 1870", correcta: false }
      ]
    }
  ];
  
  // Función para mezclar elementos de un array de forma aleatoria usando el algoritmo Fisher-Yates
  function mezclarArray(arr) {
    // Math.random() - 0.5 produce valores entre -0.5 y 0.5, creando orden aleatorio
    return arr.sort(() => Math.random() - 0.5);
  }

  // Función para seleccionar un subconjunto aleatorio de preguntas del banco completo
  function seleccionarPreguntasAleatorias() {
    const preguntasMezcladas = mezclarArray([...bancoPreguntas]); // Crea copia del array y lo mezcla
    preguntasActuales = preguntasMezcladas.slice(0, 5); // Toma solo las primeras 5 preguntas mezcladas
  }

  // Función principal que carga y muestra el quiz en el DOM
  function cargarQuiz() {
    contenedor.innerHTML = ""; // Limpia todo el contenido previo del contenedor
    aciertos = 0; // Resetea el contador de aciertos para el nuevo quiz
    
    // Selecciona nuevas preguntas aleatorias cada vez que se carga el quiz
    seleccionarPreguntasAleatorias();

    // Itera sobre cada pregunta seleccionada para crear los elementos DOM
    preguntasActuales.forEach((q, i) => {
      const div = document.createElement("div"); // Crea un div contenedor para la pregunta
      div.classList.add("pregunta"); // Añade clase CSS para estilos

      const p = document.createElement("p"); // Crea párrafo para el texto de la pregunta
      // Incluye el número de pregunta y el texto, usando template literals
      p.innerHTML = `<span class="numero-pregunta">${i + 1}.</span> ${q.pregunta}`;
      div.appendChild(p); // Añade el párrafo al div contenedor

      const respuestasAleatorias = mezclarArray([...q.respuestas]); // Mezcla las respuestas para evitar patrones
      // Crea un botón para cada respuesta posible
      respuestasAleatorias.forEach(r => {
        const btn = document.createElement("button"); // Crea elemento botón
        btn.textContent = r.texto; // Establece el texto del botón
        // Asigna función de click que maneja la respuesta
        btn.onclick = () => responder(btn, r.correcta, div);
        div.appendChild(btn); // Añade el botón al contenedor de la pregunta
      });

      contenedor.appendChild(div); // Añade toda la pregunta al contenedor principal
    });
  }
  
  // Función que maneja la lógica cuando el usuario responde una pregunta
  function responder(btn, correcta, div) {
    const botones = div.querySelectorAll("button"); // Obtiene todos los botones de esta pregunta
    botones.forEach(b => b.disabled = true); // Desactiva todos los botones para evitar múltiples clics

    if (correcta) {
      // Lógica para respuesta correcta
      btn.style.backgroundColor = "#4caf50"; // Color verde para correcto
      btn.style.color = "white"; // Texto blanco para contraste
      btn.innerHTML = `✓ ${btn.textContent}`; // Añade checkmark al texto
      pepitas += 2; // Otorga 2 pepitas por respuesta correcta
      aciertos++; // Incrementa contador de aciertos
      actualizarContadorPepitas(); // Actualiza la visualización de pepitas
      reproducirSonido(sonidos.correcto); // Reproduce sonido de éxito
    } else {
      // Lógica para respuesta incorrecta
      btn.style.backgroundColor = "#f44336"; // Color rojo para incorrecto
      btn.style.color = "white"; // Texto blanco para contraste
      btn.innerHTML = `✗ ${btn.textContent}`; // Añade X al texto
      reproducirSonido(sonidos.incorrecto); // Reproduce sonido de error
      
      // Busca y resalta la respuesta correcta
      const respuestaCorrecta = [...botones].find(b => 
        // Busca el botón que corresponde a la respuesta correcta
        preguntasActuales.find(p => p.respuestas.some(r => r.texto === b.textContent && r.correcta))
      );
      if (respuestaCorrecta) {
        respuestaCorrecta.style.backgroundColor = "#4caf50"; // Verde para la correcta
        respuestaCorrecta.style.color = "white";
        respuestaCorrecta.innerHTML = `✓ ${respuestaCorrecta.textContent} (Correcta)`; // Marca como correcta
      }
    }
    
    // Verifica si todas las preguntas han sido respondidas
    const respondidas = [...document.querySelectorAll(".pregunta")].filter(p =>
      // Filtra preguntas donde todos los botones están desactivados (respondidas)
      [...p.querySelectorAll("button")].every(b => b.disabled)
    );
    
    // Si todas las preguntas están respondidas, muestra el resultado final
    if (respondidas.length === preguntasActuales.length) {
      const porcentaje = Math.round((aciertos / preguntasActuales.length) * 100); // Calcula porcentaje
      let mensaje = `🎉 Acertaste ${aciertos} de ${preguntasActuales.length} preguntas (${porcentaje}%)`;
      
      // Personaliza el mensaje según el rendimiento
      if (porcentaje >= 80) {
        mensaje += "\n🏆 ¡Excelente! Eres todo un experto en oro.";
      } else if (porcentaje >= 60) {
        mensaje += "\n👍 ¡Bien! Tienes buenos conocimientos sobre el oro.";
      } else {
        mensaje += "\n📚 Sigue aprendiendo, ¡puedes mejorar!";
      }
      
      resultado.innerText = mensaje; // Muestra el mensaje final
    }

    actualizarEstadoBotones(); // Actualiza el estado de los botones del juego
  }
  
  // Event listener para el botón de reiniciar quiz
  document.getElementById("btn-reset").addEventListener("click", () => {
    resultado.innerText = ""; // Limpia el resultado anterior
    cargarQuiz(); // Carga nuevas preguntas aleatorias
    actualizarEstadoBotones(); // Actualiza estado de botones
  });

  // --- Juego de Excavación ---
  const totalBloques = 25; // Número total de bloques en la cuadrícula de excavación (5x5)
  let bloquesConPepitas = new Set(); // Set que almacena los índices de bloques que contienen oro
  let bloquesExcavados = new Set(); // Set que almacena los índices de bloques ya excavados

  // Función para inicializar completamente el juego de excavación
  function inicializarExcavacion() {
    zonaJuego.innerHTML = ""; // Limpia todos los bloques anteriores del DOM
    bloquesConPepitas.clear(); // Limpia el set de bloques con pepitas
    bloquesExcavados.clear(); // Limpia el set de bloques excavados
    
    // Genera aleatoriamente 8 posiciones que contendrán oro
    while (bloquesConPepitas.size < 8) {
      // Añade índices aleatorios hasta tener 8 bloques con oro
      bloquesConPepitas.add(Math.floor(Math.random() * totalBloques));
    }

    // Crea todos los bloques del juego (25 bloques en total)
    for (let i = 0; i < totalBloques; i++) {
      const bloque = document.createElement("div"); // Crea elemento div para el bloque
      bloque.className = "bloque"; // Asigna clase CSS para estilos
      bloque.style.backgroundImage = "url('../public/img/dirt-block.png')"; // Imagen de tierra sin excavar
      bloque.style.backgroundSize = "cover"; // Ajusta la imagen al tamaño del bloque
      // Asigna evento de click para excavar este bloque específico
      bloque.addEventListener("click", () => excavarBloque(bloque, i));
      zonaJuego.appendChild(bloque); // Añade el bloque a la zona de juego
    }
  }

  // Función para excavar un bloque específico cuando se hace clic
  function excavarBloque(bloque, index) {
    if (bloquesExcavados.has(index)) return;  // Si ya está excavado, no hace nada (evita doble excavación)

    bloquesExcavados.add(index); // Marca este bloque como excavado
    bloque.classList.add("excavado"); // Añade clase CSS para efectos visuales
    
    reproducirSonido(sonidos.excavar); // Reproduce sonido de excavación inmediatamente

    // Timeout para simular el tiempo que toma excavar (efecto de anticipación)
    setTimeout(() => {
      if (bloquesConPepitas.has(index)) {
        // Este bloque contiene oro
        pepitas += 3; // Otorga 3 pepitas por encontrar oro (más que el quiz)
        actualizarContadorPepitas(); // Actualiza el contador visual
        bloque.style.backgroundImage = "url('../public/img/gold.png')"; // Cambia a imagen de oro
        bloque.classList.add("oro-encontrado"); // Añade clase para efectos especiales
        reproducirSonido(sonidos.oro); // Reproduce sonido de éxito
      } else {
        // Este bloque contiene solo piedra
        bloque.style.backgroundImage = "url('../public/img/stone-block.png')"; // Cambia a imagen de piedra
        reproducirSonido(sonidos.piedra); // Reproduce sonido de piedra
      }
      actualizarEstadoBotones(); // Actualiza estado de botones después de la excavación
    }, 300); // Espera 300ms para el efecto
  }

  // Event listener para el botón de reiniciar excavación
  if (btnResetExcavacion) { // Verifica que el botón existe
    btnResetExcavacion.addEventListener("click", () => {
      inicializarExcavacion(); // Reinicia completamente el juego de excavación
      actualizarEstadoBotones(); // Actualiza estado de botones
    });
  }

  // --- Banco de curiosidades para las cartas rasca y gana ---
  // Array que contiene curiosidades sobre el oro, cada una representada como un string
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

  let cartasGeneradas = []; // Array que almacena todas las cartas DOM creadas
  let cartasReveladas = []; // Array para mantener registro de las cartas que ya fueron rascadas

  // Función para seleccionar un subconjunto aleatorio de curiosidades
  function seleccionarCuriosidadesAleatorias() {
    const curiosidadesMezcladas = mezclarArray([...bancoCuriosidades]); // Mezcla todas las curiosidades del banco usando el spread operator
    curiosidadesActuales = curiosidadesMezcladas.slice(0, 10); // Selecciona solo 10 curiosidades para esta sesión de juego
  }

  // Función para generar el conjunto inicial de cartas al cargar el juego
  function generarCartasIniciales() {
    if (!cartasContainer) return; // Verificación de seguridad: sale si el contenedor no existe
    
    cartasContainer.innerHTML = ""; // Limpia el contenedor de cualquier carta previa
    cartasGeneradas = []; // Reinicia el array de cartas generadas para empezar limpio
    cartasReveladas = []; // Limpia el registro de cartas reveladas para nueva sesión
    
    // Selecciona nuevas curiosidades aleatorias para esta sesión
    seleccionarCuriosidadesAleatorias();
    
    for (let i = 0; i < 4; i++) { // Bucle que genera 4 cartas iniciales para dar opciones al jugador
      generarNuevaCarta();
    }
  }

  // Función para crear una nueva carta individual
  function generarNuevaCarta() {
    if (!cartasContainer || curiosidadesActuales.length === 0) return; // Verifica que existe contenedor y hay curiosidades disponibles
    
    const carta = document.createElement("div"); // Crea un nuevo elemento div que será la carta
    carta.className = "carta"; // Asigna la clase CSS 'carta' para aplicar estilos
    
    // Selecciona una curiosidad aleatoria de las disponibles en el array actual
    const curiosidadIndex = Math.floor(Math.random() * curiosidadesActuales.length);
    const curiosidadAleatoria = curiosidadesActuales[curiosidadIndex];
    
    // Remueve la curiosidad seleccionada del array para evitar repeticiones futuras
    curiosidadesActuales.splice(curiosidadIndex, 1);
    
    // Almacena la curiosidad en el atributo data de la carta para acceso posterior
    carta.dataset.curiosidad = curiosidadAleatoria;
    
    // Establece la imagen de fondo que simula una carta sin rascar
    carta.style.backgroundImage = "url('../public/img/carta-rascar.png')";
    carta.style.backgroundSize = "cover"; // Hace que la imagen cubra todo el elemento
    carta.style.backgroundPosition = "center"; // Centra la imagen de fondo
    
    // Añade evento click que permitirá rascar la carta cuando se haga clic
    carta.addEventListener("click", () => rascarCarta(carta));
    
    cartasContainer.appendChild(carta); // Inserta la carta en el contenedor del DOM
    cartasGeneradas.push(carta); // Registra la carta en el array de control global
  }

  // Función para rascar una carta específica y revelar su contenido
  function rascarCarta(carta) {
    const resultadoRasca = document.getElementById("resultado-rasca"); // Obtiene elemento para mostrar feedback al usuario
    // Verifica que el jugador tenga al menos 3 pepitas y que la carta no esté ya revelada
    if (pepitas >= 3 && !carta.classList.contains("revelada")) {
      pepitas -= 3; // Descuenta 3 pepitas como costo del rascado
      actualizarContadorPepitas(); // Actualiza visualmente el contador de pepitas
  
      carta.classList.add("revelada"); // Marca la carta como revelada para evitar rascado múltiple
      
      // Crea el contenedor que mostrará el texto de la curiosidad
      const contenido = document.createElement("div");
      contenido.classList.add("contenido-carta"); // Aplica clase CSS para estilos del contenido
      contenido.textContent = carta.dataset.curiosidad; // Inserta el texto de la curiosidad
      carta.appendChild(contenido); // Añade el contenido a la carta
  
      // Registra la carta rascada en el array de cartas reveladas
      cartasReveladas.push({
        elemento: carta, // Referencia al elemento DOM de la carta
        curiosidad: carta.dataset.curiosidad // Texto de la curiosidad revelada
      });
  
      reproducirSonido(sonidos.oro); // Reproduce sonido de éxito/recompensa
  
      // Muestra mensaje de éxito con la curiosidad descubierta en el área de resultados
      if (resultadoRasca) {
        resultadoRasca.innerHTML = `<strong>¡Descubierto!</strong><br>${carta.dataset.curiosidad}`;
      }
  
      actualizarEstadoBotones(); // Actualiza el estado de todos los botones según pepitas restantes
  
      // Programa la generación de una nueva carta si quedan pocas disponibles
      setTimeout(() => {
        // Cuenta cartas no reveladas y genera nueva si hay menos de 2 disponibles
        if (cartasGeneradas.filter(c => !c.classList.contains("revelada")).length < 2) {
          generarNuevaCarta();
        }
      }, 1000); // Espera 1 segundo antes de generar nueva carta
    } else if (pepitas < 3) {
      // Manejo de error cuando no hay suficientes pepitas para rascar
      if (resultadoRasca) {
        resultadoRasca.innerHTML = "<strong>❌ Necesitas al menos 3 pepitas para rascar una carta.</strong>";
      }
    }
  }
  
  // Event listener para el botón de rascar cartas
  if (btnRascar) {
    btnRascar.addEventListener("click", () => {
      // Busca la primera carta disponible (no revelada) en el array
      const cartaNoRevelada = cartasGeneradas.find(carta => !carta.classList.contains("revelada"));
      const resultadoRasca = document.getElementById("resultado-rasca"); // Elemento para mostrar mensajes
      
      // Si hay carta disponible y suficientes pepitas, procede a rascar
      if (cartaNoRevelada && pepitas >= 3) {
        rascarCarta(cartaNoRevelada);
      } else if (pepitas < 3) {
        // Mensaje de error por pepitas insuficientes
        if (resultadoRasca) {
          resultadoRasca.innerHTML = "<strong>❌ Necesitas al menos 3 pepitas para rascar una carta.</strong>";
        }
      } else {
        // Mensaje de error cuando no hay cartas disponibles para rascar
        if (resultadoRasca) {
          resultadoRasca.innerHTML = "<strong>❌ No hay cartas disponibles para rascar.</strong>";
        }
      }
    });
  }

  // --- Funciones auxiliares globales ---
   // Función para actualizar el contador de pepitas en la interfaz
  function actualizarContadorPepitas() {
    if (pepitasEl) { // Verifica que el elemento contador existe en el DOM
      pepitasEl.innerText = pepitas; // Actualiza el texto con el número actual de pepitas
      
      // Añade animación visual al contador cuando cambian las pepitas
      pepitasEl.parentElement.classList.add("contador-animado");
      setTimeout(() => {
        pepitasEl.parentElement.classList.remove("contador-animado"); // Remueve la animación después de 600ms
      }, 600);
    }
  }

  // Función para actualizar el estado visual de todos los botones según las pepitas disponibles
  function actualizarEstadoBotones() {
    if (btnRascar) { // Actualiza el botón de rascar si existe
      btnRascar.disabled = pepitas < 3; // Deshabilita el botón si no hay suficientes pepitas
      btnRascar.textContent = `Rascar Carta (3 pepitas) ${pepitas >= 3 ? '✨' : '❌'}`; // Actualiza texto con indicador visual
    }
    
    // Recorre todas las cartas generadas para actualizar su estado visual
    cartasGeneradas.forEach(carta => {
      if (!carta.classList.contains("revelada")) { // Solo modifica cartas no reveladas
        if (pepitas >= 3) { // Si tiene suficientes pepitas para rascar
          carta.style.cursor = "pointer"; // Cursor que indica elemento clickeable
          carta.style.opacity = "1"; // Opacidad completa (carta habilitada)
          carta.style.filter = "brightness(1)"; // Brillo normal
        } else { // Si no tiene suficientes pepitas
          carta.style.cursor = "not-allowed"; // Cursor que indica elemento no disponible
          carta.style.opacity = "0.7"; // Opacidad reducida (carta deshabilitada)
          carta.style.filter = "brightness(0.5)"; // Brillo reducido para indicar inactividad
        }
      }
    });
  }
  

  // --- Inicialización del juego ---
  cargarQuiz(); // Inicializa el sistema de quiz del juego
  inicializarExcavacion(); // Inicializa el minijuego de excavación
  generarCartasIniciales(); // Genera las primeras 4 cartas del juego
  actualizarEstadoBotones(); // Establece el estado inicial de todos los botones
  
  // Mensaje de bienvenida que se muestra al inicio del juego
  setTimeout(() => {
    if (pepitas === 0) { // Solo muestra el mensaje si el jugador empieza sin pepitas
      alert("🌟 ¡Bienvenido al mundo del oro! 🌟\n\nResponde el quiz y excava para ganar pepitas de oro.\nUsa las pepitas para descubrir curiosidades fascinantes.\n\n¡Que comience la aventura! ⛏️💰");
    }
  }, 1000); // Espera 1 segundo antes de mostrar el mensaje
});

// Event listener que se ejecuta cuando el DOM está completamente cargado
window.addEventListener('DOMContentLoaded', () => {
  runLogoAnimation(); // Ejecuta la animación del logo de inicio
});