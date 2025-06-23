document.addEventListener("DOMContentLoaded", () => {
  // Mapa
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

  // Quiz
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
  const sonidoCorrecto = new Audio("../pub/assets/correcto.mp3");
  const sonidoIncorrecto = new Audio("../pub/assets/incorrecto.mp3");

  function mezclarArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function cargarQuiz() {
    contenedor.innerHTML = "";
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
      btn.style.backgroundColor = "#a5d6a7";
      pepitas++;
      aciertos++;
      pepitasEl.innerText = pepitas;
      sonidoCorrecto.play();
    } else {
      btn.style.backgroundColor = "#ef9a9a";
      sonidoIncorrecto.play();
    }

    const respondidas = [...document.querySelectorAll(".pregunta")].filter(p =>
      [...p.querySelectorAll("button")].every(b => b.disabled)
    );

    if (respondidas.length === preguntas.length) {
      resultado.innerText = `🎉 Acertaste ${aciertos} de ${preguntas.length} preguntas.`;
    }
  }

  document.getElementById("btn-reset").addEventListener("click", () => {
    pepitas = 0;
    aciertos = 0;
    pepitasEl.innerText = "0";
    resultado.innerText = "";
    cargarQuiz();
  });

  cargarQuiz();
});


  