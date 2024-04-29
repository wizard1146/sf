sf = typeof sf != 'undefined' ? sf : {}

sf.library = (function() {
  /* Meta variables */
  let clone   = sf.utilities.clone

  let library = {}
 
 
  let register = function(key, payload) {
    library[key] = payload
  }
  
  let render = function(canvas, transformations, payload, targetMatrix ) {
    let ctx = canvas.getContext('2d')
    
    // close any paths
    ctx.closePath()
    // save context
    ctx.save()
    // apply transformations
    transformations.forEach(transform => {
      ctx[transform.instruction]( ...transform.args )	
    })
    // render the asset
    payload.forEach(instruction => {
      let internalRestore = false
      if (Object.entries(instruction.directions).filter(([k,v],i) => v.instruction == `clip`).length > 0) {
        ctx.save()
        internalRestore = true
      }
      ctx.beginPath()
      instruction.directions.forEach( v => {
        if (v.instruction == `drawImage`) {
          ctx[v.instruction]( ...(v.args).map((e,i) => i === 0 ? e : e * targetMatrix[i-1]) )
        } else if (v.instruction == `createPattern`) {
          const p = ctx[v.instruction]( ...(v.args) )
          instruction.fill = p
        } else if (v.instruction == `createLinearGradient`) {
          // Make some assumptions here: that targetMatrix[0] & [1] represent X & Y
          let m = clone(v.args)
          let n = m.splice(4)
          let t = targetMatrix.concat(targetMatrix)
          let u = n.reduce(function(r,v,i,a) {
            if ( i % 2 === 0 ) r.push( a.slice( i, i + 2) )
            return r 
          }, [])
          const g = ctx[v.instruction]( ...(m).map((e,i) => e * t[i]) )
          u.forEach(stop => {
            g.addColorStop( stop[0], stop[1] )
          })
          instruction.fill = g
        } else {
          ctx[v.instruction]( ...(v.args).map((e,i) => e * targetMatrix[i]) )
        }
      })
      if (instruction.fill) { ctx.fillStyle = instruction.fill; ctx.fill(); }
      if (instruction.stroke) { ctx.strokeStyle = instruction.stroke; ctx.stroke(); }
      ctx.closePath()
      if (internalRestore) ctx.restore()
      ctx.strokeStyle = '#000'
      ctx.fillStyle   = '#000'
    })
    // restore context
    ctx.restore()
  }

  return {
    get      : function(key) { return library[key] },
    register : register,
    render   : render,
  }
})()

/*

sf.library.render( canvas, [
  { instruction: `translate`, args: [ transform.left, transform.top ] },
  { instruction: `rotate`, args: [ hero.r ] },
], sf.library.get(`SRB-001-flare-2`), [280/2, 400/2] )
*/

let raster = new Image()
    raster.src = `assets/raster.png`

