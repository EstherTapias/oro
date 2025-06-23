document.addEventListener("DOMContentLoaded", () => {
  const mapa = L.map("mapa").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Mapa: OpenStreetMap'
  }).addTo(mapa);

  const productores = [
    { pais: "China", coords: [35.8617, 104.1954], info: "🏆 China produce más de 400 toneladas al año." },
    { pais: "Australia", coords: [-25.2744, 133.7751], info: "🇦🇺 Segundo mayor productor de oro del mundo." },
    { pais: "Rusia", coords: [61.5240, 105.3188], info: "🇷🇺 Rusia es un gran exportador de oro." },
    { pais: "EE.UU.", coords: [37.0902, -95.7129], info: "🇺🇸 Nevada es su estado con más minas de oro." },
    { pais: "Sudáfrica", coords: [-30.5595, 22.9375], info: "🇿🇦 Fue el líder mundial durante el siglo XX." },
  ];

  productores.forEach(p => {
    L.marker(p.coords).addTo(mapa).bindPopup(`<strong>${p.pais}</strong><br>${p.info}`);
  });

  document.getElementById("btn-expandir-mapa").addEventListener("click", () => {
    const mapaDiv = document.getElementById("mapa");
    mapaDiv.classList.toggle("mapa-grande");
    mapa.invalidateSize();
  });
});

let aciertos = 0;
let pepitas = 0;
const pepitasEl = document.getElementById("pepitas");
const sonidoCorrecto = new Audio("../assets/correcto.mp3");
const sonidoIncorrecto = new Audio("../assets/incorrecto.mp3");

function responder(btn, correcto) {
  const botones = btn.parentElement.querySelectorAll("button");
  botones.forEach(b => b.disabled = true);

  if (correcto) {
    btn.style.backgroundColor = "#a5d6a7";
    aciertos++;
    pepitas++;
    pepitasEl.innerText = pepitas;
    sonidoCorrecto.play();
  } else {
    btn.style.backgroundColor = "#ef9a9a";
    sonidoIncorrecto.play();
  }

  const preguntas = document.querySelectorAll(".pregunta");
  const respondidas = [...preguntas].filter(p => {
    return [...p.querySelectorAll("button")].every(b => b.disabled);
  });

  if (respondidas.length === preguntas.length) {
    document.getElementById("resultado").innerText = `🎉 Acertaste ${aciertos} de ${preguntas.length} preguntas.`;
  }
}

document.getElementById("btn-reset").addEventListener("click", () => {
  aciertos = 0;
  pepitas = 0;
  pepitasEl.innerText = "0";
  document.getElementById("resultado").innerText = "";

  document.querySelectorAll(".pregunta").forEach(p => {
    p.querySelectorAll("button").forEach(b => {
      b.disabled = false;
      b.style.backgroundColor = "#fdd835";
    });
  });
});


  