let btnSun = document.getElementById("btnSun");
btnSun.addEventListener("click", function(eventInfo) 
{
    //debugger;
    let imagenes = document.getElementsByClassName("img-not-visible");
    imagenes[0].style.display = "block";
    imagenes[1].style.display = "block";
    imagenes[2].style.display = "block";
    imagenes[3].style.display = "block";
    imagenes[4].style.display = "block";
    imagenes[5].style.display = "block";
    imagenes[6].style.display = "block";
    imagenes[7].style.display = "block";
});