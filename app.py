from flask import Flask, render_template, jsonify, request
from playgame import game

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

    data = {'map':g.game_map, 'hider':g.hider}
    return jsonify(data)

# @app.route('/seek')
# def seek():
    
#     return  jsonify('')

if __name__ == '__main__':
    app.run(debug=True)
