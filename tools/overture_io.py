"""HTTP range-olvasás Parquet-fájlokhoz (Overture Maps, AWS Open Data) pyarrow-val, letöltés nélkül."""
import io, threading, requests
import pyarrow.parquet as pq

BASE = 'https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com/'
_s = threading.local()


def sess():
    if not hasattr(_s, 'v'):
        _s.v = requests.Session()
    return _s.v


class RangeFile(io.RawIOBase):
    """Csak olvasható, kereshető fájl HTTP Range kérésekkel, 4 MB-os blokkgyorsítótárral."""
    BLK = 4 << 20

    def __init__(self, url, size=None):
        self.url, self.pos = url, 0
        self.size = size or int(sess().head(url, timeout=60).headers['Content-Length'])
        self.cache = {}

    def readable(self): return True
    def seekable(self): return True
    def tell(self): return self.pos

    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else self.pos + off if whence == 1 else self.size + off
        return self.pos

    def _blk(self, i):
        if i not in self.cache:
            a, b = i * self.BLK, min(self.size, (i + 1) * self.BLK) - 1
            for k in range(5):
                try:
                    r = sess().get(self.url, headers={'Range': f'bytes={a}-{b}'}, timeout=120); r.raise_for_status()
                    break
                except Exception:
                    if k == 4: raise
            self.cache[i] = r.content
            if len(self.cache) > 64: self.cache.pop(next(iter(self.cache)))
        return self.cache[i]

    def read(self, n=-1):
        if n < 0: n = self.size - self.pos
        n = max(0, min(n, self.size - self.pos)); out = bytearray()
        while n > 0:
            i, o = divmod(self.pos, self.BLK); d = self._blk(i)[o:o + n]
            out += d; self.pos += len(d); n -= len(d)
        return bytes(out)

    def readinto(self, b):
        d = self.read(len(b)); b[:len(d)] = d; return len(d)


def list_keys(prefix):
    import re
    keys, token = [], None
    while True:
        u = BASE + '?list-type=2&prefix=' + prefix + (('&continuation-token=' + requests.utils.quote(token)) if token else '')
        x = sess().get(u, timeout=60).text
        keys += [(k, int(s)) for k, s in re.findall(r'<Key>([^<]+)</Key>.*?<Size>(\d+)</Size>', x)]
        m = re.search(r'<NextContinuationToken>([^<]+)</NextContinuationToken>', x)
        if not m: return keys
        token = m.group(1)


def open_parquet(key, size):
    return pq.ParquetFile(RangeFile(BASE + key, size))


def rowgroup_bbox(pf, i):
    """A sorcsoport bbox-statisztikája (xmin, ymin, xmax, ymax), ha van."""
    md = pf.metadata.row_group(i); st = {}
    for c in range(md.num_columns):
        col = md.column(c); p = col.path_in_schema
        if p in ('bbox.xmin', 'bbox.ymin', 'bbox.xmax', 'bbox.ymax') and col.statistics is not None and col.statistics.has_min_max:
            st[p] = (col.statistics.min, col.statistics.max)
    if len(st) < 4: return None
    return st['bbox.xmin'][0], st['bbox.ymin'][0], st['bbox.xmax'][1], st['bbox.ymax'][1]
