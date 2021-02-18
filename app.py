from flask import Flask, render_template, jsonify, request
from playgame import game, seeker


app = Flask(__name__)

@app.route('/')
@app.route('/main')
def main():
    return render_template('main.html')

@app.route('/start')
def start():
    row = int(request.args['row'])
    col = int(request.args['col'])

    g = game(row, col)  
    g.setGame()

    data = {'map':g.game_map, 'hider':g.hider, 'gameKey':g.gameKey}
    return jsonify(data)

@app.route('/seek', methods = ['GET', 'POST'])
def seek():
    row = int(request.args['row'])
    col = int(request.args['col'])
    
    #TODO: POST로 값 받기 
    gameKey = request.form['gameKey']
    
    print(gameKey)

    s = seeker()
    code = '0' if s.trySeek(row, col,  gameKey) else '1'
    message = s.message
    
    data = {'code':code, 'message':message}
    return  jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
