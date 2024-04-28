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


sf.library.register(`SRB-001-flare-0`, {
  width : 280,
  height: 400,
  instructions: [
    {
      fill: `rgba( 40, 75, 82, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.39,0.87] },
        {instruction: `lineTo`, args: [ 0.00,0.83] },
        {instruction: `lineTo`, args: [-0.39,0.87] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
     },
    {
      fill: `rgba( 2, 64, 74, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
     },
    {
      fill: `rgba( 14, 132, 153, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
        {instruction: `clip`, args: [] },
        {instruction: `createPattern`, args: [raster, `repeat`] },
      ],
     },
    {
      fill: `rgba( 125, 43, 37, 1.00 )`,
      stroke: `rgba( 255, 23, 23, 0.33 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
      ],
     },
    {
      directions: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
        {instruction: `clip`, args: [] },
        {instruction: `createPattern`, args: [raster, `repeat`] },
      ],
     },
  ]
})

sf.library.register(`SRB-001-flare-1`, {
  width : 280,
  height: 400,
  instructions: [
    {
      fill: `rgba( 66, 170, 189, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.39,0.87] },
        {instruction: `lineTo`, args: [ 0.00,0.83] },
        {instruction: `lineTo`, args: [-0.39,0.87] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
     },
    {
      fill: `rgba( 7, 101, 117, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
     },
    {
      fill: `rgba( 14, 132, 153, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
        {instruction: `clip`, args: [] },
        {instruction: `createPattern`, args: [raster, `repeat`] },
      ],
     },
    {
      fill: `rgba( 125, 43, 37, 1.00 )`,
      stroke: `rgba( 255, 23, 23, 0.33 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
      ],
     },
    {
      directions: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
        {instruction: `clip`, args: [] },
        {instruction: `createPattern`, args: [raster, `repeat`] },
      ],
     },
  ]
})

sf.library.register(`SRB-001-flare-2`, {
  width : 280,
  height: 400,
  instructions: [
    {
      fill: `rgba( 241, 241, 241, 0.94 )`,
      directions: [
        {instruction: `createLinearGradient`, args: [ 0.00, 0, 0.00, 1.00, 
          0.85, `rgba( 241, 241, 241, 0.94 )`, 
          0.90, `rgba( 241, 241, 241, 0.88 )`,
          0.95, `rgba( 241, 241, 241, 0.55 )`,
          1.00, `rgba( 241, 241, 241, 0.33 )`,
          ] },
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.27,0.84] },
        {instruction: `lineTo`, args: [ 0.00,0.98] },
        {instruction: `lineTo`, args: [-0.27,0.84] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
     },
    {
      fill: `rgba( 132, 217, 232, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.39,0.87] },
        {instruction: `lineTo`, args: [ 0.00,0.83] },
        {instruction: `lineTo`, args: [-0.39,0.87] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
     },
    {
      fill: `rgba( 14, 132, 153, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
      ],
     },
    {
      fill: `rgba( 14, 132, 153, 0.94 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.50,0.81] },
        {instruction: `lineTo`, args: [ 0.00,0.73] },
        {instruction: `lineTo`, args: [-0.50,0.81] },
        {instruction: `lineTo`, args: [-0.65,0.50] },
        {instruction: `lineTo`, args: [ 0.00,0.25] },
        {instruction: `clip`, args: [] },
        {instruction: `createPattern`, args: [raster, `repeat`] },
      ],
     },
    {
      fill: `rgba( 125, 43, 37, 1.00 )`,
      stroke: `rgba( 255, 23, 23, 0.33 )`,
      directions: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
      ],
     },
    {
      directions: [
        {instruction: `moveTo`, args: [ 0.00,-1.00] },
        {instruction: `lineTo`, args: [-1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00, 0.50] },
        {instruction: `lineTo`, args: [ 1.00, 1.00] },
        {instruction: `lineTo`, args: [ 0.00,-1.00] },
        {instruction: `clip`, args: [] },
        {instruction: `createPattern`, args: [raster, `repeat`] },
      ],
     },
  ]
})

/*

      let sy = len/2 * (1/2 + 1/8) // L/2
      let sx = -wid/2 * 1/4 // 1/4 * -W
      let ey = len/2 * (1 + 1/8)
      let ex = 0
      let flare = {
        length : 25,
      }
       con.moveTo( sx, sy )
       con.bezierCurveTo( sx + 0.45*sx, ey - 0.15*ey,  ex + 0.03*ex, ey - 0.05*ey,  ex, ey )
       con.moveTo( ex, ey )
       con.bezierCurveTo( ex - 0.03*ex, ey - 0.05*ey, -sx - 0.45*sx, ey - 0.15*ey, -sx, sy )
       con.arc( 0, sy, -sx, 0, Math.PI, true )
       con.stroke()
       con.fill()
 */