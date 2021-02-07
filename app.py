from flask import Flask, render_template, jsonify, request
from playgame import game



app = Flask(__name__)

@app.route('/')
@app.route('/main')
def main():
    return render_template('main.html')

@app.route('/start')
def start():
    col = int(request.args['col'])
    row = int(request.args['row'])

    g = game(col, row)
    g.setGame()

    data = {'map':g.game_map, 'hider':g.hider}
    return jsonify(data)



if __name__ == '__main__':
    app.run(debug=True)
