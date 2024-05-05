sf = typeof sf != 'undefined' ? sf : {}

sf.constructs = (function() {
  /* Meta variables */
  let uuid      = sf.utilities.uuid
  let clone     = sf.utilities.clone
  let libget    = sf.library.get
  let librender = sf.library.render
  
  /* Module Settings & Events */
  let settings  = sf.settings.get()
  
  /* Memory */
  
  /* Computational variables */

  /* Meta Constructs */
  class Unit {
    constructor(options) {
      this.key   = options.key
      this.uri   = options.uri
      this.scale = options?.scale ? options?.scale : 1.0
      
      // representation
      this.player_model = ``
      // for dynamic animation
      this.player_model_instructions = []
    }
  }

  /* Classes */
  class Artefact {
    constructor(k, options) {
      // Key, X, Y, Type, Seed
      this.id  = uuid()
      this.age = performance.now()
      this.k = k
      let args = {
        x: 0,
        y: 0,
        t: 'undefined',
        s: Math.random(),
        r: 0,
      }
      Object.entries(args).forEach(([k,v],i) => {
        if (options && options[k]) {
          this[k] = options[k]
        } else {
          this[k] = v
        }
      })
    }
  }

  class Tile extends Artefact {
    constructor(mx, my, size_sector, options) {
      const key = `sector_MX${mx}_MY${my}`
      super(key, options)

      const ss = size_sector 

      const mpx = mx * ss * 2
      const mpy = my * ss * 2    

      this.name = key
      this.mx   = mx
      this.my   = my
      this.t = 'tile'
      this.x = mpx
      this.y = mpy
      this.w = mpx - ss
      this.e = mpx + ss - 1
      this.n = mpy + ss - 1
      this.s = mpy - ss
      this.rangeVertical   = [mpy - ss, mpy + ss - 1]
      this.rangeHorizontal = [mpx - ss, mpx + ss - 1]
      this.items           = {}

      this.neighbours      = this.getNeighbours()
      this.contents = {}
    }

    getNeighbours() {
      var n      = []
      var up     = this.my + 1
      var down   = this.my - 1 
      var left   = this.mx - 1
      var right  = this.mx + 1
      // Fill ABOVE, RIGHT, BELOW, LEFT
      for (var i = down; i < up+1; i++) {
        for (var j = left; j < right+1; j++) {
           n.push(`sector_MX${j}_MY${i}`)
        }
      }
      n.splice(n.indexOf(this.k), 1)
      return n
    }
    getUnmadeNeighbours(knownSectors) {
      let n = this.getNeighbours()
      // https://stackoverflow.com/a/72315001
      return n.filter((sn) => !Object.keys(knownSectors).find((nsn) => sn === nsn))
    }
  }

  class Collidable extends Artefact {
    constructor(key, options) {
      super(key, options)

      let w = options ? (options?.w ? options?.w : settings.game.size_unit) : settings.game.size_unit
      let h = options ? (options?.h ? options?.h : settings.game.size_unit) : settings.game.size_unit
      
      let wf = 2
      let hf = 2
      
      // shouldn't be guessing this!
      this.bounds = [
        [-1 * w/wf, -1 * h/hf],
        [ 1 * w/wf, -1 * h/hf],
        [ 1 * w/wf,  1 * h/hf],
        [-1 * w/wf,  1 * h/hf],
      ]
      this.bounds = options?.anim?.collisionBounds.map(e => [e[0] * w/wf, e[1] * h/hf])
      this.collisionObject = options.collider.createPolygon(this.x, this.y, this.bounds)
    }
    setColliderScale( scale ) {
      this.colliderScale = scale
      this.collisionObject.scale_x = scale
      this.collisionObject.scale_y = scale
      
      // update bounds
      //this.bounds = this.bounds.map(ea => [ea[0] / scale, ea[1] / scale])
    }
    renderCollider( canvas, transform, player, scaleFactor ) {
      let t = [
        { instruction: `translate`, args: [ transform.left, transform.top ] },
      ]
      if (!this.isPlayer) t.push({ instruction: `translate`, args: [ (this.x - player.x)/scaleFactor, (-this.y - -player.y)/scaleFactor ] })
      t.push({ instruction: `rotate`,    args: [ this.r ] })
      
      let ctx = canvas.getContext('2d')
      let bounds = this.bounds
      ctx.closePath()
      ctx.save()
      t.forEach(transform => {
        ctx[transform.instruction]( ...transform.args )
      })
      ctx.moveTo( bounds[0][0], bounds[0][1] )
      this.bounds.forEach(point => {
        ctx.lineTo( point[0], point[1] )
      })
      ctx.lineTo( bounds[0][0], bounds[0][1] )
      ctx.stroke()
      ctx.closePath()
      ctx.restore()
      ctx.strokeStyle = '#000'
      ctx.fillStyle   = '#000'
    }
  }

  class Movable extends Collidable {
    constructor(key, options) {
      super(key, options)
      this.deltaX = 0
      this.deltaY = 0
      this.deltaRotation = 0
    }
  }

  class Actor extends Movable {
    constructor(key, options) {
      super(key, options)
      // Default structure
      let args = {
        isPlayer: false,
        v: {
          m: 0,
          r: 0,
          x: 0,
          y: 0,
        },
        xv: {
          m: 0,
          r: 0,
          x: 0,
          y: 0,
        },
        f: {
          m: 0,
          r: 0,
          x: 0,
          y: 0,
        },
        vr: 0,
        anim: {
          model: settings.game.default_model,
          instructions: [],
        },
      }
      Object.entries(args).forEach(([k,v],i) => {
        this[k] = structuredClone(v)
      })
      
      // Copy from Options
      let deepClone = function([k,v]) {
        if (typeof v == 'object' && k != 'collider') {
          if (typeof this[k] == 'undefined') this[k] = v instanceof Array ? [] : {}
          Object.entries(v).forEach(deepClone.bind(this[k]))
        } else {
          this[k] = v
        }
      }
      Object.entries(options).forEach(deepClone.bind(this))
      
      // Update Sector
      this.sector = this.getSector( settings.game.initial_x, settings.game.initial_y )
    }
    addForce(magnitude, heading) {
      this.f.m = magnitude
      this.f.r = heading
      let resolved = this.resolveForce( magnitude, heading )
      this.f.x = resolved.x
      this.f.y = resolved.y
    }
    resolveForce(m, r) {
      let x = Math.sin(r) * m
      let y = Math.cos(r) * m
      return {x: x, y: y}
    }
    getSector( x = this.x, y = this.y, ss = settings.game.size_sector ) {
      let k = function(input, sectorSize) { return Math.floor((input - sectorSize) / (2 * sectorSize)) + 1 }
      let m = function(input, sectorSize) { return (2*input - 1) * sectorSize }
      
      let mx     = k( x, ss )
      let my     = k( y, ss )
      let left   = m( mx, ss )
      let right  = left + 2*ss - 1
      let bottom = m( my, ss )
      let top    = bottom + 2*ss - 1
      
      return {name: `sector_MX${mx}_MY${my}`, sx: mx, sy: my, left: left, bottom: bottom, right: right, top: top}
    }
    resetVelocity() {
      this.v = {
        m: 0,
        r: 0,
        x: 0,
        y: 0,
      }
    }
    updated() {
      this.sector = this.getSector()
    }
    update() {
      let s_game   = settings.game
      let fa       = settings.game.forward_angle
      let slim     = settings.game.speed_limiter
      let rev      = settings.game.speed_reverse
      let rot      = settings.game.speed_rotation_limit
      let changed  = false
      let inverted = false
      
      // Apply any force
      if (this.f.m > 0) {
        this.v = this.f
      }
      
      // Calculate thrust vectors
      let deltaRotation = this.v.r - this.r
      let deltaR = deltaRotation == 0 ? 0 : (deltaRotation + Math.PI) % (2*Math.PI) - Math.PI
      // Are we inverted?
      if ( !(-fa <= deltaR && deltaR <= fa) ) {
        inverted = true
      }
      this.deltaX = this.v.x / slim * (inverted ? rev : 1)
      this.deltaY = this.v.y / slim * (inverted ? rev : 1)
      
      // Calculate heading rotation
      this.deltaHeading = this.vr - this.r
      let deltaHeading = this.deltaHeading == 0 ? 0 : (this.deltaHeading + Math.PI) % (2*Math.PI) - Math.PI
      let deltaH = -1 * (deltaHeading > 0 ? -1 : 1) * Math.min( rot, Math.abs(deltaHeading) )
    
      // Resolve Deltas
      if (this.deltaX != 0) {
        this.x += this.deltaX
        this.deltaX = 0
        changed = true
      }
      if (this.deltaY != 0) {
        this.y += this.deltaY
        this.deltaY = 0
        changed = true
      }
      if (this.deltaHeading != 0) {
        this.deltaR = deltaHeading
        this.r += deltaH
        this.r  = this.r % (2 * Math.PI)
        this.deltaHeading = 0
        changed = true
      }
      
      /*** Update Collision Object ***/
      if (this?.collisionObject) {
        this.collisionObject.x = this.x
        this.collisionObject.y = this.y
        this.collisionObject.angle = -this.r
      }
      
      // Save data
      let deltaV = this.xv.m != this.v.m
      this.xv = clone(this.v)
      // Return
      return [changed, inverted, deltaV, deltaRotation, deltaR, deltaHeading, deltaH]
    }
    computeRender(changed, inverted, deltaV, deltaRotation, deltaR, deltaHeading, deltaH) {
      let ta    = settings.game.turn_angle
      let tfa   = settings.game.turn_f_angle
      /* Set the model instructions */
      let instructions = [`base`]
      let alter = this.anim.instructions.length == 0 ? true : false
      let pm    = this.anim.thrust
      
      // if (this.isPlayer) document.querySelector(`#${settings.hud.id_dev}`).textContent = changed + ' , ' + inverted + ' , ' + deltaRotation + ' , ' + deltaR + ' , ' + deltaHeading + ' , ' + deltaH
      // Thrust animation
      if (deltaV || deltaRotation != 0) {
        alter = true
        if (!inverted) {
          for (var i = 0; i < pm.length; i++) {
            let f = pm[i]
            if (this.v.m >= f.velocity) {
              instructions = instructions.concat( f.instructionKeys )
              break
            }
          }
        } else {
          for (var i = pm.length - 1; i > -1; i--) {
            let f = pm[i]
            if (this.v.m >= Math.abs(f.velocity)) {
              instructions = instructions.concat( f.instructionKeys )
              break
            }
          }
        }
      }
      instructions = instructions.filter(i => i.length > 0)
      // Rotation animation
      let r = ``
      if (deltaH != 0) {
        alter = true
        if (deltaH < 0) {
          r = Math.abs(deltaHeading) < tfa ? `right_thrust` : `right_hard_thrust`
        } else if (deltaH > 0) {
          r = Math.abs(deltaHeading) < tfa ? `left_thrust` : `left_hard_thrust`
        }
      } else if (deltaR != 0
        && Math.abs(deltaR) > ta
        && Math.abs(deltaR) < (Math.PI - ta)
        && this.v.m >= pm[pm.length-1].velocity
        && this.v.m != 0) 
      {
        alter = true
        r = deltaR < 0 ? `right_thrust` : `left_thrust`
      }
      if (r.length) instructions.push( r )
      if (alter) this.anim.instructions = instructions
    }
    render(canvas, transform, player, scaleFactor, upsize = true) {
      let m = libget( this.anim.model )
      let i = m.compose( this.anim.instructions )
      let t = m.height // upsize ? settings.game.size_unit : 2
      let f = settings.game.size_unit / (player?.anim.height ? player?.anim.height : m.height)
      //console.log(this.k, f, player?.h)
      let r = player ? player.r : this.r
      
      let mods = [
        { instruction: `translate`, args: [ transform.left, transform.top ] },
        // { instruction: `rotate`,    args: [ this.r ] },
      ]
      if (!this.isPlayer) {
        mods.push({ instruction: `translate`, args: [ (this.x - player.x)/scaleFactor, (-this.y - -player.y) / scaleFactor ] })
      }
      mods.push({ instruction: `rotate`, args: [ this.r ] })
      
      librender( canvas, mods, i, [ m.width/2 * f , m.height/2 * f ] )
    }
  }
  
  class Player extends Actor {
    constructor(key, options) {
      super(key, options)
    }
    updated() {
      let osn = this.sector.name
      this.sector = this.getSector()
      if (osn != this.sector.name) {
        return osn
      }
      return false
    }
  }
  
  class Projectile extends Actor {
    constructor(key, options) {
      options.t = 'projectile'
      super(key, options)
    }
  }
  
  class Star extends Artefact {
    constructor(key, options) {
      options.t = 'star'
      super(key, options)
    }
  }

  return {
    /* Metadata constructs */
    /* WebGL constructs */
    Unit  : Unit,
    /* Engine constructs */
    player    : Player,
    actor     : Actor,
    tile      : Tile,
    projectile: Projectile,
  }
})()