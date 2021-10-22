let log = console.log
let frame = 0;
let cam;

const simplex_here = new SimplexNoise();

let pairs = [
    /* [1, 4], */
    [5, 8],
    [9, 12],
    [13, 16],
    [17, 20]
]
let pair_results = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
];
let finger_scales = [
    /* .8, */
    .92,
    1,
    .94,
    .75
]

let particles = [];

let wristDist = 0;
let wrist = {}
let index_middle = {}

let canvasCtx;
let vid;
let scaleRatio = 1;
let addendum = 0;


let particleTargets = []
let particlesTracking = false;


/* for (var i = 0; i < pairs.length * 100; i++) {
    let p = new Particle(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
    p.i = Math.floor(i / 100);
    particles.push(p);
} */






window.onload = () => {
    vid = document.querySelector("video")
    /* vid.style.width = window.innerWidth;
    vid.style.height = window.innerHeight; */
    let canvasElement = document.querySelector("canvas")
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    canvasCtx = canvasElement.getContext('2d')



    function onResults(results) {
        frame++;

        /* let width, height;
               if (window.innerHeight > window.innerWidth) {
                   let ratio = window.innerHeight / vid.height;
                   log(ratio)
                   
               width = window.innerWidth;
               height = window.innerHeight;
           } else {
               let ratio = window.innerHeight / vid.height
               log(ratio)
               width = window.innerWidth / ratio;
               height = window.innerHeight;
               
            } 
            log(width, height);
            */
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;

        /* addendum = vid.height * ratio - canvasElement.height;
        addendum *= 2; */
        canvasCtx.save()
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(
            results.image, 0, 0, window.innerWidth, window.innerHeight);
        if (results.multiHandLandmarks) {
            /* log(results); */

            for (const landmarks of results.multiHandLandmarks) {
                /* log(landmarks) */
                /* drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: .5
                }); */
                /* drawLandmarks(canvasCtx, landmarks, {
                    color: '#FF0000',
                    lineWidth: .1
                }); */

                wristDist = distance(landmarks[0].x, landmarks[0].y, landmarks[0].z, landmarks[1].x, landmarks[1].y, landmarks[1].z) * 5;
                /* log(wristDist); */

                let i = 0;
                for (let landmark of landmarks) {
                    let j = 0;
                    for (let pair of pairs) {
                        if (pair.includes(i)) {
                            pair_results[j][pair.indexOf(i)] = landmark
                            /* log("got one") */
                        }
                        j++;
                    }
                    i++;
                }


            }
            let i = 0;

            let foundSmthing = false;
            for (let result of pair_results) {
                /* log(result); */
                if (result.length > 1) {
                    if (!foundSmthing) {
                        particleTargets = [];
                    }
                    let dist = distance(result[0].x, result[0].y, result[0].z, result[1].x, result[1].y, result[1].z);
                    /* log(dist) */
                    if (dist < .3 * wristDist * finger_scales[i] && result[1].y > result[0].y) {
                        /* log("closed") */
                    } else if (dist > .46 * wristDist * finger_scales[i] && result[1].y < result[0].y) {
                        /* log("open") */
                        for (var k = 0; k < 5; k++) {
                            let p = new Particle(
                                result[1].x * window.innerWidth + (Math.random() * 2 - 1) * 5,
                                result[1].y * window.innerHeight + (Math.random() * 2 - 1) * 5);
                            p.acc_x += result[1].x - result[0].x;
                            p.acc_y += result[1].y - result[0].y;
                            /* p.i = Math.floor(Math.random() * pairs.length) */
                            p.i = i;

                            particles.push(p)
                            particleTargets[i] = {
                                x: result[1].x * window.innerWidth,
                                y: result[1].y * window.innerHeight
                            }
                        }
                        particlesTracking = true;
                        foundSmthing = true;
                    }
                } else if (!foundSmthing) {
                    particlesTracking = false;
                }
                i++;
            }
        }

        let wind_speed = .03;
        wind = simplex_here.noise2D(frame * wind_speed, 0);
        wind_2 = simplex_here.noise2D(frame * wind_speed, 100);
        for (const particle of particles) {
            particle.update();
            particle.draw(canvasCtx);
        }

        for (const particle of particles) {
            if (particle.killFlag) {
                particles.splice(particles.indexOf(particle), 1);
                /* Object.destroy(particle); */
            }
        }
        canvasCtx.restore();
    }

    /* navigator.mediaDevices.getUserMedia({
        video: true
    }).then(stream => {
        log(stream);
        cam = stream;
        let videostream = stream.getVideoTracks()[0];
        videostream.on
        vid.srcObject = stream;
        vid.onloadedmetadata = (e) => {
            vid.play();
        };
    }).catch(err => {
        console.error(err);
    }) */


    const hands = new Hands({
        locateFile: (file) => {
            return `./node_modules/@mediapipe/hands/${file}`
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    hands.setOptions({
        maxNumHands: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: .5
    });
    hands.onResults(onResults);

    const camera = new Camera(vid, {
        onFrame: async () => {
            await hands.send({
                image: vid
            });
        },
        width: 480,
        height: 320
    });
    camera.start()
}


class Hands_Container {
    constructor() {
        this.hands = [];
    }
}
class Hand {
    constructor(type, score) {
        this.landmarks = [];
        this.type = type;
        this.score = score;
    }
}

class Landmark {
    constructor(x, y, z, index) {
        this.x = x;
        this.y = y;
        1
        this.z = z;
        this.index = index;
    }
}

function distance(x, y, z, _x, _y, _z) {
    return Math.sqrt(Math.pow(_x - x, 2) + Math.pow(_y - y, 2) + Math.pow(_z - z, 2));
}

class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return (this)
    }

    mult(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return (this)
    }
}