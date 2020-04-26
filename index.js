import Plotly, { len } from 'plotly.js-cartesian-dist';



function encode(obj) {
    encoded = encodeURIComponent(
        Buffer.from(
            JSON.stringify(obj)
        ).toString('base64')
    )
    return encoded
}


function decode(encoded) {
    let obj = JSON.parse(
        Buffer.from(
            decodeURIComponent(encoded),'base64'
        ).toString())
    return obj
}


function mandelbrot(r, i, N, z_r=0, z_i=0, fractalEverywhere=true, cutoff=10000) {
    let z_r_, z_i_
    for(let a=0; a<N; a+=1) {
        z_r_ = z_r
        z_i_ = z_i
        z_r = z_r*z_r - z_i*z_i + r
        z_i = 2*z_r_*z_i_ + i
        if(fractalEverywhere){
            z_r = Math.tanh(z_r/cutoff)*cutoff
            z_i = Math.tanh(z_i/cutoff)*cutoff
            // if(z_r > 1000) {
            //     z_r = Math.log(z_r)
            // }
            // if(z_r < -cutoff) {
            //     z_r = -Math.log(-z_r)
            // }
            // if(z_i > cutoff) {
            //     z_i = Math.log(z_i)
            // }
            // if(z_i < -cutoff) {
            //     z_i = -Math.log(-z_i)
            // }
        }
    }
    let z = Math.log(Math.sqrt(z_i*z_i + z_r*z_r)+1)
    z = Number.isFinite(z) ? z : 1000
    return [z_r, z_i, z]
}


function consoleBrot() {
    let H=30;
    let W=50;
    let art = "";
    for(let h=0; h<H; h+= 1){
        for(let w=0; w<W; w+= 1){
            let [m_r, m_i, v] = mandelbrot(-2 + w/W*4, -2 + h/H*4, 30)
            if(v > 2) {
                art += " "
            }else{
                art += "*"
            }
        }
        art += "\n"
    }
    art += "\nYet another mandelbrot :)"
    console.log(art)
}


class Canvas {
    /***
     * Class that puts a fresh mandelbrot into a container
     * and computes the screen limits
     */

    constructor(x0, x1, y0, y1) {
        this.x0 = x0
        this.x1 = x1
        this.y0 = y0
        this.y1 = y1
        this.target = {r: 0, i: 0}
        this.scale = 1 // will be set to clientHeight/clientWidth
        this.fractalEverywhere = true
    }

    withoutCache(x0, x1, y0, y1, N, H, W) {
        let t = Date.now()
        let dx = (x1 - x0)/W
        let dy = (y1 - y0)/H
        let matrix = []
        for(let x=x0; x<=x1; x+=dx){
            let row = []
            for(let y=y0; y<=y1; y+=dy){
                let [m_r, m_i, v] = mandelbrot(x, y, N, 0, 0, this.fractalEverywhere)
                row.push(v)
            }
            matrix.push(row)
        }
        console.log("computed in ", (t-Date.now())/1000)
        return matrix
    }

    getHeatmapData(H, W) {
        let N = document.getElementById("iterations").value
        return this.withoutCache(this.x0, this.x1, this.y0, this.y1, N, H, W)
        return this.data.computeAndCache(this.x0, this.x1, this.y0, this.y1, N, H, W)
    }

    zoomTo(zoom=0.8) {
        /*** Change the limits of the canvas so that a smaller (zoomed in) area is shown
         * It zooms into the direction of the complex number (r, u) and moves every
         * pixel by the factor zoom closer to the target
         * 
         * r: real part of the target
         * i: imaginary part of the target
         * zoom
         */
        let x0 = this.x0
        let x1 = this.x1
        let y0 = this.y0
        let y1 = this.y1
        this.x0 = this.target.r - (this.target.r - x0) * zoom
        this.x1 = this.target.r - (this.target.r - x1) * zoom
        this.y0 = this.target.i - (this.target.i - y0) * zoom
        this.y1 = this.target.i - (this.target.i - y1) * zoom
        this.render()
    }

    left() {
        let delta = this.x1-this.x0
        this.x0 -= delta*0.1
        this.x1 -= delta*0.1
        this.render()
    }

    right() {
        let delta = this.x1-this.x0
        this.x0 += delta*0.1
        this.x1 += delta*0.1
        this.render()
    }

