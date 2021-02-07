from playgame import game
from playgame import player
import random

col = 20
row = 10

tablecount = col * row
playercount = col * row

g = game(col, row)
# g.setGame()

p = player(playercount)
p.setPlayers()


print('----------------------------tables------------------------------')
# print(g.boxes_data)

print('----------------------------players------------------------------')
print(p.players_data)

table = []

players = 0
for c in range(col):
    table.append([])
    for r in range(row):
        # print(players)
        table[c].append(p.players_data[players])
        players = players + 1


print('----------------------------tablemap------------------------------')
print(table)

print('----------------------------------------------------------------------')
hider = random.choice(p.players_data)
print(f'hider: {hider}')


clickspot = [1,3]
clicker = table[clickspot[0]][clickspot[1]]
print(f'clicker: {clicker}')

hiderspot = []

for c in range(col):
    for r in range(row):
        if hider == table[c][r]:
            hiderspot.append(c)
            hiderspot.append(r)
            break

print('----------------------------------------------------------------------')
print('----------------------------clicker spot------------------------------')
print(clickspot)
print('----------------------------hider spot------------------------------')
print(hiderspot)
print('----------------------------------------------------------------------')


coldistance = clickspot[0] - hiderspot[0] 
rowdistance = clickspot[1] - hiderspot[1]

print(f'col: {coldistance}/ row: {rowdistance}')

if abs(coldistance) > (col / 3) + (col / 3) + (col / 3):
    print('far')
elif abs(coldistance) > (col / 3) + (col / 3):
    print('little far')
elif abs(coldistance) > (col / 3):
    print('close')
else:
    print('super close')

if abs(rowdistance) > (row / 3) + (row / 3) + (row / 3):
    print('far')
elif abs(rowdistance) > (row / 3) + (row / 3):
    print('little far')
elif abs(rowdistance) > (row / 3):
    print('close')
else:
    print('super close')
    