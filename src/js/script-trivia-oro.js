const preguntas = [
      {
        texto: "¿Por qué se usa oro en los teléfonos móviles?",
        opciones: [
          "Porque es bonito",
          "Porque conduce electricidad muy bien",
          "Porque es barato"
        ],
        correcta: 1
      },
      {
        texto: "¿Cuál de estos objetos puede contener oro?",
        opciones: ["Microchip", "Lata de refresco", "Camiseta"],
        correcta: 0
      },
      {
        texto: "¿En qué campo médico se usa el oro?",
        opciones: [
          "En tratamientos contra la artritis",
          "Para hacer termómetros de oro",
          "Para vacunas"
        ],
        correcta: 0
      },
      {
        texto: "¿Cuál de estos países es famoso por producir oro?",
        opciones: [
          "Canadá", "Japón", "Egipto"
        ],
        correcta: 0
      },
      {
        texto: "¿Qué color tiene el oro puro?",
        opciones: ["Plateado", "Amarillo", "Negro"],
        correcta: 1
      }
    ];

    let indice = 0;

    function mostrarPregunta() {
      const p = preguntas[indice];
      document.getElementById("pregunta").textContent = p.texto;

      const opcionesDiv = document.getElementById("opciones");
      opcionesDiv.innerHTML = "";

      p.opciones.forEach((opcion, i) => {
        const btn = document.createElement("button");
        btn.textContent = opcion;
        btn.className = "opcion";
        btn.onclick = () => verificar(i);
        opcionesDiv.appendChild(btn);
      });

      document.getElementById("resultado").textContent = "";
    }

    function verificar(elegida) {
      const esCorrecta = elegida === preguntas[indice].correcta;
      const resultado = document.getElementById("resultado");

      if (esCorrecta) {
        resultado.textContent = "✅ ¡Correcto!";
        resultado.style.color = "green";
        indice++;
        if (indice < preguntas.length) {
          setTimeout(() => {
            mostrarPregunta();
          }, 1000);
        } else {
          resultado.textContent = "🎉 ¡Terminaste la trivia del oro!";
          document.getElementById("pregunta").textContent = "";
          document.getElementById("opciones").innerHTML = "";
        }
      } else {
        resultado.textContent = "❌ Incorrecto. Intenta de nuevo.";
        resultado.style.color = "crimson";
      }
    }

    mostrarPregunta();