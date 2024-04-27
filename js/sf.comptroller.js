sf = typeof sf != 'undefined' ? sf : {}

sf.comptroller = (function() {
  /* Meta variables */
  let clone      = sf.utilities.clone
  let qset       = sf.utilities.qselect
  let raiseEvent = sf.utilities.raiseEvent
  
  let settings   = sf.settings.get()
  let fps        = sf.settings.get('fps')
  
  let inject     = function(str, tar) { let t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
  // Meta
  /* IMPORTANT TO UPDATE: when calling "events.comptroller.count" */
  let readyModules = [`canvas`, `engine`, `ux`, `input`]
  let clickMap = {
    /* IMPORTANT: These have to be ALL unique! */
    ux: ['new-game','continue-game','settings','settings-close','quit','quit-confirm','quit-close'],
  }

  /* Module Settings & Events */
  let events = {}
  
  events.preloader = {
    initial: `sfp-initialise`,
  }
  events.constructs = {
  
  }
  events.db = {
    
  }
  events.canvas = {
    unit_loaded  : `sfc-unit-loaded`,
  }
  events.engine = {
    clock_pause  : `sfe-clock-pause`,
    clock_unpause: `sfe-clock-unpause`,
    unit         : `sfe-unit`,
    click_outward: `outgoing-sfe-click`,
  }
  events.ux = {
    click        : `incoming-sfx-click`,
    click_outward: `outgoing-sfx-click`,
  }
  events.input = {
    js_payload   : `sfi-js-payload`,
  }
  
  events.comptroller = {
    // machine
    count : `sfc-module-count`,
    tick  : `sfc-tick`,
    ready : `sfc-ready`,
    // state transitions
    splash: `sfc-splash`,
    title : `sfc-title`,
    engine: `sfc-engine`,
    canvas: `sfc-canvas`,
    // router for UI interactions
    click : `sfc-click`,
    // canvas instructions
    unit  : `sfc-unit-create`,
    united: `sfc-unit-loaded`,
    js    : `sfc-js-payload`,
  }
  
  /* In-memory Variables */
  let body, clock, main, submain, mmenu, canvas, comptroller, modules;

  /* Computational variables */
  let state = 1, STATES = { SPLASH: 0, TITLE: 1, GAME: 2, END: 3, CREDITS: 4 }

  /* Clock controller */
  class Clock {
    constructor() {
      this.stopped = false
      this.frame = 0
      this.freq  = fps
      this.fpsi  = 0
      this.init  = 0
      this.now   = 0
      this.then  = 0
      this.gone  = 0
      
      this.prepare()
    }
    prepare() {
      this.stopped = false
      this.fpsi  = 1000 / this.freq
      this.then  = performance.now()
      this.init  = this.then
      return this
    }
    pause() {
      this.stopped = true; return this;
    }
    unpause() {
      this.stopped = false; return this;
    }
    reset() {
      this.pause()
      this.frame = 0
    }
    fps() {
      return 1000 * this.frame / ( this.now - this.init )
    }
    loop() {
      if (this.stopped) { /* do nothing */ } else {
        this.now  = performance.now()
        this.gone = this.now - this.then
        if (this.gone > this.fpsi) {
          this.then = this.now - (this.gone % this.fpsi)
          this.frame++
          raiseEvent( canvas, events.comptroller.tick, [this.frame, this.fps()], true )
        }
      }
      window.requestAnimationFrame( this.loop.bind(this) )
    }
  }
  
  let instantiate = function() {
    let f = `center fullscreen`
    // inject the main container
    createMain(f)
    // inject the canvas, hidden
    createCanvas(f)
    // inject the mainmenu, hidden
    createMenu(f)
  }
  
  let createMain = function(f) {
    inject(`<div id="${settings.application.id_main}" class="${f}"><div id="${settings.application.id_submain}" class="${f}"></div></div>`)
    // shorthand
    main    = qset(`#${settings.application.id_main}`)
    submain = qset(`#${settings.application.id_submain}`)
  }
  
  let createCanvas = function(f) {
    inject(`<canvas id="${settings.canvas.id_canvas}" class="${f} hidden"></canvas>`, submain)
    // shorthand
    canvas  = qset(`#${settings.canvas.id_canvas}`)
  }
  
  let createMenu = function(f) {
    inject(`<div id="${settings.application.id_mmenu}" class="${f} hidden"><div id="${settings.application.id_mmenu_list}"></div></div>`, submain)
    // shorthand
    mmenu   = qset(`#${settings.application.id_mmenu}`)
  }
  
  let renderState = function() {
    switch(state) {
      case STATES.SPLASH:
        raiseEvent( main, events.comptroller.splash )
        break;
      case STATES.TITLE:
        raiseEvent( main, events.comptroller.title )
        break;
      case STATES.GAME:
        raiseEvent( main, events.comptroller.engine )
        break;
      case STATES.END:
        break;
      case STATES.CREDITS:
        break;
      default:
        break;
    }
  }
  
  let listen = function() {
    body.addEventListener( events.comptroller.count, count )
    body.addEventListener( events.comptroller.tick, tick )
    body.addEventListener( events.comptroller.click, click )

    /* Router */
    // engine
    canvas.addEventListener( events.engine.clock_pause, (e) => { console.log(`Pausing clock from request "ENGINE: ${e.detail}"`); clock.pause() } )
    canvas.addEventListener( events.engine.clock_unpause, (e) => { console.log(`Unpausing clock from request "ENGINE: ${e.detail}"`); clock.unpause() } )
    canvas.addEventListener( events.engine.unit, unit )
    // canvas
    canvas.addEventListener( events.canvas.unit_loaded, unit_loaded )
    // input
    submain.addEventListener( events.input.js_payload, js_payload )

    /* Generic Routing of clicks */
    // incoming clicks
    for (const [module, v] of Object.entries(events)) {
      if (v.click_outward) {
        body.addEventListener( v.click_outward, function(e) { incoming(e, module) } )
      }
    }
  }
  
  let count = function(e) {
    modules.splice(modules.indexOf(e.detail), 1)
    if (modules.length <= 0) {
      // propagate to other modules
      raiseEvent( body, events.comptroller.ready, {body: body, main: main, submain: submain, mmenu: mmenu, canvas: canvas} )
    
      // render state
      renderState()
    }
  }

  let tick = function() {
    
  }
  
  // Engine => Canvas
  let unit = function(e) { raiseEvent( canvas, events.comptroller.unit, e.detail ) }
  let unit_loaded = function(e) { raiseEvent( main, events.comptroller.united, e.detail ) }
  
  // Input => Engine
  let js_payload = function(e) { raiseEvent( main, events.comptroller.js_payload, e.detail ) }

  /*
     UI interactions routers: 
       this was designed so we can have a universal language for transmitting interactions from dynamically inserted HTML DOM elements
       it does mean that this has to keep a fairly consistent and accurate internal associations across all modules
   */
  let click = function(e) {
    let msg = e.detail
    for (const [module,clicks] of Object.entries(clickMap)) {
      if (clicks.indexOf(msg) != -1) {
        raiseEvent( main, events[module].click, e.detail, true )
        return
      }
    }
    return false
  }
  /*
    Transition Engine: Receive incoming clicks and interpret
   */
  let incoming = function(e, f) {
    let msg = e.detail
    if (f == 'ux' && msg == 'new-game') {
      state = STATES.GAME
      renderState()
    }
    if (f == 'engine' && msg == 'engine-start') {
      raiseEvent( main, events.comptroller.canvas )
    }
  }

  // Initialisation listener
  body = qset(`body`)
  body.addEventListener( events.preloader.initial, function() {
    // clone Ready Modules
    modules = clone(readyModules)
    // Instantiate
    instantiate()
    // Listen
    listen()
    // Clock
    clock = new Clock()
    clock.prepare().loop()
  })
  
  return {
    events: function() { return clone(events) },
    clock : function() { return clock },
    state : function() { return state },
  }
})()