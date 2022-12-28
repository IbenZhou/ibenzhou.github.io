document.onkeydown = function(e){
    // console.log(e)
    if(confirm == true){
        if(e.key === 'ArrowUp' && snake.currentDirection !== direction.down){
            snake.currentDirection = direction.up
        } else if(e.key === 'ArrowLeft' && snake.currentDirection !== direction.right){
            snake.currentDirection = direction.left
        } else if(e.key === "ArrowRight" && snake.currentDirection !== direction.left){
            snake.currentDirection = direction.right
        } else if(e.key === 'ArrowDown' && snake.currentDirection !== direction.up){
            snake.currentDirection = direction.down
        }
        confirm = false
    }
    if(e.key === ' ') {
        main()
    }
}

var delayTime = 300

setShape()


window.onresize = setShape
food.generatePos(snake)

workSpace.onclick = function(){
    document.getElementById('pause').style.display = 'block'
    clearInterval(interval)
    interval = null
}

var interval = setInterval(main, delayTime)

function main(){
    if(snake.move()){
        snake.show()
    }
    var score = snake.body.length - 3
    scoreEl[0].innerHTML = 'Score: ' + score
    scoreEl[1].innerHTML = 'Score: ' + score

    if(score >= 20){
        delayTime = 250
    } else if(score >= 50){
        delayTime = 200
    } else if(score >= 80){
        delayTime = 150
    } else if(score >= 110){
        delayTime = 100
    } else if(score >= 180){
        delayTime = 80
    } else if(score >=200){
        delayTime = 50
    }

    confirm = true
}

document.getElementById('resume').onclick = function(e){
    e.stopPropagation()
    document.getElementById('pause').style.display = 'none'
    interval = setInterval(main, delayTime)
}

document.getElementById('restart2').onclick = function(){
    window.location.reload()
}

document.getElementById('restart1').onclick = function(){
    window.location.reload()
}