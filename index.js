import Plotly from 'plotly.js-cartesian-dist';
import _ from 'lodash';

/***
 * In general:
 * x <-> real part of the complex number <-> width of the screen
 */


function mandelbrot(r, i, N=1000, fractal_everywhere=true) {
    let z_i, z_i_, z_r, z_r_;
    z_r = 0
    z_i = 0
    for(let a=0; a<=N; a+=1) {
        z_r_ = z_r
        z_i_ = z_i
        z_r = z_r*z_r - z_i*z_i + r
        z_i = 2*z_r_*z_i_ + i
        if(fractal_everywhere){
            if(z_r > 1000) {
                z_r = Math.log(z_r)
            }
            if(z_r < -1000) {
                z_r = Math.log(-z_r)
            }
            if(z_i > 1000) {
                z_i = Math.log(z_i)
            }
            if(z_i < -1000) {
                z_i = Math.log(-z_i)
            }
        }
    }
    z_r = Math.sqrt(z_i*z_i + z_r*z_r)
    return z_r + 1
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

    getHeatmapData(H, W) {
        let N = document.getElementById("iterations").value
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
        x0 = this.x0
        x1 = this.x1
        y0 = this.y0
        y1 = this.y1
        this.x0 = target.r - (target.r - x0) * zoom
        this.x1 = target.r - (target.r - x1) * zoom
        this.y0 = target.i - (target.i - y0) * zoom
        this.y1 = target.i - (target.i - y1) * zoom
    }

    left() {
        let delta = this.x1-this.x0
        this.x0 -= delta*0.1
        this.x1 -= delta*0.1
    }

    right() {
        let delta = this.x1-this.x0
        this.x0 += delta*0.1
        this.x1 += delta*0.1
    }

    up() {
        let delta = (this.y1-this.y0)
        this.y0 += delta*0.1
        this.y1 += delta*0.1
    }

    down() {
        let delta = (this.y1-this.y0)
        this.y0 -= delta*0.1
        this.y1 -= delta*0.1
    }

    locationAt(clickEvent) {
        let container = document.getElementById('mandelbrot')
        let x = this.x0 + clickEvent.clientX/container.clientWidth*(this.x1-this.x0)
        let y = this.y0 + (1-clickEvent.clientY/container.clientHeight)*(this.y1-this.y0)
        return {
            r: x,
            i: y
        }
    }

    _render(H, W) {
        let height = document.getElementById('mandelbrot').clientHeight;
        let width = document.getElementById('mandelbrot').clientWidth;
        let z = this.getHeatmapData(H, W);
        var colorscaleValue = [
            [0, 'rgb(200, 200, 200)'], // white
            [1/256, 'rgb(20, 20, 100)'], // dark blue
            [1/32, 'rgb(200, 100, 10)'], // dark yellow
            [1/8, 'rgb(200, 10, 10)'],
            [1/2, 'rgb(60, 60, 60)'],
            [1-1/128, 'rgb(0, 0, 0)'],
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
            
        Plotly.newPlot('mandelbrot', data, layout, {staticPlot: false});
    }

    render(thumbnail=true) {
        let res =  parseInt(document.getElementById("res").value)
        if((res > 300) && thumbnail) {
            this._render(100, 100)
            setTimeout(() => this._render(res, res), 10)
        }else{
            this._render(res, res)
        }

        let iterations = parseInt(document.getElementById('iterations').value);
        document.getElementById('status').innerHTML = `
            Resolution ${res} <br/>
            Iterations ${iterations} <br/>
            Real range (x) ${this.x0} - ${this.x1} <br/>
            Imaginary range (y) ${this.y0} - ${this.y1} <br/>
        `
        let settings = encode({
            x0: this.x0,
            x1: this.x1,
            ymean: (this.y0 + this.y1)/2,
            res: res,
            iterations: iterations
        })
        this.url = `${location.href.split("?")[0]}?s=${settings}`
    }
}



let canvas = new Canvas(
    -2,
    2,
    -2,
    2,
);





function encode(obj) {
    encoded = encodeURIComponent(
        Buffer.from(
            JSON.stringify(obj)
        ).toString('base64')
    )
    return encoded
}


function decode(encoded) {
    console.log('encoded', encoded)
    let obj = JSON.parse(
        Buffer.from(
            decodeURIComponent(encoded),'base64'
        ).toString())
    return obj
}


function keyEvents(e) {
    switch (event.keyCode) {
        case 37:
            canvas.left()
            canvas.render()
            return
        case 38:
            canvas.up()
            canvas.render()
            return
        case 39:
            canvas.right()
            canvas.render()
            return
        case 40:
            canvas.down()
            canvas.render()
            return
     }

     if(e.code=='Digit1') {
        canvas.zoomTo(1/0.9**9)
        canvas.render(false)
    }
    if(e.code=='Digit2') {
        canvas.zoomTo(1/0.9**7)
        canvas.render(false)
    }
    if(e.code=='Digit3') {
        canvas.zoomTo(1/0.9**5)
        canvas.render(false)
    }
    if(e.code=='Digit4') {
        canvas.zoomTo(1/0.9**3)
        canvas.render(false)
    }
    if(e.code=='Digit5') {
        canvas.zoomTo(1/0.9)
        canvas.render(false)
    }
    if(e.code=='Digit6') {
        canvas.zoomTo(0.9)
        canvas.render(false)
    }
    if(e.code=='Digit7') {
        canvas.zoomTo(0.9**3)
        canvas.render(false)
    }
    if(e.code=='Digit8') {
        canvas.zoomTo(0.9**5)
        canvas.render(false)
    }
    if(e.code=='Digit9') {
        canvas.zoomTo(0.9**7)
        canvas.render(false)
    }
    if(e.code=='Digit0') {
        canvas.zoomTo(0.9**9)
        canvas.render(false)
    }
}


function copyToClipboard() {
    const el = document.createElement('textarea');
    el.value = canvas.url ? canvas.url : location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};


function setTarget(clickEvent) {
    let pos = canvas.locationAt(clickEvent);
    // console.log(pos)
    target.r = pos.r;
    target.i = pos.i;
    document.getElementById("focused").innerHTML = `(${pos.r}, ${pos.i})`
}


function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}


function init() {
    let settings = findGetParameter('s');
    const scale = document.getElementById('mandelbrot').clientHeight/document.getElementById('mandelbrot').clientWidth
    if(settings) {
        settings = decode(settings)
        canvas.x0 = settings.x0
        canvas.x1 = settings.x1
        canvas.y0 = settings.ymean - (settings.x1-settings.x0)*scale/2
        canvas.y1 = settings.ymean + (settings.x1-settings.x0)*scale/2
        document.getElementById('res').value = settings.res
        document.getElementById('iterations').value = settings.iterations
    }else{
        canvas.y0 = -2*scale
        canvas.y1 = 2*scale
    }
    canvas.render()
    document.getElementById('iterations').addEventListener('change', (event) => canvas.render());
    document.getElementById('res').addEventListener('change', (event) => canvas.render());
    document.getElementById('copy').addEventListener('click', copyToClipboard, true);
    document.getElementById('mandelbrot').addEventListener('click', setTarget, false);
}


document.addEventListener('DOMContentLoaded', init, false);
document.onkeydown = keyEvents

