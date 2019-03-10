////////////// Chart constructor ////////////////
const doc = document,
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec'],
    body = doc.getElementsByTagName('body')[0],
    pdng = 10,
    cvsWidth = 500,
    cvsHeght = 650,
    colors = {
        green: 'green',
        red: '#ee4a43',
        gray: '#e1e1e1',
        text: '9faab1',
        dayMode: {
            bg: '#fff',
            text: '#000'
        },
        nightMode: {
            bg: '#242f3e',
            text: '#fff'
        }
    };

function getDate(date) {
    let d = new Date(date);
    return months[date.getMonth()] + ' ' + date.getDate();
}

function getMaxMin(mas) {
    let maxY = mas[0].y, minY = mas[0].y, 
        maxDate = mas[0].x, minDate = mas[0].x;

    for(let el of mas) {
        if(el.y > maxY) maxY = el.y;
        if(el.y < minY) minY = el.y;
        if(new Date(el.x) > new Date(maxDate)) maxDate = el.x;
        if(new Date(el.x) < new Date(minDate)) minDate = el.x;
    }
    return {maxY, minY, maxDate, minDate};
}

function datediff(start, end) {
    return Math.round((new Date(end)-new Date(start))/(1000*60*60*24));
}

function getDatesBetween(start, end) {
    let mas = [], d = new Date(start);
    while(d <= new Date(end)) {
        mas.push(d);
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    }
    return mas;
}

function getDaysFromMin(current, dateList) {
    for(let i = 0; i < dateList.length; i++) {
        let month = dateList[i].getMonth() + 1;
        let day = dateList[i].getDate() + 1;
        let m = month < 10 ? '0' + month : '' + month;
        let d = day < 10 ? '0' + day : '' + day;

        // console.log({current, c:dateList[i].getFullYear() + '-' + m + '-' + d })
        if(current === dateList[i].getFullYear() + '-' + m + '-' + d) return i;
    }
}


function CreateChart(id, data) {
    let mainBlock = doc.createElement('div'),
        title = doc.createElement('h1'),
        btnJoined = doc.createElement('div'),
        btnLeft = doc.createElement('div'),
        btnSwitchMode = doc.createElement('a'),
        cvs = doc.createElement('canvas'),
        line1 = getMaxMin(data[0]),
        line2 = getMaxMin(data[1]);

    this.graphSize = cvsWidth;
    this.lineJoined = {
        main: data[0],
        maxY: line1.maxY,
        minY: line1.minY,
        maxDate: line1.maxDate,
        minDate: line1.minDate,
        enabled: true,
    },
    this.lineLeft = {
        main: data[1],
        maxY: line2.maxY,
        minY: line2.minY,
        maxDate: line2.maxDate,
        minDate: line2.minDate,
        enabled: true,
    }, 
    this.common = {
        maxY: 0,
        minY: 0,
        maxDate: undefined,
        minDate: undefined,
        stepY: 0,
        stepDate: 0,
        dateFullRange: [],
        showMonths: [],
        showY: []
    }

    mainBlock.className = 'main_block day_mode';

    title.innerText = 'Followers';

    btnJoined.innerText = 'Joined';
    btnJoined.id = 'btnJoined';

    btnLeft.innerText = 'Left';
    btnLeft.id = 'btnLeft';

    btnSwitchMode.innerText = 'Switch to Night Mode';

    cvs.id = id;
    cvs.width = cvsWidth;
    cvs.height = cvsHeght;


    mainBlock.appendChild(title);
    mainBlock.appendChild(cvs);
    mainBlock.appendChild(btnJoined);
    mainBlock.appendChild(btnLeft);
    mainBlock.appendChild(btnSwitchMode);
    body.appendChild(mainBlock)


    let ctx = cvs.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle = colors.gray;
    ctx.lineWidth = 1;
    for(let i = 0; i < 5; i++) {
        ctx.moveTo(0, this.graphSize - this.graphSize / 5 * i);
        ctx.lineTo(this.graphSize, this.graphSize - this.graphSize / 5 * i);
    };
    ctx.stroke();
    ctx.closePath();

    // methods

    this.drowControlPanel = function() {
        ctx.beginPath();
        ctx.rect(0, this.graphSize + 50, this.graphSize, 70);
        ctx.fillStyle = '#f5f9fb';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }


    this.drowGraph = function() {
        this.common.stepY = Math.round(Math.max(this.lineJoined.maxY, this.lineLeft.maxY) / 5);
        this.common.stepDate = new Date(this.lineJoined.maxDate) > new Date(this.lineLeft.maxDate) ? Math.round(this.lineJoined.maxDate / 6) : Math.round(this.lineLeft.maxDate / 6);

        let diff = datediff(this.lineJoined.minDate, this.lineJoined.maxDate);
        this.common.stepDate = diff / 6; // дней за 1 шан по оси Х
        this.common.showMonths = [];
        this.common.dateFullRange = getDatesBetween(this.lineJoined.minDate, this.lineJoined.maxDate);
        for(let i = 0; i <= this.common.dateFullRange.length; i += this.common.stepDate) {
            if(this.common.dateFullRange[i]) this.common.showMonths.push(this.common.dateFullRange[i])
        }

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial Black';    
        for(let i = 0; i < this.common.showMonths.length; i++) {
            ctx.fillText(getDate(this.common.showMonths[i]), this.graphSize / this.common.showMonths.length * i + 15, this.graphSize + 20);
        }
        ctx.closePath();

        /////////////////////

        this.common.stepY = this.lineJoined.maxY / 5; // фолловеров на 1 шаг по оси Y
        for(let i = 0; i < this.lineJoined.maxY; i += this.common.stepY) {
            this.common.showY.push(i);
        }

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial Black';   
        for(let i = 0; i < this.common.showY.length; i++) {
            ctx.fillText(Math.round(this.common.showY[i]), 0, this.graphSize - this.graphSize / 5 * i - 10)
        }
        ctx.closePath();

        /////////////////////
        ctx.beginPath();
        ctx.strokeStyle = colors.green;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        let pxlsOnPercentY = this.graphSize / this.lineJoined.maxY,
            pxlsOnPercentX = this.graphSize / this.common.dateFullRange;
        ctx.moveTo(0, this.graphSize - (pxlsOnPercentY * this.lineJoined.main[0].y))
        for(let i = 1; i < this.lineJoined.main.length; i++) {
            console.log( getDaysFromMin(this.lineJoined.main[i].x, this.common.dateFullRange))
            // ctx.lineTo(this.graphSize - pxlsOnPercentX * getDaysFromMin(this.lineJoined.main[i].x, this.common.dateFullRange), this.graphSize - (pxlsOnPercentY * this.lineJoined.main[i].y))
        }
        ctx.stroke();
        ctx.closePath();


    }

    this.drow = function() {
        // ctx.clearRect(0, 0, cvs.width, cvs.height);
        
        // drow control panel
        this.drowControlPanel();
        this.drowGraph()

    }

    this.drow();


}


/////////////////// main ///////////////////


document.addEventListener("DOMContentLoaded", ready);

function ready() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://dev.cubozoa.ru/position_sl96/json_canvas_data.php', true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
          alert(xhr.status + ': ' + xhr.statusText);
        } else {
          createGraph(JSON.parse(xhr.responseText).slice(328,))
        }
      
    }

    function createGraph(data) {
        let resp = [];
        resp.push(data);
        resp.push(data.slice().reverse())
        new CreateChart('canvas', resp);
    }
    

}