sf.library.register(`SRB-001`, {
  width : 280,
  height: 400,
  colors: {
    engine_003_t01 : `rgba( 241, 241, 241, 0.34 )`,
    engine_002_t01 : `rgba(  40,  75,  82, 0.94 )`,
    engine_002_t02 : `rgba(  66, 170, 189, 0.94 )`,
    engine_002_t03 : `rgba( 132, 217, 232, 0.94 )`,
    engine_001_t01 : `rgba(   2,  64,  74, 0.94 )`,
    engine_001_t02 : `rgba(   7, 101, 117, 0.94 )`,
    engine_001_t03 : `rgba(  14, 132, 153, 0.94 )`,
    body_002_fill  : `rgba( 125,  43,  37, 1.00 )`,
    body_002_stroke: `rgba( 255,  23,  23, 0.33 )`,
    reverse_t01    : `rgba(  82,  37,  33, 0.86 )`,
    reverse_t02    : `rgba(   7, 101, 117, 0.86 )`,
    reverse_t03    : `rgba(  66, 170, 189, 0.86 )`,
  },
  raster: [
      {instruction: `clip`, args: [] },
      {instruction: `createPattern`, args: [raster, `repeat`] },
    ],
  build : {
    engine_001: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
    engine_002: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.39,0.87] },
        {instruction: `lineTo`, args: [ 0.00,0.83] },
        {instruction: `lineTo`, args: [-0.39,0.87] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
    engine_003: [
        {instruction: `createLinearGradient`, args: [ 0.00, 0, 0.00, 1.00, 
          0.85, `rgba( 241, 241, 241, 0.94 )`, 
          0.90, `rgba( 241, 241, 241, 0.88 )`,
          0.95, `rgba( 241, 241, 241, 0.55 )`,
          1.00, `rgba( 241, 241, 241, 0.33 )`,
          ]},
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.27,0.84] },
        {instruction: `lineTo`, args: [ 0.00,0.98] },
        {instruction: `lineTo`, args: [-0.27,0.84] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
    body_002: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
      ],
    body_001: [
    
      ],
    right_001: [
        {instruction: `moveTo`, args: [  0.27, -0.33] },
        {instruction: `lineTo`, args: [  0.34, -0.14] },
        {instruction: `lineTo`, args: [  0.44, -0.12] },
        {instruction: `lineTo`, args: [  0.32, -0.36] },
        {instruction: `lineTo`, args: [  0.27, -0.33] },
      ],
    left_001: [
        {instruction: `moveTo`, args: [ -0.27, -0.33] },
        {instruction: `lineTo`, args: [ -0.34, -0.14] },
        {instruction: `lineTo`, args: [ -0.44, -0.12] },
        {instruction: `lineTo`, args: [ -0.32, -0.36] },
        {instruction: `lineTo`, args: [ -0.27, -0.33] },
      ],
    reverse_right: [
        {instruction: `moveTo`, args: [  0.095, -0.81] },
        {instruction: `lineTo`, args: [  0.090, -0.66] },
        {instruction: `lineTo`, args: [  0.170, -0.67] },
        {instruction: `lineTo`, args: [  0.095, -0.81] },
      ],
    reverse_left: [
        {instruction: `moveTo`, args: [ -0.095, -0.81] },
        {instruction: `lineTo`, args: [ -0.090, -0.66] },
        {instruction: `lineTo`, args: [ -0.170, -0.67] },
        {instruction: `lineTo`, args: [ -0.095, -0.81] },
      ],
  },
  sequence: [
    `engine_003`,`engine_002`,`engine_001`,
    `body_002`,`body_001`,
    `right_001`,`left_001`,
    `reverse_right`,`reverse_left`,
  ],
  instructions: {
    [`base`]: [
      {key: `engine_002`,        fill: `engine_002_t01`, stroke: null },
      {key: `engine_001`,        fill: `engine_001_t01`, stroke: null },
      {key: `raster:engine_001`, fill: `engine_001_t01`, stroke: null },
      {key: `body_002`,          fill: `body_002_fill`, stroke: `body_002_stroke` },
      {key: `raster:body_002`,   fill: `body_002_fill`, stroke: `body_002_stroke` },
      {key: `right_001`,         fill: `engine_001_t01`, stroke: null },
      {key: `left_001`,          fill: `engine_001_t01`, stroke: null },
      {key: `reverse_left`,      fill: `reverse_t01`, stroke: null },
      {key: `reverse_right`,     fill: `reverse_t01`, stroke: null },
    ],
    [`forward_01`]: [
      {key: `engine_002`,        fill: `engine_002_t02`, stroke: null },
      {key: `engine_001`,        fill: `engine_001_t02`, stroke: null },
    ],
    [`forward_02`]: [
      {key: `engine_003`,        fill: `engine_003_t01`, stroke: null },
      {key: `engine_002`,        fill: `engine_002_t03`, stroke: null },
      {key: `engine_001`,        fill: `engine_001_t03`, stroke: null },
    ],
    [`left_thrust`]: [
      {key: `left_001`,          fill: `engine_001_t02`, stroke: null },
    ],
    [`right_thrust`]: [
      {key: `right_001`,         fill: `engine_001_t02`, stroke: null },
    ],
    [`left_hard_thrust`]: [
      {key: `left_001`,          fill: `engine_002_t03`, stroke: null },
    ],
    [`right_hard_thrust`]: [
      {key: `right_001`,         fill: `engine_002_t03`, stroke: null },
    ],
    [`reverse_01`]: [
      {key: `reverse_left`,      fill: `reverse_t02`, stroke: null },
      {key: `reverse_right`,     fill: `reverse_t02`, stroke: null },
    ],
    [`reverse_02`]: [
      {key: `reverse_left`,      fill: `reverse_t03`, stroke: null },
      {key: `reverse_right`,     fill: `reverse_t03`, stroke: null },
    ],
  },
  compose: function(series) {
    let output = []
    
    // assemble
    for (var i = series.length - 1; i > -1; i--) {
      let m = series[i]
      let g = this.instructions[m]
      
      // only add to output if it does not exist
      g.forEach(item => {
        if (output.filter(v => v.key == item.key).length === 0) output.push(item)
      })
    }
    
    // sort
    let r = output.filter(v => v.key.match('raster:'))
    let h = output.filter(v => !v.key.match('raster:'))
    h.sort((a,b) => this.sequence.indexOf(a.key) - this.sequence.indexOf(b.key))
    // re-insert rasters
    let p   = h.map(k => k.key)
    let inc = 1
    for (var i = 0; i < r.length; i++) {
      let f = r[i]
      let e = f.key.replace('raster:','')
      h.splice( p.indexOf(e) + inc, 0, f )
      inc++
    }
    // replace with final instruction sets
    output = h.map(function(i) {
      let k = i.key.replace('raster:','')
      let y = i.key.match('raster:')
      
      let g = this.build[k]
    
      if (y) g = g.concat(this.raster)
      
      let d = {
        directions: g,
        fill      : i.fill   ? this.colors[i.fill]   : null,
        stroke    : i.stroke ? this.colors[i.stroke] : null,
      }
      
      return d
    }.bind(this))
    
    return output
  },
})