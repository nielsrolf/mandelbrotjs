import Plotly from 'plotly.js-cartesian-dist';
import _ from 'lodash';

const H = 1000;
const W = 1000;


function mandelbrot(r, i, N=1000) {
    let z_r = 0
    let z_i = 0
    for(let a=0; a<=N; a+=1) {
        z_r = z_r*z_r - z_i*z_i + r
        z_i = 2*z_r*z_i + i
    }
    return z_r
}


class Canvas {
    constructor(x0, x1, y0, y1) {
        this.x0 = x0
        this.x1 = x1
        this.y0 = y0
        this.y1 = y1
    }

    getHeatmapData() {
        return _.range(H).map(
            h => _.range(W).map(
                w => mandelbrot(
                    this.x0 + h/H*(this.x1 - this.x0),
                    this.y0 + w/H*(this.y1 - this.y0)
                )
            )
        )
    }
}


let canvas = new Canvas(
    -1,
    1,
    -1,
    1,
);
// let canvas = new Canvas(
//     -1.656193974849999975917,
//     -1.656193832633333309258,
//     0.000011637905555555493,
//     0.000011743022222222154
// );


function render() {

    var colorscaleValue = [
        [0, '#3D9970'],
        [1, '#001f3f']
    ];

    var data = [
        {
            z: canvas.getHeatmapData(),
            type: 'heatmap',
            colorscale: colorscaleValue,
            showscale: false,
            hoverinfo: 'skip'
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
        
    Plotly.newPlot('mandelbrot', data, layout, {staticPlot: true});
}

// Plotly.redraw('PlotlyTest');

document.addEventListener('DOMContentLoaded', render, false);