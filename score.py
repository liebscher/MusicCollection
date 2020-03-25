import numpy as np
from bson.json_util import dumps, loads
from pymongo import MongoClient
client = MongoClient('localhost', 27018)
db = client['musicCollectionDB']
collection = db['collection']
comparisons = db['comparisons']

# print(list(comparisons.find())[:5])

comps = loads(dumps(list(comparisons.find())))
comps = [(comp['timestamp'], comp['cat'], comp['sid1'], comp['sid2']) for comp in comps]


c = loads(dumps(list(collection.find())))
sids = {album['sid']: i for i, album in enumerate(c)}
sids_inv = {sids[k]: k for k in sids}
names = {album['sid']: album['album'] for album in c}

A = np.ones((len(sids), len(sids)))

# t = ['A', 'B', 'C', 'D', 'E']
#
# r = [(0, 4), (0, 4), (0, 4), (0, 4),
#      (1, 0), (1, 0), (1, 0), (1, 0), (1, 0),
#      (1, 2),
#      (1, 4), (1, 4), (1, 4), (1, 4),
#      (2, 0),
#      (2, 4), (2, 4), (2, 4), (2, 4),
#      (3, 0), (3, 0), (3, 0), (3, 0), (3, 0), (3, 0), (3, 0), (3, 0),
#      (3, 4), (3, 4), (3, 4), (3, 4),]

print(len(comps))

for comp in comps:
    A[sids[comp[2]], sids[comp[3]]] += 1

A = A / A.T

w, v = np.linalg.eig(A)

# w = (np.real(v) / np.real(v).sum(axis=1)).sum(axis=1)

v = np.real(v).sum(axis=1)

v = (v - v.min()) / (v.max() - v.min())

rank = np.argsort(v)[::-1]

# print([sids_inv[k] for k in rank[:3]])
print([[names[sids_inv[k]], v[k].round(2)] for k in rank[:3]])




exit()

CATEGORIES = [
  'art', 'critic', 'cohesive', 'depth', 'dynamics', 'flow', 'friend', 'hold', 'longevity', 'lyrics',
  'structure', 'voice'
]

comps = loads(dumps(list(comparisons.find())))
comps = [(comp['timestamp'], comp['cat'], comp['sid1'], comp['sid2']) for comp in comps]

sids = {album['sid']: i for i, album in enumerate(loads(dumps(list(collection.find()))))}

n = len(sids)
mat = np.zeros((len(CATEGORIES), n, n))

for i, cat in enumerate(CATEGORIES):

    d = list(filter(lambda x: x[1] == cat, comps))

    for c in d:
        mat[0, sids[c[2]], sids[c[3]]] += 1

matx = np.zeros((len(CATEGORIES), n, n))

for e in range(len(CATEGORIES)):
    for i in range(n):
        for j in range(n):
            matx[e, i, j] = mat[e, i, j] / (mat[e, i, j] + mat[e, j, i] + 1e-7)

print(matx[0, :16, :16].round(2))