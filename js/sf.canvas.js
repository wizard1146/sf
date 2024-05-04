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
  let dev        = settings.developer.active

  /* Events */

  /* In-memory variables */
  let body, main, submain, mmenu;
  let canvas, ctx, engine, scene, units = {}, player;
  let camera, eye, shadowy;

  /* Computational variables */
  let isf;
  let transform = { left: 0, top : 0 };
  let resizeLockout;
  
  
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
      prepare()
      
      // Listen for resize
      window.addEventListener('resize', function(e) {
        clearTimeout(resizeLockout)
        resizeLockout = setTimeout( resize, settings.canvas.resize_lockout )
      })
    })
  }
  
  let prepare = function() {
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
  }
  
  let resize = function() {
    prepare()
  }
  
  let renderCanvas = async function(e) {
    // Unhide canvas
    canvas.classList.remove('hidden')
    
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
    
    // inform the collision models of the ISF
    if (data?.hero && !data?.hero?.colliderScale) {
       data.hero.setColliderScale( isf )
       Object.entries(data.units).forEach(([k,v],i) => {
         v.setColliderScale( isf )
       })
    }
    
    // render hero
    hero.render( canvas, transform )
    if (dev) hero.renderCollider( canvas, transform )
    // render units
    Object.entries(data.units).forEach(([k,v],i) => {
      v.render( canvas, transform, hero, isf )
      if (dev) v.renderCollider( canvas, transform, hero, isf )
    })
  }
  
  let loadModel = async function(e) {
    let datum = e.detail
    
    let unit = {
      uuid : uuid(),
      image: new Image(),
    }
    raiseEvent( canvas, events.canvas.unit_loaded, unit )
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
    canvas      : function() { return canvas    },
    transform   : function() { return transform },
    camera      : function() { return camera    },
    eye         : function() { return eye       },
    scene       : function() { return scene     },
    units       : function() { return units     },
  }
})()
