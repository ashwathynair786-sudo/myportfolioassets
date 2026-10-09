import re, sys, os
S, BRAND = sys.argv[1], sys.argv[2]
part = open(S+'/logos.part').read()
p1 = open(S+'/p1.svg').read()
letters = re.search(r'id="wm-pendant".*?<path fill="var\(--wm-ink, currentColor\)" d="([^"]+)"', part, re.S).group(1)
tag_d = re.search(r'<symbol id="tagline" viewBox="478 1749 451 70"><path d="([^"]+)"', open(S+'/sym.part').read()).group(1)
AO = [0, 455.45, 784.67]
def bulb(o): return f'M{60.6+o:.1f} 100 A13 13 0 0 0 {86.6+o:.1f} 100Z'
def cone(o): return f'M{60.6+o:.1f} 100 L{86.6+o:.1f} 100 L{139.1+o:.1f} 182.2 L{6.8+o:.1f} 182.2Z'
CX = [73.6+o for o in AO]          # bulb centres
APX = [82.1+o for o in AO]         # apex x
# original Alta A
m = re.search(r'<clipPath id="clip-6">\s*<path clip-rule="nonzero" d="([^"]+)"', p1).group(1)
nums = list(map(float, re.findall(r'-?\d+\.?\d*', m))); cmds = re.findall(r'[MLZ]', m)
def trA(d):
    out=[]; toks=re.findall(r'[A-Za-z]|-?\d+\.?\d*', d); xy=0
    for t in toks:
        if t.isalpha(): out.append(t); xy=0
        else:
            v=float(t); out.append('%.1f'%(v-247.332 if xy%2==0 else v-1537.371)); xy+=1
    return ' '.join(out)
A_ORIG = trA(m)
LAM = 'M81.4 0 L0.3 182.2 L6.8 182.2 L74.2 30.7 L139.1 182.2 L161 182.2 L82.9 0Z'

def lockup(ink, glow, bg=None, lit=False, hung=False, tagline=None, W=1200, H=None, anim=False, classes=False):
    """Return inner SVG markup for a lockup in a W-wide canvas."""
    top = 150 if hung else 40
    H = H or (top + 182 + (110 if tagline else 40))
    ox = (W - 954) / 2
    g = []
    if bg: g.append(f'<rect width="{W}" height="{H}" fill="{bg}"/>')
    if hung:
        g.append(f'<path d="M{ox-40:.0f} {top-110} H{ox+994:.0f}" stroke="{ink}" stroke-width="2" opacity=".55"/>')
    g.append(f'<g transform="translate({ox:.1f} {top})">')
    for i, o in enumerate(AO):
        d = f' style="--d:{i*0.45:.2f}s"' if anim else ''
        cls = ' class="pend"' if anim else (' class="glow"' if classes else '')
        parts = []
        if lit:
            parts.append(f'<circle cx="{CX[i]:.1f}" cy="104" r="78" fill="url(#pHalo)"/>')
            parts.append(f'<path d="{cone(o)}" fill="url(#pCone)"/>')
            parts.append(f'<ellipse cx="{CX[i]:.1f}" cy="190" rx="92" ry="10" fill="url(#pFloor)"/>')
        parts.append(f'<path d="{bulb(o)}" fill="{glow}"/>')
        if hung: g.append(f'<path d="M{APX[i]:.1f} -110 V0" stroke="{ink}" stroke-width="2.4"/>')
        g.append(f'<g{cls}{d}>' + ''.join(parts) + '</g>')
    lcls = ' class="letters"' if anim else ''
    g.append(f'<path{lcls} d="{letters}" fill="{ink}"/>')
    g.append('</g>')
    if tagline:
        tw = 406; tx = (W - tw) / 2; ty = top + 182 + 48
        g.append(f'<svg x="{tx:.1f}" y="{ty}" width="{tw}" height="63" viewBox="478 1749 451 70"><path d="{tag_d}" fill="{tagline}"/></svg>')
    return W, H, '\n'.join(g)

DEFS = '''<defs>
<radialGradient id="pHalo"><stop offset="0" stop-color="#FFA00E" stop-opacity=".55"/><stop offset=".5" stop-color="#FFA00E" stop-opacity=".14"/><stop offset="1" stop-color="#FFA00E" stop-opacity="0"/></radialGradient>
<linearGradient id="pCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFA00E" stop-opacity=".6"/><stop offset="1" stop-color="#FFA00E" stop-opacity="0"/></linearGradient>
<radialGradient id="pFloor"><stop offset="0" stop-color="#FFA00E" stop-opacity=".35"/><stop offset="1" stop-color="#FFA00E" stop-opacity="0"/></radialGradient>
</defs>'''
ANIM_CSS = '''<style>
.pend { animation: pendOn 9s var(--d, 0s) infinite both; }
.letters { animation: lettersOn 9s infinite; }
@keyframes pendOn { 0%, 10% { opacity: 0; } 11% { opacity: 1; } 12.5% { opacity: .15; } 14% { opacity: .9; } 15% { opacity: .1; } 17%, 80% { opacity: 1; } 81%, 100% { opacity: 0; } }
@keyframes lettersOn { 0%, 10% { opacity: .25; } 18%, 80% { opacity: 1; } 86%, 100% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .pend, .letters { animation: none; } }
</style>'''

