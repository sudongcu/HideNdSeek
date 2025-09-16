from main.security.crypto import AESCrypto
import random
import math

class Game:

    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.count = row * col
        self.game_map = []
        self.hider = None
        self.hidespot = None
        self.gameKey = None
        self.monster_spot = None
        self.monster_img = None

    def setGame(self):
        # Build a simple placeholder map; values aren't used by the UI except for sizing
        self.game_map = [[0 for _ in range(self.col)] for _ in range(self.row)]

    def setGameKey(self, hider, row, col):
        keyData = f'{hider}:{str(row)}:{str(col)}'
        aes = AESCrypto()
        encData = aes.Encrypt(keyData)
        self.gameKey = [encData[0], encData[1], encData[2]]

    def assignHiderFarFrom(self, click_row, click_col):
        R, C = self.row, self.col
        # 1) 최대 거리 계산
        max_dist = -1.0
        for r in range(R):
            for c in range(C):
                d = math.hypot(r - click_row, c - click_col)
                if d > max_dist:
                    max_dist = d

        # 2) 최장거리의 90% 이상인 셀을 후보로 수집 (클릭 지점 제외)
        ratio = 0.90
        threshold = max_dist * ratio
        candidates = []  # (d, r, c)
        for r in range(R):
            for c in range(C):
                if r == click_row and c == click_col:
                    continue
                d = math.hypot(r - click_row, c - click_col)
                if d >= threshold:
                    candidates.append((d, r, c))

        # 3) 에지/코너 회피 우선순위 + 거리 가중치 랜덤 선택
        def is_corner(rr, cc):
            return (rr in (0, R - 1)) and (cc in (0, C - 1))
        def is_edge(rr, cc):
            return rr in (0, R - 1) or cc in (0, C - 1)

        margin = 1 if R >= 5 and C >= 5 else 0
        interior = []
        if margin > 0:
            for (d, rr, cc) in candidates:
                if margin <= rr <= R - 1 - margin and margin <= cc <= C - 1 - margin:
                    interior.append((d, rr, cc))

        pools = [interior,
                 [(d, rr, cc) for (d, rr, cc) in candidates if not is_edge(rr, cc)],
                 [(d, rr, cc) for (d, rr, cc) in candidates if not is_corner(rr, cc)],
                 candidates]

        chosen = None
        for pool in pools:
            if pool:
                weights = [max(1e-6, d - threshold + 1e-6) for (d, _, _) in pool]
                try:
                    chosen = random.choices(pool, weights=weights, k=1)[0]
                except Exception:
                    chosen = random.choice(pool)
                break

        if chosen is None:
            # 폴백: 최장거리 셀 선택
            best = -1.0
            target_r, target_c = 0, 0
            for r in range(R):
                for c in range(C):
                    d = math.hypot(r - click_row, c - click_col)
                    if d > best:
                        best = d
                        target_r, target_c = r, c
        else:
            target_r, target_c = chosen[1], chosen[2]

        self.hidespot = [target_r, target_c]
        self.hider = '💎'  # 보석
        self.setGameKey(self.hider, target_r, target_c)
        # Place a monster near the gem (Manhattan distance 1-2)
        self._placeMonsterNear(target_r, target_c)

    def _placeMonsterNear(self, gem_r, gem_c):
        R, C = self.row, self.col
        cand = []
        for r in range(max(0, gem_r - 2), min(R, gem_r + 3)):
            for c in range(max(0, gem_c - 2), min(C, gem_c + 3)):
                if r == gem_r and c == gem_c:
                    continue
                md = abs(r - gem_r) + abs(c - gem_c)
                if 1 <= md <= 2:
                    cand.append((r, c))
        if cand:
            self.monster_spot = random.choice(cand)
        else:
            # fallback: any adjacent within bounds
            adj = [(gem_r-1, gem_c),(gem_r+1, gem_c),(gem_r, gem_c-1),(gem_r, gem_c+1)]
            adj = [(r,c) for (r,c) in adj if 0 <= r < R and 0 <= c < C and not (r==gem_r and c==gem_c)]
            self.monster_spot = random.choice(adj) if adj else [gem_r, gem_c]

# Player class removed; gem mode doesn't need named players


class Seeker:

    def __init__(self):
        self.message = ''
        self.distance = None
        self.steps = None
        pass

    def trySeek(self, row, col, map_row, map_col, game_key):
        aes = AESCrypto()
        key_data = aes.Decrypt(game_key[0], game_key[1], game_key[2])

        key_datas = key_data.split(':')   # gameKey = hider:row:col
        hider = key_datas[0]
        hider_row = int(key_datas[1])
        hider_col = int(key_datas[2])
        
        distance = math.sqrt((row - hider_row) ** 2 + (col - hider_col) ** 2)
        steps = abs(row - hider_row) + abs(col - hider_col)
        self.distance = distance
        self.steps = steps

        if distance == 0:
            self.message = "보석을 찾았다!!!"
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
