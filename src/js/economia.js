fetch('../index.html')
  .then(response => response.text())
  .then(data => {
    const headerMatch = data.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
    if (headerMatch) {
      document.getElementById('header-nave').innerHTML = headerMatch[1];
      runLogoAnimation();
    }
    const footerMatch = data.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
    if (footerMatch) {
      document.getElementById('footer').innerHTML = footerMatch[1];
    }
  });

/* Logo */


/*Buttons Yes and No */
const chartSound = new Audio('../public/sounds/cash-register-fake-88639.mp3');
function playSoundChart() {
  chartSound.currentTime = 0;
  chartSound.play();
}
const videoContainer = document.getElementById('video-container');
console.log(videoContainer);
const videoMP4 = document.getElementById('videoMP4');
console.log(videoMP4);
function changeStatusYes() {
  statusChart = document.querySelector(".chart-visibility");
  statusVideo = document.querySelector(".video-visibility");
  if (statusChart.classList.contains("chart-hide")) {
    statusChart.classList.remove("chart-hide");
    statusChart.classList.add("chart-show");
    setTimeout(() => {
      if (!chartInstance) {
        renderChart();
      } else {
        chartInstance.resize();
      }
    }, 100);
  }
  if (statusVideo.classList.contains("video-show")) {
    statusVideo.classList.remove("video-show");
    statusVideo.classList.add("video-hide");
  }
  if (videoContainer) {
    videoContainer.style.display = 'none';
    if (videoMP4) {
      videoMP4.pause();
    }
  }
}

function changeStatusNo() {
  statusVideo = document.querySelector(".video-visibility");
  statusChart = document.querySelector(".chart-visibility");
  if (statusChart.classList.contains("chart-show")) {
    statusChart.classList.remove("chart-show");
    statusChart.classList.add("chart-hide");
  }
  if (statusVideo.classList.contains("video-hide")) {
    statusVideo.classList.remove("video-hide");
    statusVideo.classList.add("video-show");
  }
  if (videoContainer) {
    videoContainer.style.display = 'block';
    if (videoMP4) {
      videoMP4.currentTime = 0;
      videoMP4.play();
    }
  }
}

const btnYes = document.getElementById("btn-yes");
btnYes.addEventListener("click", changeStatusYes);
btnYes.addEventListener("click", playSoundChart);
const btnNo = document.getElementById("btn-no");
btnNo.addEventListener("click", changeStatusNo);


// data chart
const dateReserve = {
  countries: ['Estados Unidos', 'Alemania', 'Itália', 'Portugal', 'Espanha', 'Brasil', 'Paraguai', 'Peru'],
  tons: [8133, 3351, 2452, 383, 28, 130, 8, 35]
};

// chart
let chartInstance = null;
function renderChart() {
  const contenador = document.getElementById("gold-reserves-chart");
  chartInstance = new Chart(contenador,
    {
      type: 'bar',
      data: {
        labels: dateReserve.countries,
        datasets: [{
          axis: 'x',
          label: 'Toneladas',
          data: dateReserve.tons,
          borderWidth: 1,
          backgroundColor: '#ffc61b'
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: 'black',
            font: {
              weight: 'bold',
              size: 16
            },
            formatter: function (toneladas) {
              return toneladas;
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 16
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            ticks: {
              stepSize: 500,
              font: {
                size: 16
              }
            }
          }
        }
      },
      plugins: [ChartDataLabels],
    });
}

//images
const imgChest = document.getElementById('chest-img');

imgChest.addEventListener('click', () => {
  if (imgChest.src.includes('chestclose.svg')) {
    imgChest.src = '../public/img/chestopen.svg';
  } else {
    imgChest.src = '../public/img/chestclose.svg';
  }
});

/*
const images = ['../public/img/chestclose.svg', '../public/img/chestopen.svg'];
let currentPhotoIndex = 0;

setInterval(() => {
  currentPhotoIndex = currentPhotoIndex + 1;
  if (currentPhotoIndex >= images.length) {
    currentPhotoIndex = 0;
  }
  imgChest.src = images[currentPhotoIndex];
}, 2000);*/


//Particles background
particlesJS('particles-js', {
  "particles": {
    "number": {
      "value": 100,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#b8860b"
    },
    "shape": {
      "type": "circle"
    },
    "opacity": {
      "random": true
    },
    "size": {
      "value": 3,
      "random": true
    },
    "move": {
      "enable": true,
      "speed": 1.5,
      "direction": "none",
      "random": false,
      "straight": false,
      "bounce": false
    }
  }
});

//Modal

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const closeBtn = document.querySelector(".gold-storage-modal-close");
const coinSoundMario = new Audio('../public/sounds/coin-257878.mp3');

function playSoundCountry() {
  coinSoundMario.currentTime = 0;
  coinSoundMario.play();
}


const modalContents = {
  "Estados Unidos": "Guardan la mayoría de su oro en Fort Knox, que es como un búnker ultra blindado en Kentucky.",
  "Alemania": "Parte del oro está en Fráncfort, pero también tienen reservas en Londres y Nueva York.",
  "Italia": "Casi todo su oro está en Roma, en el Banco de Italia.",
  "Portugal": "Guardan su oro en Lisboa, aunque durante décadas tuvieron bastante en Londres.",
  "España": "El oro está en el Banco de España, en pleno centro de Madrid.",
  "Brasil": "Parte del oro está en Brasilia, pero una buena cantidad sigue en el extranjero, sobre todo en Londres.",
  "Paraguai": "Su oro no está en el país. Lo tienen guardado en bancos extranjeros, como el Banco de Inglaterra.",
  "Peru": "Tienen algo de oro guardado, parte dentro del país y parte fuera. Aunque producen muchísimo oro, no acumulan tanto en reservas."
};

let cards = document.querySelectorAll(".gold-storage-cards-country");

for (let i = 0; i < cards.length; i++) {
  let card = cards[i];

  card.onclick = function () {
    let country = card.querySelector("h3").innerText;
    document.getElementById("modal-title").innerText = country;

    let description = modalContents[country];
    document.getElementById("modal-description").innerText = description;
    document.getElementById("modal").style.display = "block";

    rainCoins();
    playSoundCountry();
  };
}
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});


//Rain coins with click modal
function rainCoins() {
  const container = document.getElementById("coin-rain-container");
  const coinsAlreadyExist = container.querySelectorAll(".golde-coin");
  for (let index = coinsAlreadyExist - 1; index >= 0; index--) {
    coinsAlreadyExist[index].remove();

  }

  const totalCoins = 30;
  for (let i = 0; i < totalCoins; i++) {
    const coin = document.createElement("div");
    coin.classList.add("golde-coin");
    coin.style.left = Math.random() * 100 + "%";
    coin.style.animationDelay = (Math.random() * 2) + "s";
    container.appendChild(coin);
  }
}