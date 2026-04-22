# -*- coding: utf-8 -*-
"""Build index.html from extralum-catalogos-raw.html slices."""
import pathlib
import re

root = pathlib.Path(__file__).parent
s = root.joinpath("extralum-catalogos-raw.html").read_text(encoding="utf-8", errors="replace")

head_end = s.find("</head>") + len("</head>")
body_start = s.find("<body")
header_start = s.find('<header class="fusion-header-wrapper">')
header_end = s.find("</header>") + len("</header>")
main_open = s.find('<main id="main"')
section_open = s.find('<section id="content"', main_open)
post_open = s.find('<div id="post-3827"', section_open)
footer_big_start = s.find(
    '<div class="fusion-fullwidth fullwidth-box fusion-builder-row-8 hundred-percent-fullwidth non-hundred-percent-height-scrolling"'
)
main_close = s.find("</main> <!-- #main -->", footer_big_start)
if main_close < 0:
    main_close = s.find("</main>", footer_big_start)
fusion_footer_start = s.find('<div class="fusion-footer">')
boxed_end = s.find('</div> <!-- #boxed-wrapper -->') + len('</div> <!-- #boxed-wrapper -->')
to_top_start = s.find('<section class="to-top-container')
body_end = s.rfind("</body>")

head = s[:head_end]
head = head.replace(
    "<head>",
    "<head><!-- Portada estática: CSS/JS desde www.extralum.com (Avada). Requiere conexión. -->\n",
    1,
)
head = re.sub(r"<title>[^<]*</title>", "<title>Extralum</title>", head, count=1)
head = re.sub(
    r'<link rel="canonical" href="[^"]*" />',
    '<link rel="canonical" href="https://www.extralum.com/" />',
    head,
    count=1,
)

# Portada: vídeo a ancho completo entre cabecera y bloque de contactos (debajo en el DOM).
HERO_STYLE = """<style id="extralum-portada-video">
#contenido-principal.extralum-hero-video {
  box-sizing: border-box;
  position: relative;
  width: 100vw;
  max-width: 100vw !important;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  min-height: calc(100svh - 92px);
}
#contenido-principal.extralum-hero-video .extralum-hero-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}
#contenido-principal.extralum-hero-video video,
#contenido-principal.extralum-hero-video .extralum-hero-still {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
#contenido-principal.extralum-hero-video video {
  z-index: 1;
  transition: opacity 0.45s ease;
}
#contenido-principal.extralum-hero-video video.extralum-hero-video--hidden {
  opacity: 0;
  pointer-events: none;
}
#contenido-principal.extralum-hero-video .extralum-hero-still {
  z-index: 2;
  opacity: 0;
  transition: opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  transform: scale(1);
  will-change: opacity, transform;
}
#contenido-principal.extralum-hero-video .extralum-hero-still--visible {
  opacity: 1;
}
#contenido-principal.extralum-hero-video .extralum-hero-still--kenburns {
  animation: extralumKenBurnsIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes extralumKenBurnsIn {
  from {
    transform: scale(1.02);
  }
  to {
    transform: scale(1);
  }
}
#contenido-principal.extralum-hero-video .extralum-hero-still-a {
  z-index: 2;
}
#contenido-principal.extralum-hero-video .extralum-hero-still-b {
  z-index: 3;
}
#contenido-principal.extralum-hero-video .extralum-hero-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  padding: 16px 12px 20px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.65s ease, visibility 0.65s ease;
}
#contenido-principal.extralum-hero-video .extralum-hero-bar.extralum-hero-bar--visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
#contenido-principal.extralum-hero-video .extralum-hero-bar button {
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: rgba(12, 70, 132, 0.55);
  color: #fff;
  backdrop-filter: blur(4px);
}
#contenido-principal.extralum-hero-video .extralum-hero-bar button:hover {
  background: rgba(12, 70, 132, 0.75);
}
#contenido-principal.extralum-hero-video .extralum-hero-bar button.is-active {
  background: rgba(160, 206, 78, 0.95);
  color: #1a1a1a;
  border-color: transparent;
}
@media (prefers-reduced-motion: reduce) {
  #contenido-principal.extralum-hero-video video,
  #contenido-principal.extralum-hero-video .extralum-hero-still,
  #contenido-principal.extralum-hero-video .extralum-hero-bar {
    transition: none;
  }
  #contenido-principal.extralum-hero-video .extralum-hero-still--kenburns {
    animation: none;
  }
}
</style>"""
head = head.replace("</head>", HERO_STYLE + "</head>", 1)

body_prefix = s[body_start:header_start]
header_html = s[header_start:header_end]

main_and_row = s[main_open:section_open]
section_to_post = s[section_open:post_open]

post_classes = re.search(
    r'<div id="post-3827"\s+class="([^"]*)"',
    s[post_open : post_open + 200],
)
post_class_str = post_classes.group(1) if post_classes else "page type-page status-publish hentry"
HERO_SCRIPT = '<script src="assets/portada-hero.js" defer></script>'

post_inner = (
    f'<div id="post-portada" class="{post_class_str}">'
    '<span class="entry-title rich-snippet-hidden">Extralum</span>'
    '<div id="contenido-principal" class="post-content extralum-hero-video">'
    '<div class="extralum-hero-media">'
    '<video id="extralum-hero-video" src="assets/VID_EXTRALUM_360.mp4" '
    'autoplay muted playsinline preload="metadata" aria-label="Vídeo Extralum"></video>'
    '<img class="extralum-hero-still extralum-hero-still-a" alt="" decoding="async" hidden />'
    '<img class="extralum-hero-still extralum-hero-still-b" alt="" decoding="async" hidden />'
    '<div class="extralum-hero-bar" role="group" aria-label="Acabados">'
    '<button type="button" data-finish="champana">Champaña</button>'
    '<button type="button" data-finish="natural">Natural</button>'
    '<button type="button" data-finish="negra">Negra</button>'
    '<button type="button" data-finish="nogal">Nogal</button>'
    "</div>"
    "</div>"
    f"{HERO_SCRIPT}"
    "</div>"
    "</div>"
)

big_footer = s[footer_big_start:main_close]
main_close_tag = s[main_close : main_close + len("</main> <!-- #main -->")]
if not main_close_tag.startswith("</main>"):
    main_close_tag = "</main> <!-- #main -->"

fusion_and_boxed = s[fusion_footer_start:boxed_end]
scripts_block = s[boxed_end:to_top_start]
to_top_to_body_end = s[to_top_start:body_end]

out = "".join(
    [
        head,
        body_prefix,
        header_html,
        main_and_row,
        section_to_post,
        post_inner,
        big_footer,
        main_close_tag,
        fusion_and_boxed,
        scripts_block,
        to_top_to_body_end,
        "\n</body></html>",
    ]
)

out_path = root / "index.html"
out_path.write_text(out, encoding="utf-8")
print("Wrote", out_path, "length", len(out))
