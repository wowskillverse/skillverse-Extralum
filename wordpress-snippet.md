# Integración en WordPress

---

## Opción 1 — Bloque HTML en Gutenberg (recomendada para empezar)

### Paso 1: Sube tus archivos

| Archivo | Dónde subirlo |
|---|---|
| `hero.svg` | Media > Biblioteca (copia la URL que te da WP) |
| `styles.css` | Tema hijo: `wp-content/themes/tu-tema-hijo/ep-parallax.css` |
| `parallax.js` | Tema hijo: `wp-content/themes/tu-tema-hijo/ep-parallax.js` |

### Paso 2: Encola CSS y JS desde el tema hijo

En `functions.php` de tu tema hijo añade:

```php
function extralum_parallax_assets() {
    wp_enqueue_style(
        'ep-parallax-style',
        get_stylesheet_directory_uri() . '/ep-parallax.css',
        [],
        '1.0.0'
    );
    wp_enqueue_script(
        'ep-parallax-script',
        get_stylesheet_directory_uri() . '/ep-parallax.js',
        [],
        '1.0.0',
        true   // cargar en el footer
    );
}
add_action( 'wp_enqueue_scripts', 'extralum_parallax_assets' );
```

### Paso 3: Pega este HTML en un bloque "HTML personalizado" de Gutenberg

Reemplaza `TU_URL_SVG` con la URL real que copiaste en el paso 1.

```html
<section class="ep-hero" aria-label="Hero con efecto parallax">
  <div class="ep-scene">
    <img
      class="ep-svg"
      src="TU_URL_SVG"
      alt="Descripción de tu SVG"
      width="800"
      height="600"
    />
  </div>
  <div class="ep-scroll-hint" aria-hidden="true">scroll</div>
</section>
```

> El script `parallax.js` ya fue encolado en el footer por `functions.php`,
> así que NO necesitas añadir `<script>` dentro del bloque.

---

## Opción 2 — Shortcode (mini plugin)

Crea el archivo `wp-content/plugins/ep-parallax/ep-parallax.php`:

```php
<?php
/**
 * Plugin Name: EP Parallax
 * Description: Shortcode [ep_parallax] para hero SVG con parallax.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* ─── Encolar assets ────────────────────────────────────── */
function ep_parallax_enqueue() {
    wp_enqueue_style(
        'ep-parallax-style',
        plugin_dir_url( __FILE__ ) . 'ep-parallax.css',
        [],
        '1.0.0'
    );
    wp_enqueue_script(
        'ep-parallax-script',
        plugin_dir_url( __FILE__ ) . 'ep-parallax.js',
        [],
        '1.0.0',
        true
    );
}
add_action( 'wp_enqueue_scripts', 'ep_parallax_enqueue' );

/* ─── Shortcode ─────────────────────────────────────────── */
function ep_parallax_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'src'   => '',
            'alt'   => 'Hero SVG',
            'width' => '800',
            'height'=> '600',
        ],
        $atts,
        'ep_parallax'
    );

    if ( empty( $atts['src'] ) ) {
        return '<p style="color:red">[ep_parallax] Falta el atributo <code>src</code>.</p>';
    }

    $src    = esc_url( $atts['src'] );
    $alt    = esc_attr( $atts['alt'] );
    $width  = intval( $atts['width'] );
    $height = intval( $atts['height'] );

    ob_start(); ?>
    <section class="ep-hero" aria-label="<?php echo $alt; ?>">
      <div class="ep-scene">
        <img
          class="ep-svg"
          src="<?php echo $src; ?>"
          alt="<?php echo $alt; ?>"
          width="<?php echo $width; ?>"
          height="<?php echo $height; ?>"
        />
      </div>
      <div class="ep-scroll-hint" aria-hidden="true">scroll</div>
    </section>
    <?php
    return ob_get_clean();
}
add_shortcode( 'ep_parallax', 'ep_parallax_shortcode' );
```

También copia `styles.css` → `ep-parallax.css` y `parallax.js` → `ep-parallax.js`
dentro de la carpeta del plugin.

### Uso del shortcode en cualquier página/post:

```
[ep_parallax src="https://tudominio.com/wp-content/uploads/hero.svg" alt="Mi ilustración" width="800" height="600"]
```

---

## Demo adicional — fondo SVG constante con scroll del body

Si quieres replicar el segundo ejemplo (`scroll-background.html`):

1. Copia también `parallax-scroll-body.js` a tu tema/plugin.
2. Encola ese script (además del CSS).
3. Usa este markup (bloque HTML o dentro de shortcode):

```html
<div class="ep-fixed-bg-wrap" aria-hidden="true">
  <img class="ep-fixed-bg" src="TU_URL_SVG" alt="" width="800" height="600" />
</div>

<main class="ep-scroll-body">
  <section class="ep-scroll-step"><article class="ep-scroll-card"><h2>Sección 1</h2><p>Contenido...</p></article></section>
  <section class="ep-scroll-step"><article class="ep-scroll-card"><h2>Sección 2</h2><p>Contenido...</p></article></section>
  <section class="ep-scroll-step"><article class="ep-scroll-card"><h2>Sección 3</h2><p>Contenido...</p></article></section>
</main>
```

Script para `functions.php` (tema hijo):

```php
wp_enqueue_script(
    'ep-parallax-body-scroll',
    get_stylesheet_directory_uri() . '/parallax-scroll-body.js',
    [],
    '1.0.0',
    true
);
```

Este modo calcula el progreso global del documento (`scrollTop / scrollMax`),
así que el efecto termina exactamente al final del `body`.

---

## Notas de compatibilidad

- El script usa `(function() { ... })()` (IIFE) para no contaminar el scope global de WP.
- Usa `window.epParallaxDestroy()` si necesitas destruirlo en navegación SPA (Elementor, etc.).
- El SVG debe tener `Access-Control-Allow-Origin: *` si se sirve desde CDN externo,
  porque el script hace `fetch()` para convertirlo a inline.
  Los SVGs subidos a la propia instancia de WP no tienen este problema.
- Compatible con WordPress 6.x y Gutenberg (FSE).

---

## Personalizar intensidad

En el SVG, edita los atributos de cada capa `<g>`:

| Atributo | Valor recomendado | Efecto |
|---|---|---|
| `data-parallax-mouse` | `0.01` – `0.15` | Cuánto se mueve al mover el mouse |
| `data-parallax-scroll` | `10` – `150` | Píxeles de desplazamiento máximo al hacer scroll |

Capas con valor **mayor** parecen más **cerca** (primer plano).
Capas con valor **menor** parecen más **lejos** (fondo).
