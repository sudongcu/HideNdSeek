from playgame import game
from playgame import seeker

col = 10
row = 10

g = game(col, row)
g.setGame()

s = seeker()

count = 0
hiderSeeked = False
for c in range(col):
    for r in range(row):
        print('----------------------------tryseek----------------------------')
        count = count + 1
        if s.trySeek(c, r, g):
            hiderSeeked = True
            break
    
    if hiderSeeked:
        break
        
print(f'total try count: {count}')