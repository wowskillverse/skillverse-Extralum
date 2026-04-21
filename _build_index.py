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
#contenido-principal.extralum-hero-video video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
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
post_inner = (
    f'<div id="post-portada" class="{post_class_str}">'
    '<span class="entry-title rich-snippet-hidden">Extralum</span>'
    '<div id="contenido-principal" class="post-content extralum-hero-video">'
    '<video src="assets/VID_EXTRALUM_360.mp4" autoplay muted loop playsinline '
    'preload="metadata" aria-label="Vídeo Extralum"></video>'
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
