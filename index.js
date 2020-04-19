import Plotly from 'plotly.js-cartesian-dist';
import _ from 'lodash';

const H = 1000;
const W = 1000;


function mandelbrot(r, i, N=100) {
    let z_r = 0
    let z_i = 0
    for(let a=0; a<=N; a+=1) {
        z_r = z_r*z_r - z_i*z_i + r
        z_i = 2*z_r*z_i + i
    }
    z_r = z_r > 0 ? z_r : -z_r
    return Number.isFinite(z_r) && z_r<10 && z_r>-10 ? z_r + 1 : 1
}


class Canvas {
    constructor(x0, x1, y0, y1) {
        this.x0 = x0
        this.x1 = x1
        this.y0 = y0
        this.y1 = y1
        this.min = 0
        this.max = 0
    }

    getHeatmapData() {
        return _.range(H).map(
            h => _.range(W).map(
                w => {
                    let z = mandelbrot(
                        this.y0 + w/H*(this.y1 - this.y0),
                        this.x0 + h/H*(this.x1 - this.x0)
                    );
                    this.min = this.min < z ? this.min : z
                    this.max = this.max > z ? this.max : z
                    return Math.log(z)
                }
            )
        )
    }
}


let canvas = new Canvas(
    -1,
    1,
    -2,
    2,
);


function render() {
    let z = canvas.getHeatmapData();
    console.log(canvas.min, canvas.max)
    var colorscaleValue = [
        [0, '#3D9970'],
        [1, '#001f3f']
    ];
    var data = [
        {
            z: z,
            type: 'heatmap',
            colorscale: colorscaleValue,
            showscale: false,
            // hoverinfo: 'skip'
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
        
    Plotly.newPlot('mandelbrot', data, layout, {staticPlot: false});
}

// Plotly.redraw('PlotlyTest');

document.addEventListener('DOMContentLoaded', render, false);