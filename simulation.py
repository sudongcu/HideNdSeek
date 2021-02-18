from playgame import game
from playgame import player
from playgame import seeker
from urllib import parse

row = 2
col = 5

g = game(row, col)
g.setGame()

print(g.game_map)
print(g.hidespot)
print(g.gameKey)

data = {'map':g.game_map, 'hider':g.hider, 'gameKey':g.gameKey}
print(data)



# s = seeker()

# count = 0
# hiderSeeked = False
# for c in range(col):
#     for r in range(row):
#         print('----------------------------tryseek----------------------------')
#         count = count + 1
#         if s.trySeek(c, r, g):
#             hiderSeeked = True
#             break
    
#     if hiderSeeked:
#         break
        
# print(f'total try count: {count}')