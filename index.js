import Plotly from 'plotly.js-cartesian-dist';
import _ from 'lodash';

let data = _.range(1000).map(
    row => _.range(1000).map(
        col => (row-500)*(col-500)
    )
);

function render(data) {

    var colorscaleValue = [
        [0, '#3D9970'],
        [1, '#001f3f']
    ];

    var data = [
        {
            z: data,
            type: 'heatmap',
            colorscale: colorscaleValue,
            showscale: false
        }
    ];

    var axisTemplate = {
        showticklabels: false,
        ticks: ''
    };

    
    var layout = {
        xaxis: axisTemplate,
        yaxis: axisTemplate,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
            pad: 0
        },
        showlegend: false,
        // with: document.getElementById('mandelbrot').parentElement.clientWidth,
        // height: document.getElementById('mandelbrot').parentElement.clientHeight,
        width: screen.width,
        height: screen.height,
        autosize: false
    };
    console.log(layout)
        
    Plotly.newPlot('mandelbrot', data, layout);
}

function init() {
    render(data)
}
// Plotly.redraw('PlotlyTest');

document.addEventListener('DOMContentLoaded', init, false);