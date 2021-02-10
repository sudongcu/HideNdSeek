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
        
        for r in range(self.row):
            for c in range(self.col):
                if self.hider == self.game_map[r][c]:
                    self.hidespot.append(r)
                    self.hidespot.append(c)
                    break

    def setMap(self, p):        
        self.game_map = []
        
        idx = 0        
        for r in range(self.row):
            self.game_map.append([])
            for c in range(self.col):
                self.game_map[r].append(p.players_data[idx])
                idx = idx + 1


URL = 'http://names.drycodes.com'

class player:
    
    def __init__(self, count):
        self.count = count

    def setPlayers(self):
        
        if type(self.count) is int:
            if self.count > 0:
                response = requests.get(f'{URL}/{str(self.count)}')
                self.players_data = json.loads(response.text)
                
                while(self.checkDuplicatePlayer()):
                    self.removeDuplicatePlayer()
                    self.addNewPlayer()

    def checkDuplicatePlayer(self):
        return len(list(set(self.players_data))) < self.count

    def removeDuplicatePlayer(self):
        self.players_data = list(set(self.players_data))

    def addNewPlayer(self):
        response = requests.get(f'{URL}/{str(self.count - len(list(set(self.players_data))))}')
        new_data = json.loads(response.text)
        self.players_data = self.players_data + new_data


class seeker:

    def __init__(self):
        pass

    def trySeek(self, row, col, g):
        self.tryspot = [row, col]
        self.seekedplayer = g.game_map[self.tryspot[0]][self.tryspot[1]]
        print(f'seeked: {self.seekedplayer}')

        self.rowdistance = self.tryspot[0] - g.hidespot[0] 
        self.coldistance = self.tryspot[1] - g.hidespot[1]
        
        if self.rowdistance == 0 and self.coldistance == 0:
            print(f'seeked hider! hider: {g.hider}') 
            return True
        else:
            if abs(self.rowdistance) > (row / 3) * 3:
                print('row: far')
            elif abs(self.rowdistance) > (row / 3) * 2:
                print('row: little far')
            elif abs(self.rowdistance) > (row / 3):
                print('row: closed')
            else:
                print('row: super closed')

            if abs(self.coldistance) > (col / 3) * 3:
                print('col: far')
            elif abs(self.coldistance) > (col / 3) * 2:
                print('col: little far')
            elif abs(self.coldistance) > (col / 3):
                print('col: closed')
            else:
                print('col: super closed')

            return False
