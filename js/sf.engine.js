sf = typeof sf != 'undefined' ? sf : {}

sf.engine = (function() {
  /* Meta variables */
  let qset       = sf.utilities.qselect
  let raiseEvent = sf.utilities.raiseEvent
  let uuid       = sf.utilities.uuid
  let clone      = sf.utilities.clone
  
  let Splash     = sf.splash.Splash
  
  let Tile       = sf.constructs.tile
  let Player     = sf.constructs.player
  let Actor      = sf.constructs.actor
  let loadModel  = sf.canvas.loadModel
  
  let models     = sf.library.retrieve
  
  let events     = sf.comptroller.events()
  let event_initialise = events.preloader.initial
  
  /* Module Settings & Events */
  let settings   = sf.settings.get()

  /* Memory */
  let body, main, submain, mmenu, canvas;
  let collider;
  let levelData, splash, splasher;
  
  // Main data output
  let data;
  let dataTemplate = {
    hero    : {},
    units   : {},
    sectors : {},
    settings: {},
  }
  /* Computational variables */
  let sga = settings.engine.garbage_tile_age
  
  /* Update Functions */
  // Initialisation listener
  body = qset('body')
  body.addEventListener( event_initialise, function(e) {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `engine` )
  })
  
  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      let g = e.detail
      main    = g.main
      submain = g.submain
      canvas  = g.canvas
      mmenu   = g.mmenu
      // generate collider
      collider = new collisions.generate()
      /* Comptroller Instructions */
      main.addEventListener( events.comptroller.engine, startEngine )
      main.addEventListener( events.comptroller.united, unitLoaded )
      main.addEventListener( events.comptroller.js_payload, jsPayload )
    })
  }
  
  let startEngine = async function(e) {
    // pause the Clock
    raiseEvent( canvas, events.engine.clock_pause, `starting engine and level loading` )
    // clear Data
    resetData()
    
    // get level data
    levelData = {enemies:[]}
    
    // generate local map
    generateMap()
  
    // Start listening to Comptroller ticks
    main.addEventListener( events.comptroller.tick, tick )
    
    // Draw a Splash
    splash = new Splash({
      // settings
      background: `assets/splash_001.png`,
      fade      : 300,
      // loader
      lines     : [`assets`],
      max       : Object.entries(levelData.enemies).length + 1,
      count     : 0,
    })
    splasher = splash.start();
    splasher.next()
    
    // Inform the Comptroller to tell Canvas to Unhide
    raiseEvent( body, events.engine.click_outward, `engine-start` )
    
    // Load a Level
    await spawningPool() // MODIFY
  }
  
  let unitLoaded = function(e) {
    // console.log(`Unit Loaded`, e.detail)
    let completed = splash.updateLine(`assets`, splash.getLine(`assets`)[0][`count`]++, `Loaded unit ${e.detail.uuid}...`)
    if (completed) { 
      splasher.next()
      raiseEvent( canvas, events.engine.clock_unpause, `level loading completed` )
    }
  }

  let jsPayload = function(e) {
    let payload = e.detail
    if (payload.wh == 'dir') {
      let r = payload.len === 0 ? 0 : payload.r
      data.hero.v = {
        x:  payload.x / settings.game.speed_refactor,
        y:  payload.y / settings.game.speed_refactor,
        m:  payload.len,
        r:  r,
      }
    } else if (payload.wh == 'aim') {
      // data.hero.r = payload.r
      if (payload.len > settings.game.turn_threshold) {
      
        data.hero.vr = payload.r
      }
    }
  }
  
  let resetData = function() { data = clone(dataTemplate) }
  
  let tick = function(e) {
    // Update Hero
    let m = data.hero.update()
    let n = data.hero.updated()
    let o = data.hero.sector.name
    if (n && n != o) {
      let missing = data.sectors[o].getUnmadeNeighbours( data.sectors )
      if (missing.length) {
        missing.forEach(tile => {
          let m = tile.match( settings.game.sector_name_template )
          let x = parseInt( m[1] )
          let y = parseInt( m[2] )
          let t = new Tile( x, y, settings.game.size_sector, {mx: x, my: y, collider: collider} )
          data.sectors[t.k] = t
        })
      }
    }
    data.hero.computeRender(...m)

	// Update other Units
    Object.entries(data.units).forEach(([k,v],i) => {
      let g = v.update()
              v.updated()
              v.computeRender(...g)
    })
    
    // Update
    collider.update()
    
    /*
       Handle destructibles first
       Then handle player
       Then handle other units
     */
    
    // Handle destructibles first
    
    // Then handle player
    let r = collider.createResult()
    let p = data.hero.collisionObject.potentials()
    for (const b of p) {
      if (data.hero.collisionObject.collides(b, r)) {
        data.hero.collisionObject.x -= r.overlap * r.overlap_x
        data.hero.collisionObject.y -= r.overlap * r.overlap_y
        data.hero.x = data.hero.collisionObject.x
        data.hero.y = data.hero.collisionObject.y
      }
    }

    // Then handle other units
    Object.entries(data.units).forEach(([k,v],i) => {
      let g = v.collisionObject.potentials()
      for (const b of g) {
        if (v.collisionObject.collides(b)) {
        
        }
      }
    })
    
    // Collect garbage
    garbage()
  }
  
  let spawningPool = async function() {
    // Spawning
    // Player
    let player = generateUnit(`player`, {x: settings.game.initial_x, y: settings.game.initial_y, model: `XVi-001`}, true)        
        data.hero = player
    // Enemies
    // Need a generator function here using some kind of consistent internal logic
    let enemy  = generateUnit(`key`, {x: 844, y: 580, model: `SRB-001`}, false)
        enemy.enemy = true
        data.units[enemy.id] = enemy

    return
  }
  
  let generateUnit = function( key, datum, isPlayer = false ) {
    let gen  = isPlayer ? Player   : Actor
    let m    = isPlayer ? `player` : `unit`
    let anim = models(datum.model)
    let unit = new gen(key, {
      t: m,
      x: datum.x,
      y: datum.y,
      anim    : anim,
      collider: collider,
      isPlayer: isPlayer,
    })
    
    raiseEvent( canvas, events.engine.unit, unit )
    
    return unit
  }

  let generateMap = function() {
    let sect  = settings.game.size_sector
    let count = settings.game.count_sector
    let half  = Math.floor(count/2)
    
    let mx, my;
    for (var i = 0; i < count; i++) {
      mx = i - half
      for (var j = 0; j < count; j++) {
        my = j - half
        
        let tile = new Tile(mx, my, settings.game.size_sector, {mx: mx, my: my, collider: collider})
        data.sectors[tile.k] = tile
      }
    }
  }
  
  let garbage = function() {
    let now = performance.now()
    let m   = data.hero.sector.name
    let n   = data.sectors[m].getNeighbours()
    
    Object.entries(data.sectors).filter(([k,v],i) => (now - v.age) > sga).forEach(([k,v], i) => {
      if (Object.keys(v.contents).length <= 0 && m != v.name && n.indexOf(k) == -1) {
        console.log(`[Garbage Collection]: deleting sector ${k}`)
        delete data.sectors[k]
      }
    })
  }

  return {
    data: function() { return data },
    collider: function() { return collider }, // devops
  }
})()
