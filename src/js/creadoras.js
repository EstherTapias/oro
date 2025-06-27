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