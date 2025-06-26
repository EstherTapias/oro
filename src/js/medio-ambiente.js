document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('.mostrar-explicación');

    botones.forEach(boton => {
        const tarjeta = boton.closest('.tarjeta');
        const explicacion = tarjeta.querySelector('.explicación');

        // Asegurar que esté oculto al inicio
        explicacion.style.display = 'none';

        // Evento: mostrar u ocultar texto
        boton.addEventListener('click', () => {
            const visible = explicacion.style.display === 'block';
            explicacion.style.display = visible ? 'none' : 'block';
            boton.textContent = visible ? 'Ver explicación' : 'Ocultar explicación';
        });
    });
});