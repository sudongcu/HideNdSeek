const port = '5000';

let isGameStartValid = function (row, col) {

    const minvalue = 5;
    const maxvalue = 10;

    if (row == undefined || row == null || row == ''
        || col == undefined || col == null || col == '') {
        alert('빈 값은 입력할 수 없다.');
        return false;
    }

    if (row < minvalue) {
        alert(String(minvalue) + '이상의 값 필요.');
        $('#textRow').focus();
        return false;
    }
    if (col < minvalue) {
        alert(String(minvalue) + '이상의 값 필요.');
        $('#textCol').focus();
        return false;
    }

    if (row > maxvalue) {
        alert(String(maxvalue) + '이하의 값 필요.');
        $('#textRow').focus();
        return false;
    }
    if (col > maxvalue) {
        alert(String(maxvalue) + '이하의 값 필요.');
        $('#textCol').focus();
        return false;
    }

    return true;
}

let gameStart = function () {

    const row = $('#textRow').val();
    const col = $('#textCol').val();
    
    if (!isGameStartValid(row,  col))
        return;

    $("#hiddenRow").val(row);
    $("#hiddenCol").val(col);

    $.ajax({
        url: 'http://' + document.domain + ':' + port + '/start?row=' + row + '&col=' + col,
        type: 'get',
        contentType: 'application/json',
        success: function (data) {
            drawMap(data);
        },
        error: function (xtr, status, error) {
            alert('데이터를 가져오는데 실패.');
        }
    });
}

let drawMap = function (data) {

    let map;
    let hider;
    let tableMap = '';
    let boxId = '';
    
    let gameKey;
    let checkGameKey = true;

    $.each(data, function (key, value) {

        if (key == 'hider')
            hider = value;
        else if (key == 'map')
            map = value;
        else if (key == 'gameKey')
            gameKey = value;
        else
            return false;
    });

    if (hider == undefined || hider == null || hider == '') {
        alert('에러 발생...\r다시 시직.');
        return;
    }
    if (map == undefined || map == null) {
        alert('에러 발생.\r다시 시작.');
        return;
    }
    if (gameKey == undefined || gameKey == null) {
        alert('게임키 없음...\r다시 시작.');
        return;
    }

    $.each(gameKey, function (key, value) {
        if (key == 'key')
            $('#hiddenKey').val(value);
        else if (key == 'tag')
            $('#hiddenTag').val(value);
        else if (key == 'nonce')
            $('#hiddenNonce').val(value);
        
        if (value == null || value == undefined || value == '')
        {
            checkGameKey = false;
            return false;
        }
    });

    if (!checkGameKey) {
        alert('게임키 없음...\r다시 시작.');
        return;
    }

    for (let i = 0; i < map.length; i++) {

        tableMap += '<tr>';
        for (let j = 0; j < map[i].length; j++) {

            boxId = 'box' + i.toString() + j.toString();

            tableMap += '<td>';
            tableMap += '    <div class="hide-box" id="' + boxId + '" onclick="trySeek(' + i + ', ' + j + ')"></div>';
            tableMap += '</td>';
        }
        tableMap += '</tr>';
    }

    $("#hider").html(hider);
    $('#tableMap').html(tableMap);

    $('#divSetting').attr('class', 'off');
    $('#divGame').attr('class', 'on');
    
    $('#textRow').val('');
    $('#textCol').val('');
    
    repaintBoxes();
}

let repaintBoxes = function() {
    var hideBoxes = document.getElementsByClassName('hide-box');    
    var bottomColor = getRandomColor();
    var rightColor = getRandomColor();
    for (var i = 0; i < hideBoxes.length; i++) {
        hideBoxes[i].style.borderBottomColor = bottomColor;
        hideBoxes[i].style.borderRightColor = rightColor;
    }
}

let getRandomColor = function() {

    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

let isTrySeekValid = function (row, col) {
    
    if ($("#divSetting").hasClass("on"))
        return false;

    return $("#box" + row + col).hasClass('hide-box');
}

let trySeek = function (row, col) {

    if (!isTrySeekValid(row, col))
        return;

    let key = encodeURIComponent($("#hiddenKey").val());
    let tag = encodeURIComponent($("#hiddenTag").val());    
    let nonce = encodeURIComponent($("#hiddenNonce").val());

    const postdata = {
        'row': row,
        'col': col,
        'mapRow': $('#hiddenRow').val(),
        'mapCol': $('#hiddenCol').val(),
        'gameKey': { 'key': key, 'tag': tag, 'nonce': nonce }
    };

    $.ajax({
        url: 'http://' + document.domain + ':' + port + '/seek',
        type: 'post',
        data: JSON.stringify(postdata),
        dataType: "json",
        contentType: 'application/json',
        success: function (data) {
            openBox(data, row, col);
        },
        error: function (xtr, status, error) {
            alert('데이터를 가져오는데 실패.');
        }
    });
}

let openBox = function (data, row, col) {

    let code;
    let message;
    
    $.each(data, function (key, value) {

        if (key == 'code')
            code = value;
        else if (key == 'message')  
            message = value;
        else
            return false;
    });

    if (code == '0') {

        let hider = $('#hider').text().replace(/_/gi, '\n');

        $("#box" + row + col).attr('class', 'seek-box');
        $("#box" + row + col).html(hider);
        alert(message);
        
        $('#divSetting').attr('class', 'on');
        $('#textRow').focus();
    }
    else {
        $("#box" + row + col).attr('class', 'show-box');
        alert(message);
    }
}