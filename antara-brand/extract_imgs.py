import sys
from PIL import Image, ImageFilter, ImageChops
raw, out = sys.argv[1], sys.argv[2]
P = {'fringe':5,'lantern':7,'linea':13,'hourglass':15,'pebble':21,'cloud':23,'silkbell':25,'orb':27,'column':45,'canedrum':51,'canecone':71,'sconce':83}
def page(n): return Image.open(f'{raw}/pg-{n-1:03d}.jpg').convert('RGB')
for k,n in P.items():
    im = page(n)
    reg = im.crop((560,0,1225,875))
    r,g,b = [c.point(lambda v:v) for c in reg.split()]
    mx = ImageChops.lighter(ImageChops.lighter(r,g),b); mn = ImageChops.darker(ImageChops.darker(r,g),b)
    sat = ImageChops.subtract(mx,mn)
    bg = Image.eval(mn, lambda v:255 if v>200 else 0)
    lowsat = Image.eval(sat, lambda v:255 if v<20 else 0)
    bgm = ImageChops.multiply(bg, lowsat)
    alpha = ImageChops.invert(bgm).filter(ImageFilter.MedianFilter(3))
    bbox = alpha.getbbox()
    rgba = reg.copy(); rgba.putalpha(alpha.filter(ImageFilter.GaussianBlur(0.8)))
    rgba = rgba.crop(bbox)
    rgba.thumbnail((640,820))
    rgba.save(f'{out}/p-{k}.webp', quality=82, method=6)
    page(n).crop((443,905,785,1267)).resize((300,318)).save(f'{out}/m-{k}.webp', quality=78)
    page(n-1).resize((800,1130)).save(f'{out}/r-{k}.webp', quality=74)
    print(k, bbox, rgba.size)
