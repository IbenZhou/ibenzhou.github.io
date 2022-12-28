//config of the game
var confirm = true
var workSpace = document.getElementById('workSpace')
var snakeBody = document.getElementById('body')
var snakeHead = document.getElementById('head')
var scoreEl = document.querySelectorAll(".score")

var mapDB = []
var mapSize = 0
const snakeSize = 20

function setShape() {
    var height = workSpace.clientHeight
    if (height % snakeSize !== 0) {
        height = Math.floor(height / snakeSize) * snakeSize - snakeSize
    }
    workSpace.style.width = height + 'px'
    workSpace.style.height = height + 'px'
    mapSize = height / snakeSize
    mapDB = []
    for (i = 0; i < mapSize; i++) {
        for (j = 0; j < mapSize; j++) {
            mapDB.push({
                x: i,
                y: j
            })
        }
    }
}


var direction = {
    left: { x: -1, y: 0 },
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 }
}

var snake = {
    currentDirection: direction.right,

    head: {
        x: 5,
        y: 1,
        Elstyle: "width:20px;height:20px;background-color:red;position:absolute;border-radius:30%;"
    },

    body: [{
        x: 4,
        y: 1,
        Elstyle: "width:20px;height:20px;background-color:aqua;border-radius:50%;position:absolute;"
    }, {
        x: 3,
        y: 1,
        Elstyle: "width:20px;height:20px;background-color:aqua;border-radius:50%;position:absolute;"
    }, {
        x: 2,
        y: 1,
        Elstyle: "width:20px;height:20px;background-color:aqua;border-radius:50%;position:absolute;"
    }],
    move: function () {
        var newHead = {
            x: this.head.x + this.currentDirection.x,
            y: this.head.y + this.currentDirection.y,
            Elstyle: this.head.Elstyle
        }

        if (newHead.x === food.x && newHead.y === food.y) {
            food.generatePos(this)
        } else {
            this.body.pop()
        }

        this.body.unshift(this.head)
        this.body[0].Elstyle = this.body[1].Elstyle

        this.head = newHead

        if (newHead.x < 0 || newHead.y < 0 || newHead.x >= mapSize || newHead.y >= mapSize) {
            document.getElementById('over').style.display = 'block'
            document.getElementById('pause').remove()
            clearInterval(interval)
            return false
        }

        for (i = 2; i < this.body.length; i++) {
            let it = this.body[i]
            if (it.x === newHead.x && it.y === newHead.y) {
                document.getElementById('over').style.display = 'block'
                document.getElementById('pause').remove()
                clearInterval(interval)
                return false
            }
        }

        // var newItem = this.body[this.body.length - 1]

        // if(this.body[0].x < 0 || this.body[0].y < 0 || this.body[0].x > mapSize-1 || this.body[0].y > mapSize-1){
        //     document.getElementById('over').style.display = 'block'
        //     document.getElementById('pause').remove()
        //     clearInterval(interval)
        //     console.log('over')
        // }

        // for (i = this.body.length - 1; i > 0; i--) {
        //     this.body[i].x = this.body[i - 1].x
        //     this.body[i].y = this.body[i - 1].y
        //     console.log(this.body[i].x + ' ' + this.body[i].y)
        // }
        // console.log('============')
        // for (i = this.body.length - 1; i > 0; i--) {
        //     console.log(this.body[i].x + ' ' + this.body[i].y)
        // }

        // this.body[0].x += this.currentDirection.x
        // this.body[0].y += this.currentDirection.y

        // if (this.body[0].x === food.x && this.body[0].y === food.y) {
        //     this.body.push(newItem)
        //     food.generatePos()
        // }

        return true
    },

    show: function () {
        snakeBody.innerHTML = ''
        snakeHead.innerHTML = ''

        var it = this.head
        var itTopSize = 'top:' + it.y * snakeSize + 'px;'
        var itLeftSize = 'left:' + it.x * snakeSize + 'px;'
        var itStyle = it.Elstyle + itTopSize + itLeftSize
        var item = document.createElement('div')
        item.setAttribute('style', itStyle)
        snakeHead.append(item)

        for (i = 0; i < this.body.length; i++) {
            var it = this.body[i]
            var itTopSize = 'top:' + it.y * snakeSize + 'px;'
            var itLeftSize = 'left:' + it.x * snakeSize + 'px;'
            var itStyle = it.Elstyle + itTopSize + itLeftSize
            var item = document.createElement('div')
            item.setAttribute('style', itStyle)
            snakeBody.append(item)
        }
    },
}

var food = {
    x: 0,
    y: 0,
    Elstyle: "width:20px;height:20px;background-color:red;position:absolute;border-radius:50%;position:absolute;",
    generatePos: function (snake) {
        var foodEl = document.getElementById('food')
        while (1) {
            var flag = true
            this.x = Math.floor(Math.random() * mapSize)
            this.y = Math.floor(Math.random() * mapSize)
            for (i = 0; i < snake.body.length; i++) {
                if (this.x === snake.body[i].x && this.y === snake.body[i].y) {
                    flag = false
                }
            }

            if (this.x === snake.head.x && this.y === snake.head.y) {
                flag = false
            }

            if (flag) {
                break
            }
        }

        var topSize = "top: " + this.y * snakeSize + "px;"
        var leftSize = "left: " + this.x * snakeSize + "px;"
        var style = this.Elstyle + topSize + leftSize;
        foodEl.setAttribute('style', style)
    }
}

