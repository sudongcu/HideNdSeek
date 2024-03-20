from flask import Flask, render_template, jsonify, request
from urllib import parse

from main.game.playgame import Game, Seeker


app = Flask(__name__)

@app.route('/')
@app.route('/main')
def main():
    return render_template('main.html')

@app.route('/start')
def start():
    row = int(request.args['row'])
    col = int(request.args['col'])

    g = Game(row, col)  
    g.setGame()

    data = {'map': g.game_map, 'hider': g.hider, 'gameKey': { 'key':g.gameKey[0], 'tag': g.gameKey[1], 'nonce':g.gameKey[2] } }
    return jsonify(data)

@app.route('/seek', methods = ['POST'])
def seek():
    data = request.get_json()
    
    row = data['row']
    col = data['col']
    mapRow = data['mapRow']
    mapCol = data['mapCol']
    tempKey = data['gameKey']
    gameKey = [parse.unquote(tempKey['key']), parse.unquote(tempKey['tag']), parse.unquote(tempKey['nonce'])]

    s = Seeker()
    code = '0' if s.trySeek(row, col, int(mapRow), int(mapCol), gameKey) else '1'
    message = s.message
    
    data = {'code':code, 'message':message}
    return  jsonify(data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
