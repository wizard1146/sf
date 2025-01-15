
sf = typeof sf != 'undefined' ? sf : {}

sf.gpt = (function() {
  /* Meta variables */
  let qset       = sf.utilities.qselect
  let raiseEvent = sf.utilities.raiseEvent
  let inject     = function(str, tar) { let t = tar ? tar : body; t.insertAdjacentHTML('beforeend', str) }
  
  let events     = sf.comptroller.events()
  let event_initialise = events.preloader.initial
  
  /* Module Settings & Events */
  let settings   = sf.settings.get()
  
  /* Memory */
  let gp, pad, jDir, jAim;

  /* Computational variables */

  
  // Initialisation
  body = qset(`body`)
  body.addEventListener( event_initialise, function() {
    // Listen
    listen()
    // Signal Ready
    raiseEvent( body, events.comptroller.count, `gamepad` )
  })

  let listen = function() {
    body.addEventListener( events.comptroller.ready, function(e) {
      window.addEventListener('gamepadconnected', connected)
    })
  }
  
  let connected = function(e) {
    gp = e.gamepad.index
    document.body.addEventListener( events.comptroller.tick, gpt )
  }
  
  let gpt = function() {
    pad = navigator.getGamepads()[ gp ]
    
    let lx, ly, rx, ry;
    lx = pad.axes[0]
    ly = pad.axes[1]
    rx = pad.axes[2]
    ry = pad.axes[3]
    
    if (typeof jDir == 'undefined') jDir = sf.input.dir()
    if (typeof jAim == 'undefined') jAim = sf.input.aim()
    
    if (jDir) jDir.update( lx * jDir.er + jDir.canvas.width/2, ly * jDir.er + jDir.canvas.height/2 )
    if (jAim) jAim.update( rx * jAim.er + jAim.canvas.width/2, ry * jAim.er + jAim.canvas.height/2 )
  }

  return {
    id : function() { return gp },
    pad: function() { return pad },
  }
})()
