import RBush from 'rbush';


function mandelbrot(r, i, N, fractal_everywhere=true) {
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
    return [z_r, z_i, Math.log(Math.sqrt(z_i*z_i + z_r*z_r)+1)]
}


class PointRBush extends RBush {
    /***
     * r: real part of x
     * i: imaginary part of x
     * -> these define the point on the plane we want to eval
     * m_r, m_i, n: coordinates of the computed value after n rounds
     * v: value that will be plotted (log(norm(mandelbort(r, i)))
     */
    toBBox([r, i, m_r, m_i, N, v]) {
        return {
            minX: x, minY: y, maxX: x, maxY: y, m_r, m_i, n, v
        };
     }

    compareMinX(a, b) {
        return a.x - b.x
    }

    compareMinY(a, b) {
        return a.y - b.y
    }
}


class MandelCache {
    /***
     * Class to compute mandelbrot values and cache them
     * How?
     * We store every computation we make in a datastructure that makes it
     * easy to look up fuzzy matches. This will allow to reuse many values
     * that have been computed in other zoom levels or before a movement
     * 
     */
    constructor() {
        this.tree = new MyRBush();
    }

    computeAndCache(x0, x1, y0, y1, N, H, W) {
        let dx = (x1 - x0)/W
        let dy = (y1 - y0)/H
        let matrix = []
        for(let x=x0; x<=x1; x+=dx){
            let row = []
            for(let y=y0; y<=y1; y+=dy){
                const results = this.tree.search({
                    minX: x-dx/2,
                    minY: y-dy/2,
                    maxX: x+dx/2,
                    maxY: y+dy/2
                });
                if(results.length==0) {
                    // no precomputed value found, compute and cache
                    let [m_r, m_i, v] = mandelbrot(x, y, N);
                    this.tree.insert([x, y, m_r, m_i, N, v])
                    row.push(v)
                }else{
                    // the results still have to be checked for N
                    // if point.N < N, we can use it to compute the target faster
                    let closestMatch = {N: 0, m_r: x, m_i: y};
                    for(let point of result) {
                        if(point.N==N) {
                            // we found one, don't have to look further
                            row.push(point.v)
                            continue
                        }
                        if((point.N < N) && point.N>closestMatch.N) {
                            closestMatch = point
                        }
                    }
                    // we couldnt find a match
                    let [m_r, m_i, v] = mandelbrot(closestMatch.m_r, closestMatch.m_i, N-closestMatch.N);
                    this.tree.insert([x, y, m_r, m_i, N, v])
                    row.push(v)
                }
            }
            matrix.push(row)
        }
        return matrix
    }

    prune(x0, x1, y0, y1, N) {
        // Remove every entry from the tree which is either far away from
        // the current screen or has different N
    }
    
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
    constructor() {

    }

    render() {

    }
}