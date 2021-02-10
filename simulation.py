from playgame import game
from playgame import player
from playgame import seeker

row = 2
col = 5

g = game(row, col)
g.setGame()

print(g.game_map)
print(g.hidespot)


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