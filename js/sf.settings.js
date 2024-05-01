sf = typeof sf != 'undefined' ? sf : {}

sf.settings = (function() {
  let clone = sf.utilities.clone

  let settings = {
    developer: {
      active       : true,
      display_XYZ  : true,
      unplug_splash: true,
    },
    application: {
      // CSS
      css_rules_identifier: `sf-css-rules`,
      color_background    : `hsl(224deg,61%,13%)`,
      // General
      // IDs
      id_main       : `sfm-main`,
      id_submain    : `sfm-submain`,
      id_mmenu      : `sfm-mmenu`,
      id_mmenu_list : `sfm-mmenu-list`,
      id_mmenu_quit : `sfm-mmenu-quit`,
      id_mmenu_sets : `sfm-mmenu-settings`,
      // Classes
      cl_mmenu_elem : `sfm-mmenu_elem`,
    },
    mmenu: {
      background  : `assets/splash_002.png`,
      height      : `70%`,
      width       : `23ch`,
      offset      : `3ch`,
      fsize       : `17pt`,
      // elements
      margin      : `0.4ch`,
      padding     : `1.3ch`,
      backing     : `rgba( 255, 255, 255, 0.03 )`,
      backingHover: `rgba( 255, 255, 255, 0.08 )`,
      // modal
      modal_fsize : `33pt`,
      modal_quit_width       : `13ch`,
      modal_quit_height      : `5.5ch`,
      modal_settings_width   : `23ch`,
      modal_settings_height  : `25.5ch`,
      modal_background       : `rgba( 255, 255, 255, 0.03 )`,
      modal_filter           : `blur(13px)`,
      modal_target_background: `rgba( 255, 255, 255, 0.08 )`,
      modal_target_filter    : `blur( 6px)`,
      modal_border_radius    : `9px`,
      modal_xclose_padding   : `0.8ch`,
      modal_hover_color      : `rgba( 184, 184, 203, 0.83 )`,
      // settings
      settings_header_color      : `rgba( 181, 184, 203, 0.78 )`,
      settings_header_line_height: `3.4ch`,
    },
    engine: {
      garbage_tile_age: 360000,
    },
    game: {
      // Settings
      fps           : 60,
      size_unit     : 300, // 36,
      player_model  : `SRB-001`,
      player_models : [
        {velocity:  85, model: `forward_02`},
        {velocity:  40, model: `forward_01`},
        {velocity:   0, model: ``},
        {velocity: -40, model: `reverse_01`},
        {velocity: -85, model: `reverse_02`},
      ],
      speed_limiter : 11.1,
      speed_reverse : 0.83,
      speed_refactor: 1,
      speed_rotation_limit: 3.1/360 * Math.PI * 2,
      
      size_sector   : 500,
      count_sector :  5,
      initial_x     : 0,
      initial_y     : 0,
      sector_name_template: /sector_MX(-?\d+)_MY(-?\d+)/,
      // calculations
      forward_angle : 87.5 * Math.PI/180,
      turn_angle    :  7.5 * Math.PI/180,
      turn_f_angle  : 11.5 * Math.PI/180,
      // some game-input interfacing
      turn_threshold: 35,
    },
    canvas: {
      // IDs
      id_canvas   : `sfm-canvas`,
      //
      dpi         : 192, // 192, 288
      grid_stroke : `rgba( 133, 133, 167, 0.13 )`,
      default_strokeStyle  : '#000',
      
      player_size : 31,
      
      // Camera: target
      
      // Camera: parameters
      
      // Follow Camera
      id_eye        : `follow-camera`,
      // Light
      hemisphericBrightness: 1.44,
      
    },
    hud: {
      // IDs
      id_main       : `sfh-main`,
      id_fps        : `sfh-fps`,
      id_xyz        : `sfh-xyz`,
      id_x          : `sfh-x`,
      id_y          : `sfh-y`,
      id_z          : `sfh-z`,
      id_sector     : `sfh-sector`,
      id_rotary     : `sfh-rotary`,
      class_coords  : `sfh-coordinates`,
      // ID: Attack interface
      id_weapon_01  : `sfh-weapon-01`,
      id_weapon_02  : `sfh-weapon-02`,
      id_weapon_03  : `sfh-weapon-03`,
      id_weapon_04  : `sfh-weapon-04`,
      class_weapon  : `sfh-weapon`,
      class_weapon_button: `sfh-weapon-button`,
      // HUD
      // Sector
      sector_margin : `1.4ch`,
      sector_size   : `11ch`,
      sector_border : `1px dashed rgba( 141, 141, 169, 0.33 )`,
      sector_opacity: `0.4`,
      // Coordinates
      coordinatesXY_refactor: 10,
      coordinatesXY_opacity : `0.35`,
      coordinatesXY_yWidth  : `calc(180px + 0ch)`,
      coordinatesXY_yBottom : `calc(180px + 2.1ch)`,
      coordinatesXY_yLeft   : `0px`,
      coordinatesXY_xWidth  : `calc(180px + 2ch + 2ch)`,
      coordinatesXY_xBottom : `calc(180px - 2.1ch)`,
      coordinatesXY_xLeft   : `0px`,
      // FPS
      fps_offset_x  : `1.44ch`,
      fps_offset_y  : `0.33ch`,
      fps_opacity   : `0.44`,
      // Rotary
      rotary_border    : `1px dotted rgba( 141, 141, 169, 0.33 )`,
      rotary_opacity   : `0.6`,
      rotary_dial_width: `3px`,
      rotary_dial_border_radius: `3px`,
      // Weapons
      w_button_size    : `1.8ch`,
      w_button_border  : `1px dashed rgba( 144, 144, 189, 0.67 )`,
      w_button_fsize   : `31pt`,
      w_button_lheight : `2.0ch`,
      w_button_opacity : `0.33`,
      w_button_border_active: `1px dashed rgba( 105, 42, 48, 1.00 )`,
      w_button_active  : `rgba( 105, 42, 48, 1.00 )`,
      
      w1_right_offset  : `calc( 180px + 6ch )`,
      w1_bottom_offset : `calc( 3/5 * 180px )`,
      w2_right_offset  : `calc( 180px + 6ch )`,
      w2_bottom_offset : `calc( 1/5 * 180px )`,
    },
    input: {
      id_js_dir   : `sfi-js-dir`,
      id_js_aim   : `sfi-js-aim`,
      // Joysticks
      js_maximum  : 100,
      // styling
      js_size         : `50vmin`,
      js_size_max     : `180px`,
      js_offset_bottom: `15px`,
      js_offset_left  : `13px`,
      js_offset_right : `24px`,
      // constructor options
      js_dir_options  : {
        rotation_invert    : true,
        rotation_offset    : -90,
        internalFillColor  : `rgba( 231, 231, 231, 0.87 )`,
        internalLineWidth  : 7,
        internalStrokeColor: `rgba(  14,  14,  14, 0.27 )`,
        externalLineWidth  : 18,
        externalStrokeColor: `rgba(  83,  83,  83, 0.03 )`,
      },
      js_aim_options  : {
        rotation_invert    : true,
        rotation_offset    : -90,
        internalFillColor  : `rgba( 231, 231, 231, 0.87 )`,
        internalLineWidth  : 7,
        internalStrokeColor: `rgba(  14,  14,  14, 0.27 )`,
        externalLineWidth  : 18,
        externalStrokeColor: `rgba(  83,  83,  83, 0.03 )`,
        autoReturnToCenter : false,
      },
    },
  }
  
  let retrieve = function(k) {
    if (typeof settings[k] != 'undefined') {
      return settings[k]
    }
    for (const [subsetting, entries] of Object.entries(settings)) {
      if (typeof entries[k] != 'undefined') {
        return entries[k]
      }
    }
    return settings
  }

  return {
    get: retrieve,
    set: function(k,v) { settings[k] = v; return clone(settings) },
  }
})()