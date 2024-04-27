sf = typeof sf != 'undefined' ? sf : {}

sf.ux = (function() {
  /* Meta variables */
  let qset       = sf.utilities.qselect
  let raiseEvent = sf.utilities.raiseEvent
  let inject     = function(str, tar) { let t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
  let events     = sf.comptroller.events()
  let event_initialise = events.preloader.initial
  
  /* Module Settings & Events */
  let settings   = sf.settings.get()
  
  /* State variables */
  let STATE    = { SPLASH: 0, MAINMENU: 1, CREATOR: 2, GAME: 3, SKILLTREE: 4 }
  let SUBSTATE = { STORY: 0, CHARSHEET: 1, INVENTORY: 2 }
  /* Memory */
  let body, main, submain, mmenu, canvas;
  let state, substate, showX, showY;
  let js_dir, js_aim, hud_main;
  let jsDir, jsAim, hudX, hudY, hudSector, hudEngineThrust, hudFPS;
  
  /* Computational variables */

  // Initialisation listener
  body = qset(`body`)
  body.addEventListener( event_initialise, function() {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `ux` )
  })
  
  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      let g = e.detail
      main    = g.main
      submain = g.submain
      canvas  = g.canvas
      mmenu   = g.mmenu
      
      /* Comptroller Instructions */
      main.addEventListener( events.comptroller.title, renderTitle )
      main.addEventListener( events.comptroller.canvas, renderHUD )
      // Start listening to Comptroller ticks
      main.addEventListener( events.comptroller.tick, tick )
      /* UX Receiver */
      main.addEventListener( events.ux.click, click )
    })
  }
  
  let renderHUD = function() {
    let x = `${settings.hud.class_coords} absolute syne-mono text-right text-grey bottom-left`
    let y = `${settings.hud.class_coords} absolute syne-mono text-right text-grey`
    inject(`
      <div id="${settings.hud.id_main}" class="absolute fullscreen center no-pointer no-select">
        <div id="${settings.hud.id_xyz}" class="absolute top-right hidden">
          <div id="${settings.hud.id_xyz}-X"><div class="label">X</div><div class="value"></div></div>
          <div id="${settings.hud.id_xyz}-Y"><div class="label">Y</div><div class="value"></div></div>
          <!-- <div id="${settings.hud.id_xyz}-Z"><div class="label">Z</div><div class="value"></div></div> -->
        </div>
        <div id="${settings.hud.id_fps}" class="absolute top-right syne-mono text-grey"><div class="value"></div></div>
        <div id="${settings.hud.id_x}" class="${x}"><div class="value"></div></div>
        <div id="${settings.hud.id_y}" class="${y}"><div class="value"></div></div>
        <div id="${settings.hud.id_sector}" class=""><div class="value"></div></div>
      </div>
    `, submain)
    hudX = qset( `#${settings.hud.id_x} .value` )
    hudY = qset( `#${settings.hud.id_y} .value` )
  }
  
  let renderTitle = function() {
    let f = `center flexbox syne-mono text-bright text-accent text-right no-select cursor`
    let k = qset(`#${settings.application.id_mmenu_list}`)
        k.classList.value = f
    
    let menuElements = [{key: 'new-game', value: 'New Game'}, {key: 'continue-game', value: 'Continue Game'}, {key: 'settings', value: 'Settings'}, {key: 'quit', value: 'Quit'}]
    let clickTemplate = `<div class="${settings.application.cl_mmenu_elem}" id="ELEMENT_ID" onclick="ELEMENT_ONCLICK"><div class="backdrop"></div><div class="value">ELEMENT_VALUE</div></div>`
    let str = ``
    menuElements.forEach(item => {
      str += clickTemplate
               .replace(`ELEMENT_ID`, item.key)
               .replace(`ELEMENT_ONCLICK`, `sf.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'${item.key}\' )`)
               .replace(`ELEMENT_VALUE`, item.value)
    })
    
    inject(str, k)
    
    // Unhide
    let m = qset(`#${settings.application.id_mmenu}`)
        m.classList.remove('hidden')
  }
  
  let renderQuit = function() {
    let clickReduce = `sf.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'quit-close\' )`
    let clickXClose = `sf.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'quit-confirm\' )`
    inject(`
      <div id="${settings.application.id_mmenu_quit}" class="full-modal syne-mono text-grey text-center">
      <div class="full-modal backing"></div>
      <div class="value no-select center cursor" onclick="${clickXClose}">Quit?</div>
      <div class="x-close no-select absolute top-right cursor" onclick="${clickReduce}">x</div>
      </div>`, mmenu)
  }
  let closeQuit = function() { qset(`#${settings.application.id_mmenu_quit}`).remove() }
  
  let renderSettings = function() {
    let clickReduce = `sf.utilities.raiseEvent( document.querySelector(\'body\'), \'${events.comptroller.click}\', \'settings-close\' )`
    inject(`
      <div id="${settings.application.id_mmenu_sets}" class="full-modal syne-mono text-grey text-center">
      <div class="full-modal backing"></div>
      <div class="value flexbox flex-column no-select center cursor" onclick="">
        <div class="header">Settings</div>
      </div>
      <div class="x-close no-select absolute top-right cursor" onclick="${clickReduce}">x</div>
      </div>
    `, mmenu)
  }
  let closeSettings = function() { qset(`#${settings.application.id_mmenu_sets}`).remove() }
  
  let click = function(e) {
    let msg = e.detail
    switch(msg) {
      // Game
      case 'new-game':
        // inform
        raiseEvent( body, events.ux.click_outward, msg )
        // remove
        mmenu.classList.add('hidden')
        break;
      case 'continue-game':
        break;
        
      // Settings
      case 'settings': renderSettings(); break;
      case 'settings-close': closeSettings(); break;
      
      // Quit
      case 'quit': renderQuit(); break;
      case 'quit-confirm': window.close(); break;
      case 'quit-close': closeQuit(); break;
    }
  }
  
  let tick = function(e) {
    let data = sf.engine.data()
    if (hudX) hudX.textContent = (data.hero.x / settings.hud.coordinatesXY_refactor).toFixed()
    if (hudY) hudY.textContent = (data.hero.y / settings.hud.coordinatesXY_refactor).toFixed()
  }
  
  return {
  
  }
})()