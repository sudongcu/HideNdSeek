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
        self.count = count

        self.config = ConfigParser()
        self.config.read('./config/config.ini')
        self.URL = self.config.get('game', 'url')

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
        self.gameKeyList = gameKey.split(':')   # gameKey = hider:row:col        
        self.hider = self.gameKeyList[0]
        self.rowdistance = int(self.gameKeyList[1]) - row 
        self.coldistance = int(self.gameKeyList[2]) - col
        
        if self.rowdistance == 0 and self.coldistance == 0:
            print('You sought hider!')
            self.message = 'You sought hider!'
            return True
        else:
            self.message = f'row: {self.RowMessage(self.rowdistance, row)}, col: {self.ColMessage(self.coldistance, col)}'
            return False

    def RowMessage(self, distance, row):
        if abs(distance) > (row / 3) * 3:
            print('row: far')
            return 'far'
        elif abs(distance) > (row / 3) * 2:
            print('row: little far')
            return 'little far'
        elif abs(distance) > (row / 3):
            print('row: closed')
            return 'closed'
        else:
            print('row: very closed')
            return 'very closed'
        
    def ColMessage(self, distance, col):
        if abs(distance) > (col / 3) * 3:
            print('col: far')
            return 'far'
        elif abs(distance) > (col / 3) * 2:
            print('col: little far')
            return 'little far'
        elif abs(distance) > (col / 3):
            print('col: closed')
            return 'closed'
        else:
            print('col: veru closed')
            return 'veru closed'
