const preguntas = [
      {
        texto: "En la antigüedad, el oro no solo servía como adorno. ¿Qué uso medicinal le daban los antiguos egipcios al oro?",
        opciones: [
          "Para combatir infecciones",
          "En tratamientos para purificar el cuerpo y el alma",
          "Como anestesia primitiva"
        ],
        correcta: 1
      },
      {
        texto: "¿Qué famoso artista del siglo XX usó polvo de oro real en sus obras como símbolo de lo eterno?",
        opciones: ["Pablo Picasso", "Gustav Klimt", "Andy Warhol"],
        correcta: 1
      },
      {
        texto: "¿Por qué los astronautas usan oro en sus trajes espaciales o visores?",
        opciones: [
        "Porque hace que los trajes sean más ligeros", "Por puro lujo galáctico", "Porque refleja radiación solar peligrosa"
        ],
        correcta: 2
      },
      {
        texto: "¿Qué función tiene el oro en la medicina moderna?",
        opciones: ["En tratamientos contra ciertos tipos de artritis", "Se inyecta para regenerar músculos", "Se usa para hacer dientes invisibles"],
        correcta: 0
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
        resultado.textContent = "✅ ¡Correcto, bien hecho!";
        resultado.style.color = "green";
        indice++;
        if (indice < preguntas.length) {
          setTimeout(() => {
            mostrarPregunta();
          }, 1000);
        } else {
          resultado.textContent = "🎉 ¡Has terminado la Trivia del Oro, gracias por jugar! 🎉";
          document.getElementById("pregunta").textContent = "";
          document.getElementById("opciones").innerHTML = "";
        }
      } else {
        resultado.textContent = "❌ Incorrecto. Inténtalo de nuevo.";
        resultado.style.color = "crimson";
      }
    }

    mostrarPregunta();