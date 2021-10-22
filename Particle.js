const simplex = new SimplexNoise();
console.log(simplex.noise3D(1, 1, 5));


const noiseAmount = 10;
const dragAmount = .7;
const centeringForce = .001;
const trackingAmount = .05;
const fallenProbability = .05;
var wind = simplex.noise2D(0, 0);
var wind_2 = simplex.noise2D(0, 100);

class Particle {
    constructor(x, y) {
        this.tint = 1;
        this.x = x;
        this.y = y;
        this.acc_x = 0;
        this.acc_y = 0;
        this.seed = Math.random()
        /* this.acc_x += (Math.random() * 2 - 1) * 100
        this.acc_y -= Math.random() * 1000 */
        this.fallen = false;

        this.drag = .9;

        this.killFlag = false;
        this.i = Math.floor(frame / 10) % particleTargets.length;
    }
    update() {
        /* this.i = Math.floor(frame / 10) % particleTargets.length; */


        this.x += this.acc_x;
        this.y += this.acc_y;

        this.acc_x *= dragAmount;
        this.acc_y *= dragAmount;

        /* this.acc_x += wind * 5;
        this.acc_y += wind_2; */

        let scale = .001;
        this.acc_x += simplex.noise2D(this.x * scale, this.y * scale);
        this.acc_y += simplex.noise2D(this.x * scale + 100, this.y * scale + 100);





        this.acc_x += simplex.noise2D(this.x, this.y) * noiseAmount;
        this.acc_y += simplex.noise2D(this.y, this.x) * noiseAmount;

        this.acc_y += Math.abs(simplex.noise2D(this.y * this.i, this.x * this.seed) + .1) * -20;

        if (this.fallen) {
            this.tint = Math.max(-.12, this.tint - .06)

            if (this.y > window.innerHeight + 100 || this.y < -100 || this.tint < -.1) {
                /* this.fallen = false;
                this.y = window.innerHeight + 100;
                this.tint = 0; */
                this.killFlag = true;
            }
        } else {
            /* this.acc_y -= 4 * Math.random() */
            if (Math.random() < fallenProbability) this.fallen = true;
            this.tint = Math.min(1, this.tint - .02)
            if (!particlesTracking) {
                /* this.acc_y += 2; */
                /* this.acc_x += (window.innerWidth / 2 - this.x) * centeringForce;
                this.acc_y += (window.innerHeight / 2 - this.y) * centeringForce; */
                /* if (this.y > window.innerHeight) {
                    this.killFlag = true;
                } */
            } else if (particleTargets[this.i]) {
                this.acc_x += (particleTargets[this.i].x - this.x) * trackingAmount * this.tint;
                this.acc_y += (particleTargets[this.i].y - this.y) * trackingAmount * this.tint;
            }
        }


    }

    draw(ctx) {
        ctx.fillStyle = "rgba(" + Math.max(255 * this.tint + this.seed * 10 + 1, 110) + "," + Math.min(255 * (1 - this.tint + .2) + 10, 50) + ", 10," + this.tint + ")";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10 * Math.max(this.tint - this.seed, .01) + 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}