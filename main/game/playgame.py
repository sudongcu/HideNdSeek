from configparser import ConfigParser
from main.security.crypto import AESCrypto
from main.data.staticplayers import StaticPlayers
import requests
import json
import random
import math

class Game:

    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.count = row * col

    def setGame(self):
        self.boxes_data = []
        for i in range(self.count):
            self.boxes_data.append(i)
    
        p = Player(self.count)
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
            colcnt = 0
            while(self.col > colcnt):
                self.game_map[r].append(p.players_data[idx])
                idx = idx + 1
                colcnt = colcnt + 1

    def setGameKey(self, hider, row, col):
        keyData = f'{hider}:{str(row)}:{str(col)}'
        aes = AESCrypto()
        encData = aes.Encrypt(keyData)
        self.gameKey = [encData[0], encData[1], encData[2]]

class Player:
    
    def __init__(self, count):
        config = ConfigParser()
        config.read('./config/config.ini')
        self.URL = config.get('game', 'url')
        self.count = count

    def setPlayers(self):
        if type(self.count) is int:
            if self.count > 0:
                response = requests.get(f'{self.URL}/{str(self.count)}')
                
                if response.status_code == 200:
                    self.players_data = json.loads(response.text)
                else:
                    self.players_data = StaticPlayers().getPlayers(self.count)

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


class Seeker:

    def __init__(self):
        self.message = ''
        pass

    def trySeek(self, row, col, map_row, map_col, game_key):
        aes = AESCrypto()
        key_data = aes.Decrypt(game_key[0], game_key[1], game_key[2])

        key_datas = key_data.split(':')   # gameKey = hider:row:col
        hider = key_datas[0]
        hider_row = int(key_datas[1])
        hider_col = int(key_datas[2])
        
        distance = math.sqrt((row - hider_row) ** 2 + (col - hider_col) ** 2)

        if distance == 0:
            self.message = f"'{hider}'를 찾았다!!!"
            return True
        else:
            self.message = self.distanceMessage(distance, map_row, map_col)
            return False

    def distanceMessage(self, distance, map_row, map_col):
        if distance >= math.sqrt((map_row / 3) ** 2 + (map_col / 3) ** 2):
            return '어디까지 가는거야?'
        elif distance >= math.sqrt((map_row / 6) ** 2 + (map_col / 6) ** 2):
            return '나쁘지않아.'
        else:
            return '가까이있어.'
