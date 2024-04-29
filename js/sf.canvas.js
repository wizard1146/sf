sf = typeof sf != 'undefined' ? sf : {}

sf.canvas = (function() {
  /* Meta Variables */
  let qset       = sf.utilities.qselect
  let raiseEvent = sf.utilities.raiseEvent
  let uuid       = sf.utilities.uuid
  let libRender  = sf.library.render
  let libGet     = sf.library.get
  let season     = sf.season_001
  let inject     = function(str, tar) { var t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }

  let events  = sf.comptroller.events()
  let event_initialise = events.preloader.initial
  
  /* Settings */
  let settings   = sf.settings.get()

  /* Events */

  /* In-memory variables */
  let body, main, submain, mmenu;
  let canvas, ctx, engine, scene, units = {}, player;
  let camera, eye, shadowy;

  /* Computational variables */
  let isf;
  let transform = { left: 0, top : 0 };


  let createScene = function(options) {
  
    return scene
  }
  
  class UnitModel {
    constructor(datum, payload) {
      Object.entries(datum).forEach(([k,v],i) => {
        this[k] = v
        if (k === 'meshes') this.actual = v[0]
      })
      this.uuid = payload?.id ? payload?.id : uuid()
      // animation data
      this.animation = null
      this.anim = {}
      this.anim.current = ``
      // save meta information from payload
      if (payload?.animationKeys) this.anim.keys = payload?.animationKeys
      
      // meta information
      this.meta = {}
      this.meta.scale = 1

      this.showAxes()

      // save it to the module
      units[this.uuid] = this
    }
    // Helper Tools
    showGrid() {
      if (this?.axes) this.axes.dispose()
      
    }
    // Geo Controllers
    moveTo(x, y, z = 0) {
      this.actual.position = new BABYLON.Vector3( x, z, y )
    }
    rotateTo( r ) {
      this.actual.rotation.y = r
    }
    scaleTo(scale) {
      this.meta.scale = scale
      this.actual.scaling.scaleInPlace( this.meta.scale )
      this.showAxes()
    }
    rotateTo(degrees) {
      this.actual.rotate(BABYLON.Axis.Y, degrees, BABYLON.Space.LOCAL)
    }
    rotateBy(degrees) {

    }
    // Animation Controllers
    AnimateStop() {
      if (this.animation) this.animation.stop(); this.animation = null;
    }
    AnimateSpecific(animation) {
      this.AnimateStop()
      let g = this.animationGroups
      let f = g.filter(a => a.name == animation)
      if (f.length) {
        this.anim.current = animation
        this.animation = f[0]
        this.animation.start( true, 1 )
      }
    }
    AnimateIdle() {
      if (this.anim.keys) this.AnimateSpecific(this.anim.keys.idle)
    }
    AnimateWalk() {
      if (this.anim.keys) this.AnimateSpecific(this.anim.keys.walk)
    }
  }
  
  
  // Initialisation listener
  body = qset(`body`)
  body.addEventListener( event_initialise, function() {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `canvas` )
  })
  
  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      let g = e.detail
      main    = g.main
      submain = g.submain
      canvas  = g.canvas
      mmenu   = g.mmenu
      
      /* Comptroller Instructions */
      main.addEventListener( events.comptroller.canvas, renderCanvas )
      canvas.addEventListener( events.comptroller.unit, loadModel )
      
      /* Canvas preparation */
      // Assign context
      ctx = canvas.getContext('2d')
      // Canvas sizing
      var wi = window.innerWidth
      var he = window.innerHeight
      canvas.style.width = wi + 'px'
      canvas.style.height= he + 'px'
      canvas.width  = wi
      canvas.height = he
      // DPI
      adjustDPI()
      // set up the transformation
      transform.left = canvas.width  / 2 * 1/isf
      transform.top  = canvas.height / 2 * 1/isf
      // Engine
      // engine = new BABYLON.Engine(canvas, false, {}, false)
      
      // Engine: Listen for resize
      window.addEventListener('resize', function() { /*  */ })
    })
  }
  
  let renderCanvas = async function(e) {
    // Unhide canvas
    canvas.classList.remove('hidden')
    // Create scene
    scene = await createScene()
    // Listen to Comptroller tick
    main.addEventListener( events.comptroller.tick, tick )
  }
  
  let tick = function() {
    // update scene
    let data  = sf.engine.data()
    let hero  = data.hero
    let rest  = data.units

    // clear
    ctx.clearRect( 0, 0, canvas.width, canvas.height )
    
    // render grid
    renderGrid( data )
    
    // render hero
    let fighter      = libGet( hero.meta.player_model )
    let instructions = fighter.compose( hero.meta.player_model_instructions ) // fighter.instructions
    let targetSize   = settings.game.size_unit
    let scaling      = targetSize/fighter.height

    libRender( canvas, [
     { instruction: `translate`, args: [ transform.left, transform.top ] },
     { instruction: `rotate`, args: [ hero.r ] },
    ], instructions, [ fighter.width/2 * scaling, fighter.height/2 * scaling] )
  }
  
  let loadModel = async function(e) {
    let datum = e.detail
    
    let unit = {
      uuid : uuid(),
      image: new Image(),
    }
    raiseEvent( canvas, events.canvas.unit_loaded, unit )
    
    /*
    unit.image.src = `assets/arrow.png`
    
    unit.image.onload = function() {
      // notify Comptroller
      raiseEvent( canvas, events.canvas.unit_loaded, unit )
    }
    
    // save the model 
    units[unit.uuid] = unit
    if (datum.isPlayer) {
      player = unit
    }
    */
    
    /*
    let datum = e.detail
    let uri   = `assets/${datum.meta.uri}/scene.gltf`

    let obj = await BABYLON.SceneLoader.ImportMeshAsync('', uri, '', scene)
    let unit = new UnitModel(obj, {id: datum.id, animationKeys: datum.meta.animationKeys})
    
    if (datum?.meta?.scale) unit.scaleTo( datum?.meta?.scale )
    if (typeof datum?.x != 'undefined' && typeof datum?.y != 'undefined') unit.moveTo( datum?.x, datum?.y )
    if (datum?.r) unit.rotateTo( datum?.r )
    
    // default animation
    unit.AnimateIdle()
    
    // save the model 
    units[unit.uuid] = unit
    if (datum.isPlayer) {
    
    }
    */
    // notify Comptroller
    // raiseEvent( canvas, events.canvas.unit_loaded, unit )
  }
  
  let renderHero = function(data) {
    let h = data.hero
    let t = settings.canvas.player_size
    let r = h.meta.sprite.ratio
    
    ctx.save()
    ctx.translate( transform.left, transform.top )
    ctx.rotate( h.r )
    ctx.translate( -t/2, -t*r/2 )
    ctx.drawImage( player.image, 0, 0, t, t*r ) 
    ctx.restore()
  }
    
  let renderGrid = function(data) {
    const ss = settings.game.size_sector
    let h = data.hero
    let deltaX = h.sector.left - h.x
    let deltaY = h.sector.bottom - (1 * h.y)
    
    let c = Math.ceil( canvas.width / ss )
    let d = Math.floor(c/2) + 1
    
    ctx.strokeStyle = settings.canvas.grid_stroke
    for (var i = -d; i < d; i++) {
      // draw Vertical lines
      let xLine = deltaX/isf + transform.left + (i * ss)
      // console.log(xLine, deltaX, isf, transform.left, i*ss)
      ctx.beginPath()
      ctx.moveTo( xLine,  d * ss )
      ctx.lineTo( xLine, -d * ss )
      ctx.stroke()
      // draw Horizontal lines
      let yLine = deltaY/isf - transform.top + (i * ss)
      ctx.beginPath()
      ctx.moveTo(  d * ss, -yLine )
      ctx.lineTo( -d * ss, -yLine )
      ctx.stroke()
    }
    ctx.strokeStyle = settings.canvas.default_strokeStyle
  }
  
  // DPI
  let adjustDPI = function() {
    // CSS Size
    canvas.style.width  = canvas.style.width  || canvas.width  + 'px'
    canvas.style.height = canvas.style.height || canvas.height + 'px'

    // Scale
    isf = settings.canvas.dpi / 96

    var w = parseFloat( canvas.style.width )
    var h = parseFloat( canvas.style.height )

    var os = canvas.width / w 
    var bs = isf / os
    var b  = canvas.cloneNode(false)
    b.getContext('2d').drawImage(canvas, 0, 0)

    canvas.width = Math.ceil( w * isf )
    canvas.height = Math.ceil( h * isf )

    ctx.setTransform( bs, 0, 0, bs, 0, 0 ) 
    ctx.drawImage( b, 0, 0 )
    ctx.setTransform( isf, 0, 0, isf, 0, 0 )
    
    return [canvas.width, canvas.height]
  }

  return {
    canvas      : function() { return canvas },
    camera      : function() { return camera },
    eye         : function() { return eye    },
    scene       : function() { return scene  },
    units       : function() { return units  },
  }
})()
