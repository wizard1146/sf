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
  
  let LEVELS     = sf.season_001.LEVELS
  let UNITS      = sf.season_001.UNITS
  
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
  let snt = settings.game.sector_name_template
  let sga = settings.engine.garbage_tile_age
  
  /* Update Functions */
  let updateHero = function() {
    let hero = data.hero
    let changed = false
    // add velocity
    let magnitude = hero.v.m
    let rotation  = hero.v.r
    
    // estimate inversion
    let inversion = false
    let dg = hero.v.r - hero.r
    let dh = dg == 0 ? 0 : (dg + Math.PI) % (2*Math.PI) - Math.PI
    
    // document.querySelector(`#${settings.hud.id_dev} .value`).textContent = dh.toFixed(2)
      
    if ( -settings.game.forward_angle <= dh && dh <= settings.game.forward_angle ) {
      inversion = false
    } else {
      inversion = true
    }
    
    hero.deltaX = hero.v.x / settings.game.speed_limiter * (inversion ? settings.game.speed_reverse : 1)
    hero.deltaY = hero.v.y / settings.game.speed_limiter * (inversion ? settings.game.speed_reverse : 1)
    hero.deltaRotation = hero.vr - hero.r
    let de = hero.deltaRotation == 0 ? 0 : (hero.deltaRotation + Math.PI) % (2*Math.PI) - Math.PI
    let df = -1 * (de > 0 ? -1 : 1) * Math.min( settings.game.speed_rotation_limit, Math.abs(de) )
    
    // resolve deltas
    if (hero.deltaX != 0) {
      hero.x += hero.deltaX
      hero.deltaX = 0
      changed = true
    }
    if (hero.deltaY != 0) {
      hero.y += hero.deltaY
      hero.deltaY = 0
      changed = true
    }
    if (hero.deltaRotation != 0) {
      // let de = (hero.deltaRotation + Math.PI) % (2*Math.PI) - Math.PI
      hero.deltaR = de
      
      hero.r += df // -1 * (de > 0 ? -1 : 1) * Math.min( settings.game.speed_rotation_limit, Math.abs(de) )
      hero.r  = hero.r % (2 * Math.PI)
      hero.deltaRotation = 0
      changed = true
    }
    
    /* Updates */
    if (changed) {
      // Update the hero's sector, and generate unmade adjacent tiles
      let osn = hero.sector.name
      hero.sector = hero.getSector()
      if (osn != hero.sector.name) {
        // generate unmade neighbour tiles
        let missing = data.sectors[hero.sector.name].getUnmadeNeighbours( data.sectors )
        if (missing.length) {
          missing.forEach(tile => {
            let m = tile.match(snt)
            let x = parseInt(m[1])
            let y = parseInt(m[2])
            let t = new Tile( x, y, settings.game.size_sector, {mx: x, my: y, collider: collider})
            data.sectors[t.k] = t
          })
        }
      }
    }
    
    /* Set the model instructions */
    let instructions = [`base`]
    let alter = hero.meta.player_model_instructions.length == 0 ? true : false
    let pm = hero.meta.player_models
    
    
    if (hero.xv.m != hero.v.m || dg != 0) {
      alter = true
      if (!inversion) {
        for (var i = 0; i < pm.length; i++) {
          let f = pm[i]
          if (hero.v.m >= f.velocity) {
            instructions.push( f.model )
            break
          }
        }
      } else {
        for (var i = pm.length - 1; i > -1; i--) {
          let f = pm[i]
          if (hero.v.m >= Math.abs(f.velocity)) {
            if (f.model.length) {
              instructions.push( `offwing_reverse` )
              instructions.push( f.model )
            }
            break
          }
        }
      }
    }
    instructions = instructions.filter(i => i.length > 0)
    
    // Prioritise rotation
    if (df != 0) {
      alter = true
      if (df < 0) {
        if (Math.abs(de) < settings.game.turn_f_angle) {
          instructions.push( `right_thrust` )
        } else {
          instructions.push( `right_hard_thrust` )
        }
      } else if (df > 0) {
        if (Math.abs(de) < settings.game.turn_f_angle) {
          instructions.push( `left_thrust` )
        } else {
          instructions.push( `left_hard_thrust` )
        }
      }
    } else if (dh != 0 && Math.abs(dh) > settings.game.turn_angle && Math.abs(dh) < (Math.PI - settings.game.turn_angle) && hero.v.m >= pm[pm.length-1].velocity) { // then resolve-ish forward vector
      alter = true
      if (dh < 0) {
        instructions.push( `right_thrust` )
      } else if (dh > 0) {
        instructions.push( `left_thrust` )
      }
    }
    if (alter) hero.meta.player_model_instructions = instructions
    
    // save
    hero.xv = clone(hero.v)
  }
  
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
    levelData = LEVELS[`001`]
    
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
    await loadLevel( levelData ) // MODIFY
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
    updateHero()
    garbage()
  }
  
  let loadLevel = function(levelData) {
    // generate map
    
    // generate player
    let datum  = UNITS['player'] // MODIFY
        datum.player_model  = settings.game.player_model
        datum.player_models = settings.game.player_models
    // grab Player's start position
    if (levelData.startPosition) { datum.pos = levelData.startPosition }
    // generate Player
    let player = generateUnit( datum.key, datum, true )
    data.hero = player

    // generate units
    levelData.enemies.forEach(datum => {
      let enemy = generateUnit( datum.model, datum, false )
          enemy.enemy = true
      data.units[enemy.id] = enemy
    })
    // 
    console.log(data)
  }
  
  let generateUnit = function( key, datum, isPlayer ) {
    let meta = UNITS[key]
    let gen  = isPlayer ? Player : Actor
    
    let unit = new gen( isPlayer ? 'hero' : 'unit', {t: isPlayer ? 'player' : 'actor', collider: collider})
        unit.a.keys = meta.animationKeys
        unit.meta   = meta
        unit.x = datum?.pos?.x || unit.x
        unit.y = datum?.pos?.y || unit.y
        unit.r = datum?.pos?.r || unit.r
        unit.isPlayer = isPlayer
    
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
