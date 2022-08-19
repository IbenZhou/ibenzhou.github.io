
const clock = document.getElementById('clock')
const date = document.getElementById('date')

let clockFlag = false

clock.onclick = function(){
    if(clockFlag){
        clockFlag = false
    } else {
        clockFlag = true
    }
    handleTime()
}

var adjustValue = function (val) {
    if (val < 10) {
        return '0' + val
    } else {
        return val
    }
}
var handleTime = function () {
    var date = new Date()
    var hour = date.getHours()
    var min = date.getMinutes()
    var sec = date.getSeconds()
    if(clockFlag){
        var clockString = adjustValue(hour) + ":" + adjustValue(min) + ":" + adjustValue(sec)
    } else {
        var clockString = adjustValue(hour) + ":" + adjustValue(min)
    }
    
    // console.log(clockString)
    // var clockNode = document.createTextNode(clockString)
    clock.innerHTML = clockString
}

var weekArr = ['', '一', '二', '三', '四', '五', '六', '日',]

var setDate = function () {
    var currentDate = new Date()
    //var year = date.getFullYear()
    var month = currentDate.getMonth() + 1
    var day = currentDate.getDate()
    var week = currentDate.getDay()

    var dayString = month + '月' + day + '日'
    var weekString = '星期' + weekArr[week]
    var weekNode = document.createTextNode(weekString)
    var dayNode = document.createTextNode(dayString)

    var dayRender = document.createElement('li')
    dayRender.setAttribute('id', 'day')
    dayRender.append(dayNode)

    var weekRender = document.createElement('li')
    weekRender.setAttribute('id', 'week')
    weekRender.append(weekString)


    date.append(dayRender)
    date.append(weekRender)
}

handleTime()
setDate()

window.onload = function () {
    window.setInterval('handleTime()', 1000)
}

const targetDiv = document.getElementById('icon')

axios.get('https://api.gitrows.com/@github/ibenzhou/startpage/data.json')
.then(function(response){
    console.log(response)
    var data = response.data.data
    console.log(data)
    for (ii = 0; ii < data.length; ii++) {
        var it = data[ii]
        console.log(it)
        var imgRender = document.createElement('img')
        imgRender.setAttribute('src', it.icon)
        imgRender.setAttribute('style', 'background-color:' + it.background)
        var divRender = document.createElement('div')
        divRender.append(imgRender)
        var linkRender = document.createElement('a')
        linkRender.append(divRender)
        linkRender.setAttribute('href', it.url)
        linkRender.setAttribute('target', '_blank')
    
        var title = document.createTextNode(it.name)
        var titleRender = document.createElement('h6')
        titleRender.append(title)
    
        var listRender = document.createElement('li')
        listRender.setAttribute('class', 'item')
        listRender.append(linkRender)
        listRender.append(titleRender)
    
        targetDiv.append(listRender)
    }
})

const baseUrl = 'https://cn.bing.com/search?q='

var searchSection = document.getElementById('searchSection')

var searchButton = document.getElementById('searchButton')
var input = document.getElementById('searchInput')

input.onfocus = function(){
    input.placeholder = ''
    searchSection.setAttribute('style', 'box-shadow:0px 0px 5px #fff')
}

input.onblur = function(){
    input.placeholder = '  Input to Search'
}

var search = function(){
    var inputString = input.value
    if(inputString !== ''){
        var url = baseUrl + inputString
        window.open(url)
        input.value = ''
    }
    
}

searchButton.onclick = search()

window.onkeyup = function(e){
    if(e.keyCode === 13){
        search()
    }
}





