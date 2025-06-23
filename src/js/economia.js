const coinSound = new Audio('../public/sounds/cash-register-fake-88639.mp3');
const videoContainer = document.getElementById('video-container');
const video = videoContainer.querySelector('video');
function changeStatusYes() {
  statusChart = document.querySelector(".chart-visibility");
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
  if (videoContainer) {
    videoContainer.style.display = 'none';
    if (video) {
      video.pause();
    }
  }
}

function changeStatusNo() {
  statusChart = document.querySelector(".chart-visibility");
  if (statusChart.classList.contains("chart-show")) {
    statusChart.classList.remove("chart-show");
    statusChart.classList.add("chart-hide");
  }
  if (videoContainer) {
    videoContainer.style.display = 'block';
    if (video) {
      video.currentTime = 0;
      video.play();
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
              weight: 'bold'
            },
            formatter: function (toneladas) {
              return toneladas;
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
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
      "value": 60,
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
      "value": 0.5,
      "random": false
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
  },
  "interactivity": {
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      }
    },
    "modes": {
      "repulse": {
        "distance": 100,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      }
    }
  },
  "retina_detect": true
});