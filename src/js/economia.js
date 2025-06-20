function changeStatusYes(){
  statusChart = document.querySelector(".chart-visibility");
  if (statusChart.classList.contains("chart-hide")) {
    statusChart.classList.remove("chart-hide");
    statusChart.classList.add("chart-show");
  }
}

function changeStatusNo(){
  statusChart = document.querySelector(".chart-visibility");
  if (statusChart.classList.contains("chart-show")) {
    statusChart.classList.remove("chart-show");
    statusChart.classList.add("chart-hide");
  }
}
const btnYes = document.getElementById("btn-yes");
btnYes.addEventListener("click", changeStatusYes);
const btnNo = document.getElementById("btn-no");
btnNo.addEventListener("click", changeStatusNo);

const dateReserve = {
  countries: ['Estados Unidos', 'Alemania', 'Itália', 'Portugal', 'Espanha'],
  tons: [8133, 3351, 2452, 383, 282]
};

const contenador = document.getElementById("gold-reserves-chart");
new Chart(contenador, 
  {
    type: 'bar',
    data: {
        labels: dateReserve.countries,
        datasets: [{
          label: 'Toneladas',
          data: dateReserve.tons,
          borderWidth: 1,
          backgroundColor: '#ffc61b' 
        }],
    },
    options: {
      plugins:{
        datalabels:{
          anchor: 'end', 
          align: 'end',
          color: 'black',
          font: {
              weight: 'bold'
          },
          formatter: function(value) {
              return value;
          }
        }
      },
      scales: {
        y: {
          beginAtZero:true,
          max: 10000, 
          grid: {
            display: false
          }
        }
      }
    },
    plugins: [ChartDataLabels],
});


const imgChest = document.getElementById('chest-img');

const images = ['../public/img/chestclose.svg', '../public/img/chestopen.svg'];
let currentPhotoIndex = 0;

setInterval(() => {
  currentPhotoIndex = currentPhotoIndex + 1;
  if (currentPhotoIndex >= images.length) {
    currentPhotoIndex = 0;
  }
  imgChest.src = images[currentPhotoIndex];
}, 2000);