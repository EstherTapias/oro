function runLogoAnimation() {
    const imgLogoHTML = document.getElementById('logo-img');
    const imgsLogo = [
        '../public/img/logo-au-1.svg',
    ];

    for (let index = 2; index <= 8; index++) {
        imgsLogo.push(`../public/img/logo-au-${index}.svg`);
    }

    let currentLogoIndex = 0;
    let hoverInterval = null;

    function startLogoCycle() {
        if (hoverInterval) return;

        hoverInterval = setInterval(() => {
            currentLogoIndex = (currentLogoIndex + 1) % imgsLogo.length;
            imgLogoHTML.src = imgsLogo[currentLogoIndex];
        }, 100);
    }

    function stopLogoCycle() {
        clearInterval(hoverInterval);
        hoverInterval = null;
        currentLogoIndex = 0;
        imgLogoHTML.src = imgsLogo[currentLogoIndex];
    }
    imgLogoHTML.addEventListener('mouseenter', startLogoCycle);
    imgLogoHTML.addEventListener('mouseleave', stopLogoCycle);
}