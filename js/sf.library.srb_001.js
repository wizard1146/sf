sf = typeof sf != 'undefined' ? sf : {}

sf.library = typeof sf.library != 'undefined' ? sf.library : {}

sf.library.register(`SRB-001`, {
  returns: function() {
    return {
      model        : this.name,
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
      }
    }
  },
  name  : `SRB-001`,
  width : 280,
  height: 400,
  colors: {
    engine_003_t01   : `rgba( 241, 241, 241, 0.34 )`,
    engine_002_t01   : `rgba(  40,  75,  82, 0.94 )`,
    engine_002_t02   : `rgba(  66, 170, 189, 0.94 )`,
    engine_002_t03   : `rgba( 132, 217, 232, 0.94 )`,
    engine_001_t01   : `rgba(   2,  64,  74, 0.94 )`,
    engine_001_t02   : `rgba(   7, 101, 117, 0.94 )`,
    engine_001_t03   : `rgba(  14, 132, 153, 0.94 )`,
    body_002_fill    : `rgba( 125,  43,  37, 1.00 )`,
    body_002_stroke  : `rgba( 255,  23,  23, 0.33 )`,
    body_001_fill    : `rgba(  99,  69,  69, 1.00 )`,
    body_001_stroke  : `rgba( 177,  44,  44, 0.31 )`,
    body_glass_fill  : `rgba(  76, 104, 115, 0.11 )`,
    body_glass_stroke: `rgba( 177,  44,  44, 0.23 )`,
    reverse_t01      : `rgba(  82,  37,  33, 0.86 )`,
    reverse_t02      : `rgba(   7, 101, 117, 0.86 )`,
    reverse_t03      : `rgba(  66, 170, 189, 0.86 )`,
  },
  instructions: {
    [`base`]: [
      {key: `engine_002`,           fill: `engine_002_t01`,  stroke: null },
      {key: `engine_001`,           fill: `engine_001_t01`,  stroke: null },
      {key: `raster:engine_001`,    fill: `engine_001_t01`,  stroke: null },
      {key: `body_002`,             fill: `body_002_fill`,   stroke: `body_002_stroke` },
      {key: `raster:body_002`,      fill: `body_002_fill`,   stroke: `body_002_stroke` },
      {key: `body_001`,             fill: `body_001_fill`,   stroke: null },
      {key: `raster:body_001`,      fill: `body_001_fill`,   stroke: `body_001_stroke` },
      {key: `body_glass`,           fill: `body_glass_fill`, stroke: `body_glass_stroke` },
      {key: `right_001`,            fill: `engine_001_t01`,  stroke: null },
      {key: `left_001`,             fill: `engine_001_t01`,  stroke: null },
      {key: `reverse_left`,         fill: `reverse_t01`,     stroke: null },
      {key: `reverse_right`,        fill: `reverse_t01`,     stroke: null },
      {key: `offwing_left`,         fill: `body_002_fill`,   stroke: `body_001_stroke` },
      {key: `raster:offwing_left`,  fill: `body_002_fill`,   stroke: `body_001_stroke` },
      {key: `offwing_right`,        fill: `body_002_fill`,   stroke: `body_001_stroke` },
      {key: `raster:offwing_right`, fill: `body_002_fill`,   stroke: `body_001_stroke` },
    ],
    [`offwing_reverse`]: [
      {key: `offwing_left_reverse`,         fill: `body_002_fill`,  stroke: `body_001_stroke` },
      {key: `raster:offwing_left_reverse`,  fill: `body_002_fill`,  stroke: `body_001_stroke` },
      {key: `offwing_right_reverse`,        fill: `body_002_fill`,  stroke: `body_001_stroke` },
      {key: `raster:offwing_right_reverse`, fill: `body_002_fill`,  stroke: `body_001_stroke` },
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
  sequence: [
    `engine_003`,`engine_002`,`engine_001`,
    `body_002`,`body_001`,`body_glass`,
    `offwing_right`,`offwing_left`,`offwing_right_reverse`,`offwing_left_reverse`,
    `right_001`,`left_001`,
    `reverse_right`,`reverse_left`,
  ],
  raster: [
      {instruction: `clip`, args: [] },
      {instruction: `createPattern`, args: [`raster`, `repeat`] },
    ],
  build : {
    engine_001: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
        {instruction: `lineTo`, args: [ 0.65,0.50] },
      ],
    engine_002: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.39,0.87] },
        {instruction: `lineTo`, args: [ 0.00,0.83] },
        {instruction: `lineTo`, args: [-0.39,0.87] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
        {instruction: `lineTo`, args: [ 0.65,0.50] },
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
        {instruction: `lineTo`, args: [ 0.65,0.50] },
      ],
    body_002: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
      ],
    body_001: [
        {instruction: `moveTo`, args: [  0.00,-0.35] },
        {instruction: `lineTo`, args: [ -0.31, 0.10] },
        {instruction: `lineTo`, args: [ -0.10, 0.31] },
        {instruction: `lineTo`, args: [  0.10, 0.31] },
        {instruction: `lineTo`, args: [  0.31, 0.10] },
        {instruction: `lineTo`, args: [  0.00,-0.35] },
      ],
    body_glass: [
        {instruction: `moveTo`, args: [ -0.16, 0.10] },
        {instruction: `lineTo`, args: [ -0.10, 0.31] },
        {instruction: `lineTo`, args: [  0.10, 0.31] },
        {instruction: `lineTo`, args: [  0.16, 0.10] },
        {instruction: `lineTo`, args: [  0.00,-0.35] },
        {instruction: `lineTo`, args: [ -0.16, 0.10] },
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
        {instruction: `moveTo`, args: [  0.600,  0.20] },
        {instruction: `lineTo`, args: [  0.590,  0.44] },
        {instruction: `lineTo`, args: [  0.725,  0.62] },
        {instruction: `lineTo`, args: [  0.820,  0.64] },
        {instruction: `lineTo`, args: [  0.600,  0.20] },
      ],
    reverse_left: [
        {instruction: `moveTo`, args: [ -0.600,  0.20] },
        {instruction: `lineTo`, args: [ -0.590,  0.44] },
        {instruction: `lineTo`, args: [ -0.725,  0.62] },
        {instruction: `lineTo`, args: [ -0.820,  0.64] },
        {instruction: `lineTo`, args: [ -0.600,  0.20] },
      ],
    offwing_left: [
        {instruction: `moveTo`, args: [ -0.815,  0.50] },
        {instruction: `lineTo`, args: [ -1.080,  1.04] },
        {instruction: `lineTo`, args: [ -1.095,  0.95] },
        {instruction: `lineTo`, args: [ -0.900,  0.55] },
        {instruction: `lineTo`, args: [ -0.815,  0.50] },
      ],
    offwing_right: [
        {instruction: `moveTo`, args: [  0.815,  0.50] },
        {instruction: `lineTo`, args: [  1.080,  1.04] },
        {instruction: `lineTo`, args: [  1.095,  0.95] },
        {instruction: `lineTo`, args: [  0.900,  0.55] },
        {instruction: `lineTo`, args: [  0.815,  0.50] },
      ],
    offwing_left_reverse: [
        {instruction: `moveTo`, args: [ -0.855,  0.507] },
        {instruction: `lineTo`, args: [ -1.080,  1.040] },
        {instruction: `lineTo`, args: [ -1.102,  0.955] },
        {instruction: `lineTo`, args: [ -0.938,  0.560] },
        {instruction: `lineTo`, args: [ -0.855,  0.507] },
      ],
    offwing_right_reverse: [
        {instruction: `moveTo`, args: [  0.855,  0.507] },
        {instruction: `lineTo`, args: [  1.080,  1.040] },
        {instruction: `lineTo`, args: [  1.102,  0.955] },
        {instruction: `lineTo`, args: [  0.938,  0.560] },
        {instruction: `lineTo`, args: [  0.855,  0.507] },
      ],
  },
  compose: function(series) {
    let output = []
    
    // pre-processing
    let offwing_reverse = false
    if (series.indexOf(`offwing_reverse`) != -1) offwing_reverse = true
    
    // assemble
    for (var i = series.length - 1; i > -1; i--) {
      let m = series[i]
      let g = this.instructions[m]
      
      // only add to output if it does not exist
      g.forEach(item => {
        if (output.filter(v => v.key == item.key).length === 0) output.push(item)
      })
      if (offwing_reverse) output = output.filter(v => [`offwing_right`,`raster:offwing_right`,`offwing_left`,`raster:offwing_left`].indexOf(v.key) == -1)
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