    up() {
        let delta = (this.y1-this.y0)
        this.y0 += delta*0.1
        this.y1 += delta*0.1
        this.render()
    }

    down() {
        let delta = (this.y1-this.y0)
        this.y0 -= delta*0.1
        this.y1 -= delta*0.1
        this.render()
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
            [1/32, '#2CB'],
            [1/8, '#2CB2CB'],
            [1/2, '#420420'],
            [1-1/64, '420'],
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
            width: width, 
            height: height,
            autosize: false
        };
        Plotly.react('mandelbrot', data, layout, {staticPlot: true});
    }

    render(thumbnail=true) {
        let res =  parseInt(document.getElementById("res").value)
        let H = Math.floor(this.scale*res)
        if((res > 300) && thumbnail) {
            this._render(150, 150)
            setTimeout(() => this._render(H, res), 10)
        }else{
            this._render(H, res)
        }

        let iterations = parseInt(document.getElementById('iterations').value);
        document.getElementById('res_display').innerHTML = res
        document.getElementById('iterations_display').innerHTML = iterations
        let settings = encode({
            x0: this.x0,
            x1: this.x1,
            ymean: (this.y0 + this.y1)/2,
            res: res,
            iterations: iterations,
            e: this.fractalEverywhere
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





function keyEvents(e) {
    switch (event.keyCode) {
        case 37:
            canvas.left()
            return
        case 38:
            canvas.up()
            return
        case 39:
            canvas.right()
            return
        case 40:
            canvas.down()
            return
     }

    if(e.code=='Digit1') {
        canvas.zoomTo(1/0.8**9)
    }
    if(e.code=='Digit2') {
        canvas.zoomTo(1/0.8**7)
    }
    if(e.code=='Digit3') {
        canvas.zoomTo(1/0.8**5)
    }
    if(e.code=='Digit4') {
        canvas.zoomTo(1/0.8**3)
    }
    if(e.code=='Digit5') {
        canvas.zoomTo(1/0.8)
    }
    if(e.code=='Digit6') {
        canvas.zoomTo(0.8)
    }
    if(e.code=='Digit7') {
        canvas.zoomTo(0.8**3)
    }
    if(e.code=='Digit8') {
        canvas.zoomTo(0.8**5)
    }
    if(e.code=='Digit9') {
        canvas.zoomTo(0.8**7)
    }
    if(e.code=='Digit0') {
        canvas.zoomTo(0.8**9)
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


function setTarget(clickEvent, zoom) {
    canvas.target = canvas.locationAt(clickEvent);
    document.getElementById("focused").innerHTML = `(${canvas.target.r}, ${canvas.target.i})`
    canvas.zoomTo(zoom)
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


function changeBackground() {
    canvas.fractalEverywhere = !canvas.fractalEverywhere
    if(canvas.fractalEverywhere) {
        document.getElementById('everywhere').classList.add('active')
    }else{
        document.getElementById('everywhere').classList.remove('active')
    }
    canvas.render()
}


function init() {
    canvas.scale = document.getElementById('mandelbrot').clientHeight/document.getElementById('mandelbrot').clientWidth
    let settings = findGetParameter('s');
    if(settings) {
        settings = decode(settings)
        canvas.x0 = settings.x0
        canvas.x1 = settings.x1
        canvas.y0 = settings.ymean - (settings.x1-settings.x0)*canvas.scale/2
        canvas.y1 = settings.ymean + (settings.x1-settings.x0)*canvas.scale/2
        canvas.fractalEverywhere = settings.e
        document.getElementById('res').value = settings.res
        document.getElementById('iterations').value = settings.iterations
    }else{
        canvas.y0 = -2*canvas.scale
        canvas.y1 = 2*canvas.scale
    }
    canvas.render()
    document.getElementById('iterations').addEventListener('change', (event) => canvas.render(false));
    document.getElementById('res').addEventListener('change', (event) => canvas.render());
    document.getElementById('copy').addEventListener('click', copyToClipboard, true);
    document.getElementById('everywhere').addEventListener('click', changeBackground, true);
    document.getElementById('mandelbrot').addEventListener('click', (event) => setTarget(event, 0.8**3), false);
    document.getElementById('mandelbrot').addEventListener('dbclick', (event) => setTarget(event, 0.8**6), false);
    consoleBrot()
}


document.addEventListener('DOMContentLoaded', init, false);
document.onkeydown = keyEvents