def svgfile(name, W, H, body, extra=''):
    open(f'{BRAND}/logo/{name}', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{extra}{DEFS}\n{body}\n</svg>\n')

os.makedirs(BRAND+'/logo', exist_ok=True)
INK, WICK, EMBER, NIGHT, DEEP = '#3D3A37', '#F5E5CC', '#CD4604', '#1A1614', '#11100F'
svgfile('antara-wordmark-primary.svg', *lockup(INK, EMBER, W=1034, H=262))
svgfile('antara-wordmark-black.svg', *lockup('#1A1614', '#1A1614', W=1034, H=262))
svgfile('antara-wordmark-white.svg', *lockup('#FFFFFF', '#FFFFFF', W=1034, H=262))
svgfile('antara-wordmark-lit-on-dark.svg', *lockup(WICK, '#FFD27A', bg=DEEP, lit=True, W=1200, H=300))
svgfile('antara-lockup-hanging-lit.svg', *lockup(WICK, '#FFD27A', bg=DEEP, lit=True, hung=True, tagline='#FECA9A', W=1200, H=520))
svgfile('antara-lockup-primary-tagline.svg', *lockup(INK, EMBER, bg='#F4F1EA', tagline='#C88A4A', W=1200, H=380))
W, H, body = lockup(WICK, '#FFD27A', bg=DEEP, lit=True, hung=True, tagline='#FECA9A', W=1200, H=520, anim=True)
svgfile('antara-logo-animated.svg', W, H, body, ANIM_CSS)
# mark
MARK = '<path d="M50 6 V24" stroke="{i}" stroke-width="3"/><path d="M50 22 L16 90 H29 L50 46 L71 90 H84Z" fill="{i}"/>{cone}<path d="M42 66 A8 8 0 0 0 58 66Z" fill="{g}"/>'
open(f'{BRAND}/logo/antara-mark.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">' + MARK.format(i=INK, g=EMBER, cone='') + '</svg>\n')
open(f'{BRAND}/logo/antara-mark-app-icon.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1024" height="1024">' + DEFS + '<rect width="100" height="100" rx="22" fill="#11100F"/><g transform="translate(14 12) scale(.72)">' + MARK.format(i=WICK, g='#FFD27A', cone='<path d="M42 66 H58 L71 90 H29Z" fill="url(#pCone)"/>') + '</g></svg>\n')

# hero markup for the book (animated, toggleable)
W, H, body = lockup(WICK, '#FFD27A', lit=True, hung=True, tagline='#FECA9A', W=1200, H=520, anim=True)
open(S+'/hero.part','w').write(f'<svg class="stage-svg" id="stageSvg" viewBox="0 0 {W} {H}" role="img" aria-label="Antara logo: three pendant A\'s hang from a line and light up one by one, above the line Light from within">{DEFS}\n{body}\n</svg>')

# construction steps (viewBox around one A)
VB = '-20 -70 200 290'
steps = [
 ('The Alta A', f'<path d="{A_ORIG}" fill="#F5E5CC"/>'),
 ('Remove the crossbar', f'<path d="{LAM}" fill="#F5E5CC"/><path d="M40.9 105.6 H106.3 L108.3 110.3 H38.8Z" fill="none" stroke="#CD4604" stroke-width="1.2" stroke-dasharray="4 3"/>'),
 ('Hang a bulb', f'<path d="M82.1 -60 V0" stroke="#F5E5CC" stroke-width="2.4"/><path d="{LAM}" fill="#F5E5CC"/><path d="{bulb(0)}" fill="#CD4604"/>'),
 ('Switch it on', f'<circle cx="73.6" cy="104" r="78" fill="url(#pHalo)"/><path d="{cone(0)}" fill="url(#pCone)"/><ellipse cx="73.6" cy="190" rx="92" ry="10" fill="url(#pFloor)"/><path d="M82.1 -60 V0" stroke="#F5E5CC" stroke-width="2.4"/><path d="{LAM}" fill="#F5E5CC"/><path d="{bulb(0)}" fill="#FFD27A"/>'),
]
html = ''.join(f'<figure class="step"><svg viewBox="{VB}" aria-hidden="true">{s}</svg><figcaption><span>{i+1}</span>{t}</figcaption></figure>' for i,(t,s) in enumerate(steps))
open(S+'/steps.part','w').write(html)
print('done')
