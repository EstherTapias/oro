
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar/ocultar tarjetas de explicación
    const botones = document.querySelectorAll('.mostrar-explicación');

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            const tarjeta = boton.closest('.tarjeta');
            const explicacion = tarjeta.querySelector('.explicación');

            // Creamos una tarjeta emergente si no existe
            let nuevaTarjeta = tarjeta.querySelector('.tarjeta-explicacion');
            if (!nuevaTarjeta) {
                nuevaTarjeta = document.createElement('div');
                nuevaTarjeta.className = 'tarjeta-explicacion';
                nuevaTarjeta.style.backgroundColor = '#fff';
                nuevaTarjeta.style.border = '1px solid green';
                nuevaTarjeta.style.padding = '1rem';
                nuevaTarjeta.style.marginTop = '1rem';
                nuevaTarjeta.style.borderRadius = '8px';
                nuevaTarjeta.textContent = explicacion.textContent;
                tarjeta.appendChild(nuevaTarjeta);
                boton.textContent = 'Ocultar explicación';
            } else {
                tarjeta.removeChild(nuevaTarjeta);
                boton.textContent = 'Ver explicación';
            }
        });
    });
});

// Juego reciclaje
function verificarOro(boton) {
    const resultado = document.getElementById('resultado');
    if (boton.textContent === '📱' || boton.textContent === '💍') {
        resultado.textContent = "¡Correcto! Ese objeto contiene oro reciclable.";
    } else {
        resultado.textContent = "Ese objeto no contiene oro reciclable. Intenta otra vez.";
    }
}


fetch('../index.html')
  .then(response => response.text())
  .then(data => {
    // Extrai o header
    const headerMatch = data.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
    if (headerMatch) {
      document.getElementById('header-nave').innerHTML = headerMatch[1];
      runLogoAnimation(); // chama a animação depois de inserir o header
    }

    // Extrai o footer
    const footerMatch = data.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    if (footerMatch) {
      document.getElementById('footer').innerHTML = footerMatch[1];
    }
  });