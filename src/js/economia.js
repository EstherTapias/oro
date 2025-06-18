google.charts.load('current', {'packages':['bar']});
google.charts.setOnLoadCallback(drawChart);

function drawChart(params) {
    var data = new google.visualization.arrayToDataTable([
        ['País', 'Toneladas'],
        ['Estados Unidos', 8133],
        ['Alemania', 3352]
    ]);
    var options = {
        chart:{
            //aqui é referente a tudo que se pode adicionar de informacoes no grafico, como legenda, titulo, etc
        },
        vAxis: {
            gridlines: {
                color: '#fff'
            }
        },
        chartArea:{
            backgroundColor: '#fed'
        },
        backgroundColor: '#fcc',
        colors: ['#6a0dad']
    }
    var chart = new google.charts.Bar(document.getElementById('gold-reserves-char'));
    console.log(chart);
    chart.draw(data, google.charts.Bar.convertOptions(options));
}