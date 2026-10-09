import re, sys, os
S, BRAND = sys.argv[1], sys.argv[2]
part = open(S+'/logos.part').read()
letters = re.search(r'id="wm-pendant".*?<path fill="var\(--wm-ink, currentColor\)" d="([^"]+)"', part, re.S).group(1)
tag_sym = re.search(r'<symbol id="tagline".*?</symbol>', open(S+'/sym.part').read(), re.S).group(0)
tag_d = re.search(r'<path d="([^"]+)"', tag_sym).group(1)
AO = [0, 455.45, 784.67]
bulb = lambda o: f'M{60.6+o:.1f} 100 A13 13 0 0 0 {86.6+o:.1f} 100Z'
BULBS = ' '.join(bulb(o) for o in AO)
LAM = 'M81.4 0 L0.3 182.2 L6.8 182.2 L74.2 30.7 L139.1 182.2 L161 182.2 L82.9 0Z'
CX = [73.6+o for o in AO]
# ---- symbols for the book ----
sym = f'''<symbol id="wm" viewBox="0 0 946 188"><path fill="var(--ink, currentColor)" d="{letters}"/><path fill="var(--bulb, currentColor)" d="{BULBS}"/></symbol>
<symbol id="markA" viewBox="0 0 162 188"><path fill="var(--ink, currentColor)" d="{LAM}"/><path fill="var(--bulb, currentColor)" d="{bulb(0)}"/></symbol>
<symbol id="glyphL" viewBox="0 0 162 188"><path fill="currentColor" d="{LAM}"/></symbol>
{tag_sym}'''
open(S+'/sym2.part','w').write(sym)
# cover logo: unlit bulbs + lit bulbs + halos (only the semicircles glow)
def cover(ink, W=1200, H=300, extra_y=0, cls=True, tagline=None):
    ox, oy = (W-946)/2, (H-188)/2 - (40 if tagline else 0)
    c = ' class="lit"' if cls else ''
    g = [f'<g transform="translate({ox:.1f} {oy:.1f})">',
         f'<g{c}>' + ''.join(f'<circle cx="{x:.1f}" cy="104" r="64" fill="url(#bHalo)"/>' for x in CX) + '</g>',
         f'<path d="{letters}" fill="{ink}"/>',
         f'<path d="{BULBS}" fill="#5E4C3C"/>',
         f'<path{c} d="{BULBS}" fill="#FFD27A"/>', '</g>']
    if tagline:
        tw = 360; g.append(f'<svg x="{(W-tw)/2:.1f}" y="{oy+188+56:.1f}" width="{tw}" height="56" viewBox="478 1749 451 70"><path d="{tag_d}" fill="{tagline}"/></svg>')
    return '\n'.join(g)
DEF = '<defs><radialGradient id="bHalo"><stop offset="0" stop-color="#FFB547" stop-opacity=".6"/><stop offset=".35" stop-color="#FFA00E" stop-opacity=".22"/><stop offset="1" stop-color="#FFA00E" stop-opacity="0"/></radialGradient></defs>'
open(S+'/cover.part','w').write(f'<svg class="cover-svg" id="coverSvg" viewBox="0 0 1200 380" role="img" aria-label="Antara wordmark; the semicircles inside the A\'s light up">{DEF}{cover("#F5E5CC", H=380, tagline="#FECA9A")}</svg>')
# ---- logo pack ----
L = BRAND+'/logo'
for f in os.listdir(L): os.remove(os.path.join(L, f))
def wfile(name, ink, bulbc, bg=None, W=1046, H=288):
    ox, oy = (W-946)/2, (H-188)/2
    bgr = f'<rect width="{W}" height="{H}" fill="{bg}"/>' if bg else ''
    open(f'{L}/{name}','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{bgr}<g transform="translate({ox} {oy})"><path d="{letters}" fill="{ink}"/><path d="{BULBS}" fill="{bulbc}"/></g></svg>\n')
wfile('antara-logo-primary.svg', '#3D3A37', '#CD4604')
wfile('antara-logo-black.svg', '#1A1614', '#1A1614')
wfile('antara-logo-white.svg', '#FFFFFF', '#FFFFFF')
wfile('antara-logo-on-night.svg', '#F5E5CC', '#FFA00E', bg='#1A1614')
wfile('antara-logo-on-ember.svg', '#F4F1EA', '#F4F1EA', bg='#CD4604')
def mfile(name, ink, bulbc, bg=None, size=512):
    pad = 70
    bgr = f'<rect x="-{pad}" y="-{pad-6}" width="{162+2*pad}" height="{162+2*pad}" rx="40" fill="{bg}"/>' if bg else ''
    vb = f'-{pad} -{pad-6} {162+2*pad} {162+2*pad}' if bg else '0 0 162 188'
    open(f'{L}/{name}','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{size}" height="{size}">{bgr}<path d="{LAM}" fill="{ink}"/><path d="{bulb(0)}" fill="{bulbc}"/></svg>\n')
mfile('antara-mark.svg', '#3D3A37', '#CD4604')
mfile('antara-mark-app-icon.svg', '#F5E5CC', '#FFA00E', bg='#1A1614', size=1024)
anim = '''<style>.lit{animation:on 7s infinite both}@keyframes on{0%,16%{opacity:0}17%{opacity:1}18.5%{opacity:.15}20%{opacity:.9}21%{opacity:.1}23%,80%{opacity:1}82%,100%{opacity:0}}@media (prefers-reduced-motion:reduce){.lit{animation:none}}</style>'''
open(f'{L}/antara-logo-animated.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 380" width="1200" height="380">{anim}{DEF}<rect width="1200" height="380" fill="#11100F"/>{cover("#F5E5CC", H=380, tagline="#FECA9A")}</svg>\n')
print('ok')
