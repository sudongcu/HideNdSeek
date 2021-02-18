from configparser import ConfigParser
import requests
import json
import random

class game:

    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.count = row * col

    def setGame(self):        
        self.boxes_data = []
        for i in range(self.count):
            self.boxes_data.append(i)
    
        p = player(self.count)
        p.setPlayers()
        
        self.setMap(p)
        self.hider = random.choice(p.players_data)
        self.hidespot = []
        
        isnothidespotempty = False
        for r in range(self.row):
            for c in range(self.col):
                if self.hider == self.game_map[r][c]:
                    self.hidespot.append(r)
                    self.hidespot.append(c)
                    isnothidespotempty = True
                    break
            if isnothidespotempty:
                break
        
        self.setGameKey(self.hider, self.hidespot[0], self.hidespot[1])

    def setMap(self, p):        
        self.game_map = []
        
        idx = 0        
        for r in range(self.row):
            self.game_map.append([])
            for c in range(self.col):
                self.game_map[r].append(p.players_data[idx])
                idx = idx + 1

    def setGameKey(self, hider, row, col):
        self.gameKey = f'{hider}:{str(row)}:{str(col)}'


class player:
    
    def __init__(self, count):
        config = ConfigParser()
        config.read('./config/config.ini')
        self.URL = config.get('game', 'url')
        self.count = count

    def setPlayers(self):
        if type(self.count) is int:
            if self.count > 0:
                response = requests.get(f'{self.URL}/{str(self.count)}')
                self.players_data = json.loads(response.text)

                while(self.checkDuplicatePlayer()):
                    self.removeDuplicatePlayer()
                    self.addNewPlayer()

    def checkDuplicatePlayer(self):
        return len(list(set(self.players_data))) < self.count

    def removeDuplicatePlayer(self):
        self.players_data = list(set(self.players_data))

    def addNewPlayer(self):
        response = requests.get(f'{self.URL}/{str(self.count - len(list(set(self.players_data))))}')
        new_data = json.loads(response.text)
        self.players_data = self.players_data + new_data


class seeker:

    def __init__(self):
        self.message = ''
        pass

    def trySeek(self, row, col, gameKey):
        gameKeyList = gameKey.split(':')   # gameKey = hider:row:col
        hider = gameKeyList[0]
        rowdistance = int(gameKeyList[1]) - row 
        coldistance = int(gameKeyList[2]) - col
        
        if rowdistance == 0 and coldistance == 0:
            self.message = f"You sought '{hider}'."
            return True
        else:
            self.message = f'Row: {self.rowMessage(rowdistance, row)}\rCol: {self.colMessage(coldistance, col)}'
            return False

    def rowMessage(self, distance, row):
        if abs(distance) > (row / 3) * 3:
            return 'far'
        elif abs(distance) > (row / 3) * 2:
            return 'little far'
        elif abs(distance) > (row / 3):
            return 'closed'
        else:
            return 'very closed'
        
    def colMessage(self, distance, col):
        if abs(distance) > (col / 3) * 3:
            return 'far'
        elif abs(distance) > (col / 3) * 2:
            return 'little far'
        elif abs(distance) > (col / 3):
            return 'closed'
        else:
            return 'very closed'
