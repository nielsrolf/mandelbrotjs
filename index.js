import Plotly from 'plotly.js-cartesian-dist';
import _ from 'lodash';

/***
 * In general:
 * x <-> real part of the complex number <-> width of the screen
 */



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


let target = {
    r: 0,
    i: 0
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
        let N = document.getElementById("iterations").value
        let H = document.getElementById("res").value
        let W = H
        return _.range(H).map(
            h => _.range(W).map(
                w => {
                    let z = mandelbrot(
                        this.x0 + h/H*(this.x1 - this.x0),
                        this.y0 + w/H*(this.y1 - this.y0),
                        N
                    );
                    this.min = this.min < z ? this.min : z
                    this.max = this.max > z ? this.max : z
                    return Math.log(z)
                }
            )
        )
    }

    zoomTo(zoom=0.9) {
        /*** Change the limits of the canvas so that a smaller (zoomed in) area is shown
         * It zooms into the direction of the complex number (r, u) and moves every
         * pixel by the factor zoom closer to the target
         * 
         * r: real part of the target
         * i: imaginary part of the target
         * zoom
         */
        this.x0 = target.r - (target.r - this.x0) * zoom
        this.x1 = target.r - (target.r - this.x1) * zoom
        this.y0 = target.i - (target.i - this.y0) * zoom
        this.y1 = target.i - (target.i - this.y1) * zoom
        console.log(this)
    }

    left() {
        this.x0 -= (this.x1-this.x0)*0.1
        this.x1 -= (this.x1-this.x0)*0.1
    }

    right() {
        this.x0 += (this.x1-this.x0)*0.1
        this.x1 += (this.x1-this.x0)*0.1
    }

    up() {
        this.y0 += (this.y1-this.y0)*0.1
        this.y1 += (this.y1-this.y0)*0.1
    }

    down() {
        this.y0 -= (this.y1-this.y0)*0.1
        this.y1 -= (this.y1-this.y0)*0.1
    }

    locationAt(clickEvent) {
        let container = document.getElementById('mandelbrot')
        let x = this.x0 + clickEvent.clientX/container.clientWidth*(this.x1-this.x0)
        let y = this.y0 + clickEvent.clientY/container.clientHeight*(this.y1-this.y0)
        return {
            r: x,
            i: y
        }
    }
}



let canvas = new Canvas(
    -2,
    2,
    -2,
    2,
);


function render(canvas) {
    let height = document.getElementById('mandelbrot').clientHeight;
    let width = document.getElementById('mandelbrot').clientWidth;
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
        width: width, //screen.width,
        height: height, //screen.height,
        autosize: false
    };
        
    Plotly.newPlot('mandelbrot', data, layout, {staticPlot: true});
}


function keyEvents(e) {
    if(e.code=='Digit1') {
        canvas.zoomTo(1/0.9**9)
    }
    if(e.code=='Digit2') {
        canvas.zoomTo(1/0.9**7)
    }
    if(e.code=='Digit3') {
        canvas.zoomTo(1/0.9**5)
    }
    if(e.code=='Digit4') {
        canvas.zoomTo(1/0.9**3)
    }
    if(e.code=='Digit5') {
        canvas.zoomTo(1/0.9)
    }
    if(e.code=='Digit6') {
        canvas.zoomTo(0.9)
    }
    if(e.code=='Digit7') {
        canvas.zoomTo(0.9**3)
    }
    if(e.code=='Digit8') {
        canvas.zoomTo(0.9**5)
    }
    if(e.code=='Digit9') {
        canvas.zoomTo(0.9**7)
    }
    if(e.code=='Digit0') {
        canvas.zoomTo(0.9**9)
    }
    switch (event.keyCode) {
        case 37:
            canvas.left()
            break;
        case 38:
            canvas.up()
            break;
        case 39:
            canvas.right()
            break;
        case 40:
            canvas.down()
            break;
     }

    render(canvas)
}



function setTarget(clickEvent) {
    let pos = canvas.locationAt(clickEvent);
    console.log(pos)
    target.r = pos.r;
    target.i = pos.i;
}


function init() {
    const scale = document.getElementById('mandelbrot').clientHeight/document.getElementById('mandelbrot').clientWidth
    canvas.y0 = -2*scale
    canvas.y1 = 2*scale
    render(canvas)
    document.getElementById('iterations').addEventListener('change', (event) => render(canvas));
    document.getElementById('res').addEventListener('change', (event) => render(canvas));
}


document.addEventListener('DOMContentLoaded', init, false);
document.onkeydown = keyEvents
document.addEventListener('click', setTarget);

