sf = typeof sf != 'undefined' ? sf : {}

sf.css = (function() {
  /* Meta variables */
  let addCSS   = sf.utilities.addCSS
  let events   = sf.comptroller.events()
  let settings = sf.settings.get()
  let svg      = sf.svg.get
  let qset     = function( selector ) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  
  let event_initialise = events.preloader.initial
  
  /* Module Settings & Events */
  
  /* Memory */
  let s_app    = settings.application
  let s_mmenu  = settings.mmenu
  let s_game   = settings.game
  let s_canvas = settings.canvas
  let s_hud    = settings.hud
  let s_input  = settings.input
  
  /* Computational variables */

  
  let refresh = function() {
    let r = settings.application.css_rules_identifier
    // Remove previous CSS rules
    document.querySelectorAll( r ).forEach(e => e.remove())
    // Implement current CSS rules
    cssRules.forEach(rule => {
      addCSS( rule, r )
    })
  }
  
  let cssRules = [
    `
    /* Fonts */
    @import url('https://fonts.googleapis.com/css2?family=M+PLUS+1+Code:wght@100..700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&display=swap');
    .mplus {
      font-family: "M PLUS 1 Code", monospace;
    }
    .syne-mono {
      font-family: "Syne Mono", monospace;
    }
    `,
    `
    :root {
      --app-background-color: ${settings.application.color_background};
    }
    body {
      background: var(--app-background-color);
    }
    `,
    `
    /* Shorthand classes */
    .dev {
      border: 1px solid rgba( 255, 1, 1, 1 );
    }
    .absolute {
      position : absolute;
    }
    .fullscreen {
      width    : 100%;
      height   : 100%;
    }
    .center {
      position : absolute;
      left     : 50%;
      top      : 50%;
      transform: translate( -50%, -50% );
    }
    .top-center {
      top      : 0%;
      left     : 50%;
      transform: translate( -50%, 0% );
    }
    .top-left  {
      left     : 0%;
      top      : 0%;
    }
    .top-right {
      right    : 0%;
      top      : 0%;
    }
    .right {
      right    : 0%;
    }
    .left {
      left     : 0%;
    }
    .bottom-right {
      right    : 0%;
      bottom   : 0%;
    }
    .bottom-middle {
      left     : 50%;
      bottom   : 0%;
      transform: translate( -50%, 0% );
    }
    .bottom-left {
      left     : 0%;
      bottom   : 0%;
    }
    .flexbox {
      display  : flex;
    }
    .flex-column {
      flex-direction: column;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .no-select {
      user-select: none;
    }
    .cursor {
      cursor: pointer;
    }
    .no-pointer {
      pointer-events: none;
    }
    .pointer {
      pointer-events: initial;
    }
    .circle {
      border-radius: 50%;
    }
    .hidden {
      display: none;
    }
    .full-modal {
      position : absolute;
      left     : 50%;
      top      : 50%;
      transform: translate( -50%, -50% );
      width    : 100%;
      height   : 100%;
    }
    `,
    `
    /* Colors & Effects */
    .translucent-white {
      background: rgba( 255, 255, 255, 0.04 );
    }
    .text-grey {
      color   : rgba( 141, 141, 189, 0.65 );
    }
    .text-bright {
      color   : rgba( 184, 184, 203, 0.78 );
    }
    .text-accent {
      text-shadow:
        1px -1px 0 rgba( 44, 44, 44, 0.83 ),
        1px  1px 0 rgba( 14, 14, 14, 0.93 );  
    }
    .backdrop-blur {
      backdrop-filter: blur(6px);
    }
    `,
    ` 
    /* Core Elements */
    #${s_hud.id_fps} {
    }
    #${s_app.id_main}, #${s_app.id_submain} {
    }

    /* Main Menu */
    #${s_app.id_mmenu} {
      background-image: url(${s_mmenu.background});
      background-size : cover;
    }
    #${s_app.id_mmenu_list} {
      width           : calc(${s_mmenu.width} - ${s_mmenu.offset});
      height          : ${s_mmenu.height};
      max-height      : 100%;
      padding-right   : ${s_mmenu.offset};
      padding-left    : ${s_mmenu.offset};
      justify-content : center;
      flex-direction  : column;
      font-size       : ${settings.mmenu.fsize};
    }
    .${s_app.cl_mmenu_elem} {
      padding         : ${s_mmenu.padding};
      margin          : ${s_mmenu.margin};
      background      : ${s_mmenu.backing};
      border-radius   : 9px;
      position        : relative;
      overflow  : hidden;
      transition: all 230ms;
    }
    .${s_app.cl_mmenu_elem} .value {
      position: relative;
    }
    .${s_app.cl_mmenu_elem} .backdrop {
      position : absolute;
      overflow : hidden;
      width    : 100%;
      height   : 100%;
      left     : 0%;
      top      : 0%;
      backdrop-filter: blur(6px);
    }
    .${s_app.cl_mmenu_elem}:hover {
      background      : ${s_mmenu.backingHover};
    }
    .${s_app.cl_mmenu_elem}:hover .value {
      color   : rgba( 231, 184, 203, 0.78 );
    }
    .${s_app.cl_mmenu_elem}:hover .backdrop {
      backdrop-filter: blur(11px);
    }
    
    /* Main Menu Modals */
    #${s_app.id_mmenu_sets},
    #${s_app.id_mmenu_quit} {
      font-size      : ${s_mmenu.modal_fsize};
      backdrop-filter: ${s_mmenu.modal_filter};
    }
    #${s_app.id_mmenu_sets} .backing,
    #${s_app.id_mmenu_sets} .value {
      width          : ${s_mmenu.modal_settings_width};
      height         : ${s_mmenu.modal_settings_height};
      max-height     : 92%;
    }
    #${s_app.id_mmenu_quit} .backing,
    #${s_app.id_mmenu_quit} .value {
      width       : ${s_mmenu.modal_quit_width};
      height      : ${s_mmenu.modal_quit_height};
    }
    #${s_app.id_mmenu_sets} .backing,
    #${s_app.id_mmenu_quit} .backing {
      background     : ${settings.mmenu.modal_target_background};
      backdrop-filter: ${s_mmenu.modal_target_filter};
      border-radius  : ${s_mmenu.modal_border_radius};
    }
    #${s_app.id_mmenu_quit} .value {
      line-height : ${s_mmenu.modal_quit_height};
    }
    #${s_app.id_mmenu_sets} .x-close,
    #${s_app.id_mmenu_quit} .x-close {
      padding        : ${s_mmenu.modal_xclose_padding};
      line-height    : 1ch;
      background     : ${settings.mmenu.modal_target_background};
      backdrop-filter: ${s_mmenu.modal_target_filter};
      border-bottom-left-radius: ${s_mmenu.modal_border_radius};
    }
    #${s_app.id_mmenu_sets} .x-close:hover,
    #${s_app.id_mmenu_quit} .value:hover,
    #${s_app.id_mmenu_quit} .x-close:hover {
      color          : ${s_mmenu.modal_hover_color};
    }
    #${s_app.id_mmenu_sets} .header {
      color          : ${s_mmenu.settings_header_color};
      line-height    : ${s_mmenu.settings_header_line_height};
    }
    
    /* Canvas */
    #${s_canvas.id_canvas} {
      outline: none;
    }
    #${s_hud.id_xyz} {
      padding-left  : 1.1vmin;
      padding-bottom: 0.8vmin;
      padding-top   : 0.5vmin;
      padding-right : 0.5vmin;
      border-bottom-left-radius: 6px;
      min-width : 8ch;
      color     : rgba( 231, 231, 231, 0.33 );
      background: rgba( 255, 255, 255, 0.03 );
    }
    
    #${s_hud.id_xyz} div {
      display       : flex;
      flex-direction: row;
    }
    #${s_hud.id_xyz} div div {
      white-space   : pre-wrap;
    }
    #${s_hud.id_xyz}-X .value,
    #${s_hud.id_xyz}-Y .value,
    #${s_hud.id_xyz}-Z .value {
      right    : calc(0% + 1.5ch);
    }
    
    /* Joysticks */
    #${s_input.id_js_dir},
    #${s_input.id_js_aim} {
      width     : ${s_input.js_size};
      height    : ${s_input.js_size};
      max-width : ${s_input.js_size_max};
      max-height: ${s_input.js_size_max};
    }
    #${s_input.id_js_dir},
    #${s_input.id_js_aim} {
      bottom   : ${s_input.js_offset_bottom};
    }
    #${s_input.id_js_dir} {
      left     : ${s_input.js_offset_left};
    }
    #${s_input.id_js_aim} {
      right    : ${s_input.js_offset_right};
    }
    
    /* HUD */
    #${s_hud.id_main} {
      -webkit-tap-highlight-color: transparent;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }
    #${s_hud.id_dev} {
      font-size: ${s_hud.font_size};
    }
    #${s_hud.id_x} {
      width  : ${s_hud.coordinatesXY_xWidth};
      bottom : ${s_hud.coordinatesXY_xBottom};
      left   : ${s_hud.coordinatesXY_xLeft};
    }
    #${s_hud.id_y} {
      width  : ${s_hud.coordinatesXY_yWidth};
      bottom : ${s_hud.coordinatesXY_yBottom};
      left   : ${s_hud.coordinatesXY_yLeft};
    }
    #${s_hud.id_x},
    #${s_hud.id_y} {
      opacity: ${s_hud.coordinatesXY_opacity};
    }
    #${s_hud.id_sector} {
      margin : ${s_hud.sector_margin};
      width  : ${s_hud.sector_size};
      height : ${s_hud.sector_size};
      border : ${s_hud.sector_border};
      opacity: ${s_hud.sector_opacity};
    }
    #${s_hud.id_sector} .value {
      line-height: calc(${s_hud.sector_size} * 0.97);
    }
    #${s_hud.id_fps} {
      right  : ${s_hud.fps_offset_x};
      top    : ${s_hud.fps_offset_y};
      opacity: ${s_hud.fps_opacity};
    }
    #${s_hud.id_rotary} {
      width     : ${s_input.js_size};
      height    : ${s_input.js_size};
      max-width : ${s_input.js_size_max};
      max-height: ${s_input.js_size_max};
      bottom    : ${s_input.js_offset_bottom};
      right     : ${s_input.js_offset_right};
      opacity   : ${s_hud.rotary_opacity};
    }
    #${s_hud.id_rotary} .draw {
      transform-origin: bottom;
      height    : calc(${s_input.js_size}/2);
      max-height: calc(${s_input.js_size_max}/2);
      width     : ${s_hud.rotary_dial_width};
      border    : ${s_hud.rotary_border};
      border-radius: ${s_hud.rotary_dial_border_radius};
    }
    /* Combat HUD */
    #${s_hud.id_weapon_01},
    #${s_hud.id_weapon_02} {
      display       : flex;
      flex-direction: row-reverse;
      pointer-events: initial;
    }
    #${s_hud.id_weapon_01} {
      right  : ${s_hud.w1_right_offset};
      bottom : ${s_hud.w1_bottom_offset};
    }
    #${s_hud.id_weapon_02} {
      right  : ${s_hud.w2_right_offset};
      bottom : ${s_hud.w2_bottom_offset};
    }
    .${s_hud.class_weapon_button} {
      width  : ${s_hud.w_button_size};
      height : ${s_hud.w_button_size};
      border : ${s_hud.w_button_border};
      padding: 0;
      margin : 0.3ch;
      opacity: ${s_hud.w_button_opacity};
      font-size  : ${s_hud.w_button_fsize};
      line-height: ${s_hud.w_button_lheight};
    }
    .${s_hud.class_weapon_button}.auto .bg {
      background-image: url(${svg('auto')});
      background-size: cover;
      filter: invert(48%);
      width : 100%;
      height: 100%;
    }
    .${s_hud.class_weapon_button}:active,
    .${s_hud.class_weapon_button}:hover {
      border : ${s_hud.w_button_border_active};
      color  : ${s_hud.w_button_active};
      opacity: 0.83;
    }
    .${s_hud.class_weapon_button}.auto:hover .bg {
      filter : invert(50%) sepia(13%) hue-rotate(330deg) saturate(3000%);
    }
    `,
  ]
  
  // Initialisation listener
  qset('body').addEventListener( event_initialise, refresh )

  return {
    init    : refresh,
    refresh : refresh,
    settings: function() { return settings },
  }
})()