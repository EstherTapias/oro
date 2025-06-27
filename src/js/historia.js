document.addEventListener("DOMContentLoaded", () => {
  // --- Mapa Leaflet ---
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

  // --- Quiz ---

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

  let pepitas = 0;
  let aciertos = 0;

  const pepitasEl = document.getElementById("pepitas");
  const contenedor = document.getElementById("quiz-container");
  const resultado = document.getElementById("resultado");

  // Sonidos (usa la ruta correcta para tus mp3)
  const sonidoCorrecto = new Audio("../public/assets/correct.mp3");
  const sonidoIncorrecto = new Audio("../public/assets/error.mp3");

  // Mezcla un array (Fisher-Yates sería ideal, pero para quiz está bien)
  function mezclarArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  // Carga el quiz generando HTML dinámico
  function cargarQuiz() {
    contenedor.innerHTML = "";
    aciertos = 0; // reset de aciertos

    const preguntasAleatorias = mezclarArray(preguntas);

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
      btn.style.backgroundColor = "#a5d6a7"; // verde claro
      pepitas++;
      aciertos++;
      pepitasEl.innerText = pepitas;
      sonidoCorrecto.play();
    } else {
      btn.style.backgroundColor = "#ef9a9a"; // rojo claro
      sonidoIncorrecto.play();
    }

    // Verificar si todas las preguntas respondidas
    const respondidas = [...document.querySelectorAll(".pregunta")].filter(p =>
      [...p.querySelectorAll("button")].every(b => b.disabled)
    );

    if (respondidas.length === preguntas.length) {
      resultado.innerText = `🎉 Acertaste ${aciertos} de ${preguntas.length} preguntas.`;
    }
  }

  // Botón reset quiz
  document.getElementById("btn-reset").addEventListener("click", () => {
    pepitas = 0;
    pepitasEl.innerText = "0";
    resultado.innerText = "";
    cargarQuiz();
  });

  cargarQuiz();
});

// --- Juego de excavación tipo Minecraft ---
const zonaJuego = document.getElementById("zona-juego");
const totalBloques = 20;
const bloquesConPepitas = new Set();

while (bloquesConPepitas.size < 5) {
  bloquesConPepitas.add(Math.floor(Math.random() * totalBloques));
}

for (let i = 0; i < totalBloques; i++) {
  const bloque = document.createElement("div");
  bloque.classList.add("bloque");
  bloque.addEventListener("click", () => excavarBloque(bloque, i));
  zonaJuego.appendChild(bloque);
}

function excavarBloque(bloque, index) {
  if (bloque.classList.contains("excavado")) return;
  bloque.classList.add("excavado");

  if (bloquesConPepitas.has(index)) {
    pepitas++;
    pepitasEl.innerText = pepitas;
    bloque.textContent = "💰";
    sonidoCorrecto.play();
  } else {
    bloque.textContent = "🪨";
    sonidoIncorrecto.play();
  }

  // Activar botón rascar si tenemos suficientes pepitas
  actualizarBotonRascar();
}

function actualizarBotonRascar() {
  document.getElementById("btn-rascar").disabled = pepitas < 3;
}

// --- Rasca y gana ---
const curiosidades = [
  "🔍 El oro es tan maleable que se puede estirar en hilos de nanómetros.",
  "🏛️ Los antiguos egipcios creían que el oro era carne de los dioses.",
  "🌡️ El oro no se oxida ni se corroe fácilmente.",
  "👑 Se han encontrado joyas de oro con más de 4000 años de antigüedad.",
  "🚀 La NASA usa oro en los trajes espaciales por su capacidad de reflejar radiación."
];

document.getElementById("btn-rascar").addEventListener("click", () => {
  if (pepitas >= 3) {
    pepitas -= 3;
    pepitasEl.innerText = pepitas;
    const dato = curiosidades[Math.floor(Math.random() * curiosidades.length)];
    document.getElementById("resultado-rasca").innerText = dato;
    actualizarBotonRascar();
  }
});


  