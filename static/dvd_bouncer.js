let angle = 60;
let prev_x = 0;
let prev_y = 0;

let canvas = null;
let ctx = null;

document.addEventListener("DOMContentLoaded", main)

function main() {
    canvas = document.getElementById("dvd_sidebar");
    ctx = canvas.getContext("2d");

    // adapt canvas resolution to the box size
    let cs = getComputedStyle(canvas)
    const width = parseInt(cs.getPropertyValue("width"), 10);
    const height = parseInt(cs.getPropertyValue("height"), 10);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    // console.log(canvas.height)
    
    // start the animation cycle
    update();
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // pixels moved diagonally per cycle
    const distance = 5

    // the range in degrees that the angle can vary by
    const randomization = 70

    if (prev_x<=0||prev_x+20>=canvas.width) { // square has hit a side
        const randomize = (Math.random()*randomization)-randomization/2
        // console.log(`random: ${randomize}`)
        angle_normal = -angle
        angle = (angle_normal+randomize) % 360
        // console.log(`touched wall, ${angle_normal}, ${angle}`)

        // make sure that the box is heading away from the wall
        if (prev_x<=0) {
            if (angle<=360&&angle>=180) {
                if (angle<=270) {
                    angle = 280
                } else {
                    angle = 10
                }
            }
        }
        if (prev_x+20>=canvas.width) {
            if (angle>=270&&angle<=180) {
                if (angle>90) {
                    angle = 190
                } else {
                    angle = 10
                }
            }
        }
    }
    if (prev_y<=0||prev_y+20>=canvas.height) { // square has hit a side
        const randomize = (Math.random()*randomization)-randomization/2
        // console.log(`random: ${randomize}`)
        angle_normal = 90-(angle-90)
        angle = (angle_normal+randomize) % 360
        // console.log(`touched wall, ${angle_normal}, ${angle}`)

        // make sure that the box is heading away from the wall
        if (prev_y<=0) {
            if (angle>=270&&angle<=90) {
                if (angle<=180) {
                    angle = 271
                } else {
                    angle = 89
                }
            }
        }
        if (prev_y+20>=canvas.height) {
            if (angle>=270&&angle<=90) {
                if (angle>0) {
                    angle = 91
                } else {
                    angle = 269
                }
            }
        }
    }

    var x_distance = prev_x+(distance*Math.sin((angle/180)*Math.PI))
    var y_distance = prev_y+(distance*Math.cos((angle/180)*Math.PI))
    prev_x = x_distance;
    prev_y = y_distance;
    // console.log(x_distance)
    // console.log(y_distance)

    if (x_distance + 20 > canvas.width) {
        x_distance = canvas.width - 20;
    } else if (x_distance<0) {
        x_distance = 0;
    }if (y_distance + 20 > canvas.height) {
        y_distance = canvas.height - 20;
    }else if (y_distance<0) {
        y_distance = 0;
    }

    ctx.beginPath()
    ctx.rect(x_distance, y_distance, 20, 20)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2
    ctx.stroke()
    requestAnimationFrame(update)
}