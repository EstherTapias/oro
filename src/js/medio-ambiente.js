document.addEventListener('DOMContentLoaded', () => {
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

    // Imagen dinámica en sección extracción
    const imagen = document.createElement('img');
    imagen.src = "https://cdn.pixabay.com/photo/2021/04/17/08/25/gold-mine-6184747_1280.jpg";
    imagen.alt = "Minería del oro";
    imagen.style.width = "100%";
    imagen.style.borderRadius = "12px";
    document.querySelector('.extracción').appendChild(imagen);
});