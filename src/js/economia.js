/* Logo */
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

/*Buttons Yes and No */

imgLogoHTML.addEventListener('mouseenter', startLogoCycle);
imgLogoHTML.addEventListener('mouseleave', stopLogoCycle);
const coinSound = new Audio('../public/sounds/cash-register-fake-88639.mp3');
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

function playSound() {
  coinSound.currentTime = 0;
  coinSound.play();
}
const btnYes = document.getElementById("btn-yes");
btnYes.addEventListener("click", changeStatusYes);
btnYes.addEventListener("click", playSound);
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

/*Game */
