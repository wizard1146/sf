sf = typeof sf != 'undefined' ? sf : {}

sf.library = (function() {
  /* Meta variables */
  let clone   = sf.utilities.clone

  let library = {}
  
  let raster  = new Image()
      raster.src = `assets/raster.png`

  /* Functions */
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
          let args = clone(v.args)
              args.splice(args.indexOf(`raster`), 1, raster)
          const p = ctx[v.instruction]( ...(args) )
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
    retrieve : function(key) { return library[key]?.returns() },
    register : register,
    render   : render,
  }
})()
