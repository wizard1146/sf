sf = typeof sf != 'undefined' ? sf : {}

sf.library = typeof sf.library != 'undefined' ? sf.library : {}

sf.library.register(`SCIP`, {
  returns: function() {
    return {
      model : this.name,
      width : this.width,
      height: this.height,
      thrust: [
        { velocity:  85, instructionKeys: [`forward_02`] },
        { velocity:  40, instructionKeys: [`forward_01`] },
        { velocity:   0, instructionKeys: [`base`] },
        { velocity: -40, instructionKeys: [`offwing_reverse`,`reverse_01`] },
        { velocity: -85, instructionKeys: [`offwing_reverse`,`reverse_02`] },
      ],
      turns: {
        soft:  7.5 * Math.PI/180,
        hard: 11.5 * Math.PI/180,
      },
      collisionBounds: Object.entries(this.build[`body_002`]).map(([k,v],i) => v.args),
    }
  },
  name  : `SCIP`,
  type  : `projectile`,
  width : 30,
  height: 43,
  colors: {
    body_002_fill    : `rgba( 189, 112,  57, 1.00 )`,
    body_002_stroke  : `rgba( 158,  87,  36, 1.00 )`,
    body_001_stroke  : `rgba( 189, 112,  57, 0.41 )`,
  },
  instructions: {
    [`base`]: [
      {key: `body_002`,             fill: `body_002_fill`,   stroke: `body_002_stroke` },
      {key: `flare_left`,           fill: `body_002_fill`,   stroke: `body_001_stroke` },
      {key: `flare_right`,          fill: `body_002_fill`,   stroke: `body_001_stroke` },
    ],
  },
  sequence: [
    `flare_right`,`flare_left`,
    `body_002`,`body_001`,
  ],
  raster: [
      {instruction: `clip`, args: [] },
      {instruction: `createPattern`, args: [`raster`, `repeat`] },
    ],
  build : {
    body_002: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-0.34,-0.63] },
        {instruction: `lineTo`, args: [-0.31, 0.70] },
        {instruction: `lineTo`, args: [-0.26, 0.76] },
        {instruction: `lineTo`, args: [ 0.26, 0.76] },
        {instruction: `lineTo`, args: [ 0.31, 0.70] },
        {instruction: `lineTo`, args: [ 0.34,-0.63] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
      ],
    flare_right: [
        {instruction: `moveTo`, args: [  0.310,  0.00] },
        {instruction: `lineTo`, args: [  0.300,  0.24] },
        {instruction: `lineTo`, args: [  0.435,  0.42] },
        {instruction: `lineTo`, args: [  0.530,  0.44] },
        {instruction: `lineTo`, args: [  0.310,  0.00] },
      ],
    flare_left: [
        {instruction: `moveTo`, args: [ -0.310,  0.00] },
        {instruction: `lineTo`, args: [ -0.300,  0.24] },
        {instruction: `lineTo`, args: [ -0.435,  0.42] },
        {instruction: `lineTo`, args: [ -0.530,  0.44] },
        {instruction: `lineTo`, args: [ -0.310,  0.00] },
      ],
  },
  compose: function(series) {
    let output = []
    
    // pre-processing
    
    // assemble
    for (var i = series.length - 1; i > -1; i--) {
      let m = series[i]
      
      let g = this.instructions[m]
      
      // only add to output if it does not exist
      if (g && g.length) {
        g.forEach(item => {
          if (output.filter(v => v.key == item.key).length === 0) output.push(item)
        })
      }
    }
    
    // sort
    let r = output.filter(v => v.key.match('raster:'))
    let h = output.filter(v => !v.key.match('raster:'))
    h.sort((a,b) => this.sequence.indexOf(a.key) - this.sequence.indexOf(b.key))
    // re-insert rasters
    let p   = h.map(k => k.key)
    
    r.forEach(k => {
      k.parent = k.key.replace('raster:','')
      k.ni     = p.indexOf( k.parent )
    })
    r.sort((a,b) => a.ni < b.ni ? 1 : a.ni > b.ni ? -1 : 0) // big to small
    r.forEach(k => {
      h.splice( k.ni + 1, 0, k )
    })
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