import Plotly from 'plotly.js-cartesian-dist';
import _ from 'lodash';

/***
 * In general:
 * x <-> real part of the complex number <-> width of the screen
 */


const H = 100;
const W = 100;


function mandelbrot(r, i, N=1000) {
    let z_r = 0
    let z_i = 0
    for(let a=0; a<=N; a+=1) {
        z_r = z_r*z_r - z_i*z_i + r
        z_i = 2*z_r*z_i + i
        if(!(Number.isFinite(z_r) && z_r<100 && z_r>-100)) {
            return 100
        }
    }
    z_r = z_r > 0 ? z_r : -z_r
    return Number.isFinite(z_r) && z_r<10 && z_r>-10 ? z_r + 1 : 100
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
                        this.x0 + h/H*(this.x1 - this.x0),
                        this.y0 + w/H*(this.y1 - this.y0)
                    );
                    this.min = this.min < z ? this.min : z
                    this.max = this.max > z ? this.max : z
                    return Math.log(z)
                }
            )
        )
    }

    zoomTo(r, i, zoom=0.9) {
        /*** Change the limits of the canvas so that a smaller (zoomed in) area is shown
         * It zooms into the direction of the complex number (r, u) and moves every
         * pixel by the factor zoom closer to the target
         * 
         * r: real part of the target
         * i: imaginary part of the target
         * zoom
         */
        this.x0 = this.x0*zoom + r*(1-zoom)
        this.x1 = this.x1*zoom + r*(1-zoom)
        this.y0 = this.y0*zoom + i*(1-zoom)
        this.y1 = this.y1*zoom + i*(1-zoom)
    }
}


let canvas = new Canvas(
    -2,
    2,
    -1,
    1,
);


function render(canvas) {
    let z = canvas.getHeatmapData();
    console.log(canvas.min, canvas.max)
    var colorscaleValue = [
        [0, '#3D9970'],
        [0.125, 'rgb(200, 200, 10)'],
        [0.25, 'rgb(10, 200, 10)'],
        [0.9, '#001f3f'],
        [1, 'rgb(50,50,50)']
    ];
    var data = [
        {
            z: z,
            type: 'heatmap',
            colorscale: colorscaleValue,
            showscale: false,
            transpose: true,
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
        
    Plotly.newPlot('mandelbrot', data, layout, {staticPlot: false});
}

// Plotly.redraw('PlotlyTest');


// Plotly.redraw('PlotlyTest');
function init() {
    render(canvas)
}


document.addEventListener('DOMContentLoaded', init, false);

// setInterval(() => {
//     canvas.zoomTo(-2, 0, 0.995)
//     render(canvas)
// }, 100)


document.addEventListener('keypress', logKey);

function logKey(e) {
  if(e.code=='Digit5') {
    canvas.zoomTo(-2, 0, 1/0.9)
    render(canvas)
  }
  if(e.code=='Digit6') {
    canvas.zoomTo(-2, 0, 0.9)
    render(canvas)
  }

}