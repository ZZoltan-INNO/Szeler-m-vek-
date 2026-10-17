"""Radiance .hdr (RLE RGBE) -> RGBA PNG, a nyers RGBE bájtokkal (A = közös kitevő).
Az artifact nem szolgál ki .hdr-t; a realview.js ezt RGBEEncoding textúraként olvassa."""
import sys
import numpy as np
from PIL import Image


def read_hdr(path):
    data = open(path, 'rb').read()
    pos = 0
    while True:                                   # fejléc: üres sorig
        end = data.index(b'\n', pos); line = data[pos:end]; pos = end + 1
        if line == b'':
            break
    end = data.index(b'\n', pos); res = data[pos:end].split(); pos = end + 1
    assert res[0] == b'-Y' and res[2] == b'+X', res
    h, w = int(res[1]), int(res[3])
    out = np.zeros((h, w, 4), np.uint8)
    for y in range(h):
        if data[pos] == 2 and data[pos + 1] == 2 and (data[pos + 2] << 8 | data[pos + 3]) == w:
            pos += 4
            for c in range(4):
                x = 0
                while x < w:
                    n = data[pos]; pos += 1
                    if n > 128:
                        n -= 128; out[y, x:x + n, c] = data[pos]; pos += 1
                    else:
                        out[y, x:x + n, c] = np.frombuffer(data, np.uint8, n, pos); pos += n
                    x += n
        else:                                     # régi, tömörítetlen sor
            out[y] = np.frombuffer(data, np.uint8, w * 4, pos).reshape(w, 4); pos += w * 4
    return out


if __name__ == '__main__':
    rgbe = read_hdr(sys.argv[1])
    Image.fromarray(rgbe, 'RGBA').save(sys.argv[2], optimize=True)
    print(rgbe.shape, 'max exp', rgbe[..., 3].max())
