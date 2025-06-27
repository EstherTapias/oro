sunPic.addEventListener("click", function (eventInfo) {
    //Busca todas las imágenes que están visibles y no visibles
    let imagenes = document.querySelectorAll(".img-not-visible, .img-visible");

    //Recorre todas las imágenes encontradas
    imagenes.forEach(img => {
        //Si la imagen está oculta...
        if (img.classList.contains("img-not-visible")) {
            //La muestra
            img.classList.remove("img-not-visible");
            img.classList.add("img-visible");
        } else {
            //Si está visible... La oculta
            img.classList.remove("img-visible");
            img.classList.add("img-not-visible");
        }
    });
});

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