let GAME_ID = null;
let EXPLORE_MODE = false;
let POS = { r: 0, c: 0 };
let GRID = { rows: 0, cols: 0 };
let PATH = []; // record of visited cells during explore
let OVERLAY_OPEN = false; // block movement when overlay is shown
let MONSTER = null; // monster position {r,c}
let MONSTER_IMG = null; // HTMLImageElement for minimap rendering
let MONSTER_IMG_READY = false;
let SHOW_MINIMAP_MONSTER = false; // hide monster indicator on minimap

let isGameStartValid = function (row, col) {

    const minvalue = 10;
    const maxvalue = 20;

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
        url: '/start?row=' + row + '&col=' + col,
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
    
    GAME_ID = data.gameId;
    map = data.map;

    if (!map || !GAME_ID) {
        if (data.error) {
            alert(data.error);
        } else {
            alert('에러 발생.\r다시 시작.');
        }
        return;
    }

    if (map == undefined || map == null) {
        alert('에러 발생.\r다시 시작.');
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

    $("#hider").text('???');
    $('#tableMap').html(tableMap);

    $('#divSetting').attr('class', 'off');
    $('#divGame').attr('class', 'on');

    // Apply gem image if provided by server
    if (data.gem) {
        const root = document.getElementById('divGame');
        if (root) root.style.setProperty('--gem', `url('${data.gem}')`);
    }
    // Apply monster image if provided (reserved for future rendering)
    if (data.monster) {
        const root = document.getElementById('divGame');
        if (root) root.style.setProperty('--monster', `url('${data.monster}')`);
        // Preload for minimap drawing
        try {
            const css = getComputedStyle(root).getPropertyValue('--monster').trim();
            const url = extractUrl(css);
            if (url) {
                MONSTER_IMG_READY = false;
                MONSTER_IMG = new Image();
                MONSTER_IMG.onload = function() { MONSTER_IMG_READY = true; drawMinimap(); };
                MONSTER_IMG.onerror = function() { MONSTER_IMG_READY = false; };
                MONSTER_IMG.src = url;
            }
        } catch (_) {}
    }
    
    $('#textRow').val('');
    $('#textCol').val('');
    
    $("#message").html('');
    
    repaintBoxes();

    GRID.rows = map.length;
    GRID.cols = map[0].length;
    POS.r = Math.floor(GRID.rows / 2);
    POS.c = Math.floor(GRID.cols / 2);
    PATH = [];
    MONSTER = null;
    drawMinimap();
}

let repaintBoxes = function() {
    var hideBoxes = document.getElementsByClassName('hide-box');    
    var bottomColor = getRandomColor();
    var rightColor = getRandomColor();
    for (var i = 0; i < hideBoxes.length; i++) {
        var el = hideBoxes[i];
        // Base pair used by existing tile styling
        el.style.setProperty('--b1', bottomColor); // maps to top/bottom in viewport
        el.style.setProperty('--b2', rightColor);  // maps to left/right in viewport
        // Explicit mapping for clarity and future CSS use
        el.style.setProperty('--top', bottomColor);
        el.style.setProperty('--bottom', bottomColor);
        el.style.setProperty('--left', rightColor);
        el.style.setProperty('--right', rightColor);
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
        'gameId': GAME_ID,
        'row': row,
        'col': col,
        'mapRow': $('#hiddenRow').val(),
        'mapCol': $('#hiddenCol').val(),
        // gameKey may be empty for first click
        'gameKey': (key && tag && nonce) ? { 'key': key, 'tag': tag, 'nonce': nonce } : null
    };

    $.ajax({
        url: '/seek',
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
    let assigned = false;
    
    $.each(data, function (key, value) {

        if (key == 'code')
            code = value;
        else if (key == 'message')  
            message = value;
        else if (key == 'gameKey') {
            $('#hiddenKey').val(value.key);
            $('#hiddenTag').val(value.tag);
            $('#hiddenNonce').val(value.nonce);
        }
        else if (key == 'hider') {
            $("#hider").text(value);
        }
    });

    if (code == 'assigned') {
        // switch to immersive explore mode on first click
        EXPLORE_MODE = true;
        $("#message").html(message);
        $("#box" + row + col).attr('class', 'show-box');
        $('#divGame').addClass('explore');
    // set starting position to the clicked cell and seed path
    POS.r = row; POS.c = col;
    PATH = [{ r: row, c: col }];
        // apply selected box colors to viewport and HUD color
        const box = document.getElementById('box' + row + col);
        if (box) {
            const cs = window.getComputedStyle(box);
            // Prefer explicit directional vars; fall back to base pair
            const c1 = (cs.getPropertyValue('--top') || cs.getPropertyValue('--b1') || cs.backgroundColor).trim();
            const c2 = (cs.getPropertyValue('--left') || cs.getPropertyValue('--b2') || cs.borderColor).trim();
            const root = document.querySelector('#viewport');
            if (root) {
                root.style.setProperty('--c1', c1);
                root.style.setProperty('--c2', c2);
                const bright = lightenHexColor(c1, 0.45);
                root.style.setProperty('--hudColor', bright);
            }
        }
        drawMinimap();
        // focus viewport to capture keys
        setTimeout(() => { const vp = document.getElementById('viewport'); if (vp) vp.focus(); }, 0);
        // snap camera forward pulse
        pulseForward();
        // kick off initial hint to populate steps HUD
        requestHintAt(row, col);
        return;
    }

    if (code == '0') {
        // Always show overlay once when gem is found
        showFoundOverlayThenFinalize(row, col);
    }
    else {
        if (EXPLORE_MODE) {
            // in explore mode, don't reveal or alert; just update message
            $("#message").html(message);
        } else {
            $("#box" + row + col).attr('class', 'show-box');
            $("#message").html(message);
            alert(message);
        }
    }
}

// Keyboard movement and viewport animation
document.addEventListener('keydown', function (e) {
    if (!EXPLORE_MODE) return;
    if (OVERLAY_OPEN) { e.preventDefault(); return; }
    const key = e.key.toLowerCase();
    if (['arrowup','w','arrowdown','s','arrowleft','a','arrowright','d'].includes(key)) {
        e.preventDefault();
    }
    let nr = POS.r, nc = POS.c;
    if (key === 'arrowup' || key === 'w') nr = Math.max(0, POS.r - 1);
    else if (key === 'arrowdown' || key === 's') nr = Math.min(GRID.rows - 1, POS.r + 1);
    else if (key === 'arrowleft' || key === 'a') nc = Math.max(0, POS.c - 1);
    else if (key === 'arrowright' || key === 'd') nc = Math.min(GRID.cols - 1, POS.c + 1);
    else return;
    if (nr === POS.r && nc === POS.c) return;
    POS.r = nr; POS.c = nc;
    // record unique steps
    if (!PATH.length || PATH[PATH.length - 1].r !== nr || PATH[PATH.length - 1].c !== nc) {
        PATH.push({ r: nr, c: nc });
    }
    animateMove(nr, nc, key);
    drawMinimap();
    // ask server for hint at new position
    requestHintAt(nr, nc);
});

// 모바일 터치 스와이프 이동
let touchStartX = null, touchStartY = null;
document.addEventListener('touchstart', function(e) {
    if (!EXPLORE_MODE || OVERLAY_OPEN) return;
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});
document.addEventListener('touchend', function(e) {
    if (!EXPLORE_MODE || OVERLAY_OPEN) return;
    if (touchStartX === null || touchStartY === null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    let key = null;
    if (Math.max(absDx, absDy) > 30) { // 최소 스와이프 거리
        if (absDx > absDy) {
            key = dx > 0 ? 'arrowright' : 'arrowleft';
        } else {
            key = dy > 0 ? 'arrowdown' : 'arrowup';
        }
    }
    touchStartX = null; touchStartY = null;
    if (!key) return;
    let nr = POS.r, nc = POS.c;
    if (key === 'arrowup') nr = Math.max(0, POS.r - 1);
    else if (key === 'arrowdown') nr = Math.min(GRID.rows - 1, POS.r + 1);
    else if (key === 'arrowleft') nc = Math.max(0, POS.c - 1);
    else if (key === 'arrowright') nc = Math.min(GRID.cols - 1, POS.c + 1);
    if (nr === POS.r && nc === POS.c) return;
    POS.r = nr; POS.c = nc;
    if (!PATH.length || PATH[PATH.length - 1].r !== nr || PATH[PATH.length - 1].c !== nc) {
        PATH.push({ r: nr, c: nc });
    }
    animateMove(nr, nc, key);
    drawMinimap();
    requestHintAt(nr, nc);
});

function animateMove(r, c, key) {
    const room = document.querySelector('.room');
    if (!room) return;
    // apply directional class for CSS-driven animation
    room.classList.remove('move-up','move-down','move-left','move-right');
    const vp = document.getElementById('viewport');
    const useC1 = (key === 'arrowup' || key === 'w' || key === 'arrowdown' || key === 's');
    if (key === 'arrowup' || key === 'w') room.classList.add('move-up');
    else if (key === 'arrowdown' || key === 's') room.classList.add('move-down');
    else if (key === 'arrowleft' || key === 'a') room.classList.add('move-left');
    else if (key === 'arrowright' || key === 'd') room.classList.add('move-right');
    if (vp) {
        const base = getComputedStyle(vp).getPropertyValue(useC1 ? '--c1' : '--c2').trim();
        const bright = lightenHexColor(base, 0.45);
        if (bright) vp.style.setProperty('--hudColor', bright);
    }
    // clear the class after the transition ends
    setTimeout(() => { room.classList.remove('move-up','move-down','move-left','move-right'); }, 180);
}

function pulseForward() {
    const room = document.querySelector('.room');
    if (!room) return;
    room.classList.add('pulse');
    setTimeout(() => { room.classList.remove('pulse'); }, 180);
}

function drawMinimap() {
    const canvas = document.getElementById('minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(1, Math.floor(rect.width * dpr));
    const targetH = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    // grid
    const cell = Math.min(Math.floor(w / GRID.cols), Math.floor(h / GRID.rows));
    ctx.strokeStyle = '#bbb';
    for (let r = 0; r < GRID.rows; r++) {
        for (let c = 0; c < GRID.cols; c++) {
            ctx.strokeRect(c * cell, r * cell, cell, cell);
        }
    }
    // player
    ctx.fillStyle = '#0a84ff';
    ctx.fillRect(POS.c * cell + 2, POS.r * cell + 2, cell - 4, cell - 4);
    // monster: optionally draw on minimap (currently disabled)
    if (SHOW_MINIMAP_MONSTER && MONSTER) {
        const mx = MONSTER.c * cell, my = MONSTER.r * cell;
        if (MONSTER_IMG && MONSTER_IMG_READY) {
            const pad = Math.max(1, Math.floor(cell * 0.1));
            const iw = cell - pad * 2; const ih = cell - pad * 2;
            ctx.drawImage(MONSTER_IMG, mx + pad, my + pad, iw, ih);
        } else {
            const s = Math.max(2, Math.floor(cell * 0.4));
            ctx.fillStyle = '#ff3b30';
            ctx.fillRect(mx + (cell - s) / 2, my + (cell - s) / 2, s, s);
            ctx.strokeStyle = '#660000';
            ctx.lineWidth = 1;
            ctx.strokeRect(mx + (cell - s) / 2, my + (cell - s) / 2, s, s);
        }
    }
}

function requestHintAt(r, c) {
    let key = encodeURIComponent($("#hiddenKey").val());
    let tag = encodeURIComponent($("#hiddenTag").val());
    let nonce = encodeURIComponent($("#hiddenNonce").val());
    const postdata = {
        'gameId': GAME_ID,
        'row': r,
        'col': c,
        'mapRow': GRID.rows,
        'mapCol': GRID.cols,
        'gameKey': (key && tag && nonce) ? { 'key': key, 'tag': tag, 'nonce': nonce } : null
    };
    $.ajax({
        url: '/seek',
        type: 'post',
        data: JSON.stringify(postdata),
        dataType: "json",
        contentType: 'application/json',
        success: function (data) {
            if (data && data.message) {
                $("#message").html(data.message);
            }
            if (data && (typeof data.steps === 'number' || typeof data.distance === 'number')) {
                const hud = document.getElementById('hudSteps');
                if (hud) {
                    const steps = (typeof data.steps === 'number') ? data.steps : Math.round(data.distance);
                    hud.textContent = steps > 0 ? String(steps) : '0';
                }
            }
            if (data && data.monsterPos && Array.isArray(data.monsterPos) && data.monsterPos.length === 2) {
                MONSTER = { r: data.monsterPos[0], c: data.monsterPos[1] };
                drawMinimap();
            }
            if (data && typeof data.danger === 'boolean') {
                const vp = document.getElementById('viewport');
                if (vp) {
                    if (data.danger) {
                        vp.style.setProperty('--bgColor', 'linear-gradient(0deg, rgba(180, 0, 0, 1) 0%, #a10 100%)');
                        vp.style.setProperty('--innerColor', 'linear-gradient(180deg, #942121ff 0%, #be0000ff 80%)');
                    } else {
                        vp.style.setProperty('--bgColor', '#000');
                        vp.style.setProperty('--innerColor', '#111');
                    }
                }
            }
            // Game Over if stepping onto monster tile
            if (data && data.monsterPos && Array.isArray(data.monsterPos) && data.monsterPos.length === 2) {
                MONSTER = { r: data.monsterPos[0], c: data.monsterPos[1] };
                if (MONSTER.r === r && MONSTER.c === c) {
                    showMonsterOverlayThenFinalize(r, c);
                    return;
                }
            }
            if (data && data.code === '0') {
                showFoundOverlayThenFinalize(r, c);
            }
        }
    });
}

function finalizeFound(r, c) {
    EXPLORE_MODE = false;
    $("#divGame").removeClass('explore');
    $("#divGame").addClass('completed');
    const hud = document.getElementById('hudSteps');
    if (hud) hud.textContent = '';
    // paint path with arrows
    for (let i = 0; i < PATH.length; i++) {
        const step = PATH[i];
        const id = '#box' + step.r + step.c;
        const $cell = $(id);
        if (i < PATH.length - 1) { $cell.addClass('path'); }
        const node = $cell.get(0);
        if (node) {
            const cs = window.getComputedStyle(node);
            const b1 = (cs.getPropertyValue('--b1') || '').trim();
            const b2 = (cs.getPropertyValue('--b2') || '').trim();
            const contrast = pickContrastColor(b1, b2);
            node.style.setProperty('--pathColor', contrast.color);
            node.style.setProperty('--pathRing', contrast.ring);
        }
        if (i < PATH.length - 1) {
            const next = PATH[i + 1];
            const dr = next.r - step.r;
            const dc = next.c - step.c;
            if (dr === -1 && dc === 0) $cell.addClass('arrow-up');
            else if (dr === 1 && dc === 0) $cell.addClass('arrow-down');
            else if (dr === 0 && dc === -1) $cell.addClass('arrow-left');
            else if (dr === 0 && dc === 1) $cell.addClass('arrow-right');
        }
    }
    // mark found cell by replacing its own content style to gem over black
    const foundEl = document.getElementById('box' + r + c);
    if (foundEl) {
        // ensure no path/arrow marks remain on the final tile
        foundEl.classList.remove('path','arrow-up','arrow-down','arrow-left','arrow-right');
        foundEl.classList.add('found-fill');
    }
    // Show start controls and prevent further clicks
    $('#divSetting').attr('class', 'on');
    $('#textRow').focus();
    $("#message").html('보석을 찾았어! 새 게임을 시작해봐.');
}

function gameOverAt(r, c) {
    EXPLORE_MODE = false;
    $("#divGame").removeClass('explore');
    $("#divGame").addClass('completed');
    const hud = document.getElementById('hudSteps');
    if (hud) hud.textContent = '';
    // paint path with arrows
    for (let i = 0; i < PATH.length; i++) {
        const step = PATH[i];
        const id = '#box' + step.r + step.c;
        const $cell = $(id);
        if (i < PATH.length - 1) { $cell.addClass('path'); }
        const node = $cell.get(0);
        if (node) {
            const cs = window.getComputedStyle(node);
            const b1 = (cs.getPropertyValue('--b1') || '').trim();
            const b2 = (cs.getPropertyValue('--b2') || '').trim();
            const contrast = pickContrastColor(b1, b2);
            node.style.setProperty('--pathColor', contrast.color);
            node.style.setProperty('--pathRing', contrast.ring);
        }
        if (i < PATH.length - 1) {
            const next = PATH[i + 1];
            const dr = next.r - step.r;
            const dc = next.c - step.c;
            if (dr === -1 && dc === 0) $cell.addClass('arrow-up');
            else if (dr === 1 && dc === 0) $cell.addClass('arrow-down');
            else if (dr === 0 && dc === -1) $cell.addClass('arrow-left');
            else if (dr === 0 && dc === 1) $cell.addClass('arrow-right');
        }
    }
    // mark monster cell
    const monEl = document.getElementById('box' + r + c);
    if (monEl) {
        monEl.classList.remove('path','arrow-up','arrow-down','arrow-left','arrow-right','found-fill');
        monEl.classList.add('monster-fill');
    }
    $('#divSetting').attr('class', 'on');
    $('#textRow').focus();
    $("#message").html('몬스터에게 잡혔어! GAME OVER. 새 게임을 시작해봐.');
}

function showMonsterOverlayThenFinalize(r, c) {
    const overlay = document.getElementById('monsterOverlay');
    const overlayImg = document.getElementById('monsterOverlayImg');
    if (!overlay || !overlayImg) { gameOverAt(r, c); return; }
    OVERLAY_OPEN = true;
    const root = document.getElementById('divGame');
    const mVar = root ? getComputedStyle(root).getPropertyValue('--monster').trim() : '';
    let url = mVar;
    if (url && url.startsWith('url(')) {
        url = url.slice(4, -1).trim();
        if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
            url = url.slice(1, -1);
        }
    }
    overlayImg.src = url || '/static/img/monster.png';
    overlay.style.display = 'flex';
    const hide = (evt) => {
        if (evt) evt.preventDefault();
        overlay.style.display = 'none';
        overlay.removeEventListener('click', hide);
        document.removeEventListener('keydown', hide);
        OVERLAY_OPEN = false;
        gameOverAt(r, c);
    };
    overlay.addEventListener('click', hide);
    document.addEventListener('keydown', hide);
    overlay.focus();
}

function showFoundOverlayThenFinalize(r, c) {
    const overlay = document.getElementById('foundOverlay');
    const overlayImg = document.getElementById('foundOverlayImg');
    if (!overlay || !overlayImg) { finalizeFound(r, c); return; }
    OVERLAY_OPEN = true;
    const root = document.getElementById('divGame');
    const gemVar = root ? getComputedStyle(root).getPropertyValue('--gem').trim() : '';
    let url = gemVar;
    if (url && url.startsWith('url(')) {
        url = url.slice(4, -1).trim();
        if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
            url = url.slice(1, -1);
        }
    }
    overlayImg.src = url || '/static/img/gem.png';
    overlay.style.display = 'flex';
    const hide = (evt) => {
        if (evt) evt.preventDefault();
        overlay.style.display = 'none';
        overlay.removeEventListener('click', hide);
        document.removeEventListener('keydown', hide);
        OVERLAY_OPEN = false;
        finalizeFound(r, c);
    };
    overlay.addEventListener('click', hide);
    document.addEventListener('keydown', hide);
    overlay.focus();
}

// keep minimap crisp on resize
window.addEventListener('resize', drawMinimap);

// Compute a contrasting path color based on two tile colors
function pickContrastColor(c1, c2) {
    function parseHex(c) {
        if (!c || typeof c !== 'string') return null;
        const m = c.trim().match(/^#?([0-9a-fA-F]{6})$/);
        if (!m) return null;
        const n = parseInt(m[1], 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    function luminance(rgb) {
        if (!rgb) return 0;
        const a = [rgb.r, rgb.g, rgb.b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }
    function toHex(rgb) {
        const h = (x) => x.toString(16).padStart(2, '0');
        return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
    }
    function invert(rgb) { return { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b }; }
    const rgb1 = parseHex(c1);
    const rgb2 = parseHex(c2);
    const lum1 = luminance(rgb1);
    const lum2 = luminance(rgb2);
    // choose a base: invert the brighter of the two for strongest contrast
    let base = (lum1 >= lum2 ? invert(rgb1 || { r: 10, g: 132, b: 255 }) : invert(rgb2 || { r: 10, g: 132, b: 255 }));
    // nudge toward saturated blue if result is too gray
    const satBlue = { r: 10, g: 132, b: 255 };
    const mix = (a, b, t) => ({ r: Math.round(a.r * (1 - t) + b.r * t), g: Math.round(a.g * (1 - t) + b.g * t), b: Math.round(a.b * (1 - t) + b.b * t) });
    const lumBase = luminance(base);
    if (Math.abs(base.r - base.g) < 20 && Math.abs(base.g - base.b) < 20) {
        base = mix(base, satBlue, 0.6);
    }
    // ensure sufficient contrast against both backgrounds by adjusting brightness
    const target = base;
    const ring = { r: 255, g: 255, b: 255 };
    return { color: toHex(target), ring: toHex(ring) };
}

// Lighten a hex color by mixing toward white (t in 0..1)
function lightenHexColor(hex, t) {
    try {
        if (!hex || typeof hex !== 'string') return '#ffffff';
        const m = hex.trim().match(/^#([0-9a-fA-F]{6})$/);
        if (!m) return hex;
        const n = parseInt(m[1], 16);
        let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        r = Math.round(r + (255 - r) * t);
        g = Math.round(g + (255 - g) * t);
        b = Math.round(b + (255 - b) * t);
        const h = (x) => x.toString(16).padStart(2, '0');
        return `#${h(r)}${h(g)}${h(b)}`;
    } catch (_) {
        return '#ffffff';
    }
}

// Extract url(...) value from a CSS var string
function extractUrl(cssVal) {
    if (!cssVal) return '';
    let url = cssVal.trim();
    if (!url.startsWith('url(')) return '';
    url = url.slice(4, -1).trim();
    if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
        url = url.slice(1, -1);
    }
    return url;
}