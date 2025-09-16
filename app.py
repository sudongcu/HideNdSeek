from flask import Flask, render_template, jsonify, request
from urllib import parse

from main.game.playgame import Game, Seeker
import os, random
import uuid


app = Flask(__name__)

# simple in-memory sessions: { game_id: Game }
SESSIONS = {}

@app.route('/')
@app.route('/main')
def main():
    return render_template('main.html')

@app.route('/start')
def start():
    try:
        row = int(request.args['row'])
        col = int(request.args['col'])
    except Exception:
        return jsonify({'error': 'invalid parameters'}), 400


    g = Game(row, col)
    g.setGame()
    game_id = str(uuid.uuid4())
    SESSIONS[game_id] = g

    # choose a random gem image under static/img/gem
    gem_dir = os.path.join(app.root_path, 'static', 'img', 'gem')
    try:
        files = [f for f in os.listdir(gem_dir) if os.path.isfile(os.path.join(gem_dir, f))]
        gem_file = random.choice(files) if files else None
    except Exception:
        gem_file = None
    # choose a random monster image under static/img/monster (optional)
    monster_dir = os.path.join(app.root_path, 'static', 'img', 'monster')
    try:
        mfiles = [f for f in os.listdir(monster_dir) if os.path.isfile(os.path.join(monster_dir, f))]
        monster_file = random.choice(mfiles) if mfiles else None
    except Exception:
        monster_file = None

    data = {
        'gameId': game_id,
        'map': g.game_map,
        'row': row,
        'col': col,
        'gem': f"/static/img/gem/{gem_file}" if gem_file else None,
        'monster': f"/static/img/monster/{monster_file}" if monster_file else None
    }
    return jsonify(data)

@app.route('/seek', methods = ['POST'])
def seek():
    payload = request.get_json()
    if not payload:
        return jsonify({'error': 'invalid body'}), 400

    game_id = payload.get('gameId')
    row = payload.get('row')
    col = payload.get('col')

    if game_id not in SESSIONS:
        return jsonify({'error': 'game not found'}), 404

    g: Game = SESSIONS[game_id]

    # First click: assign hider to farthest point from click
    if g.hider is None or g.hidespot is None or g.gameKey is None:
        g.assignHiderFarFrom(int(row), int(col))
        response = {
            'code': 'assigned',
            'message': '목표가 설정되었어. 탐사를 계속해봐!',
            'gameKey': {'key': g.gameKey[0], 'tag': g.gameKey[1], 'nonce': g.gameKey[2]},
            'hider': g.hider
        }
        return jsonify(response)

    tempKey = payload.get('gameKey')
    if not tempKey:
        # allow using server-side key
        gameKey = g.gameKey
    else:
        gameKey = [parse.unquote(tempKey['key']), parse.unquote(tempKey['tag']), parse.unquote(tempKey['nonce'])]

    s = Seeker()
    code = '0' if s.trySeek(int(row), int(col), int(g.row), int(g.col), gameKey) else '1'
    message = s.message
    # danger: player within 1-2 manhattan steps of monster
    danger = None
    if g.monster_spot is not None:
        try:
            pr, pc = int(row), int(col)
            mr, mc = g.monster_spot[0], g.monster_spot[1]
            md = abs(pr - mr) + abs(pc - mc)
            danger = 0 <= md <= 1
        except Exception:
            danger = None
    monster_pos = g.monster_spot if g.monster_spot is not None else None
    data = {
        'code': code,
        'message': message,
        'distance': s.distance,
        'steps': s.steps,
        'danger': danger,
        'monsterPos': monster_pos
    }
    return  jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
