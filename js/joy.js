/*
  Adapted from https://github.com/bobboteck/JoyStick, MIT license contained herein:

  * The MIT License (MIT)
  *
  *  This file is part of the JoyStick Project (https://github.com/bobboteck/JoyStick).
  *	Copyright (c) 2015 Roberto D'Amico (Bobboteck).
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  * 
  * The above copyright notice and this permission notice shall be included in all
  * copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  * SOFTWARE.
 */

let Joy = (function() {
  let defaults = {
    /* IDs */
    rotation_invert  : false,
    rotation_offset  : 0,
    /* Behaviours */
    auto_return      : true,
    /* Dimensions */
    canvas_width     : 180,
    canvas_height    : 180,
    radii_increment  : 10,
    internal_radius  : (180 - (10 + 180/2))/2,
    external_margin  : 30,
    max_margin       : 5,
    /* Styling */
    external_line    : 2,
    external_stroke  : `rgba(   0, 128,   0, 1.00 )`,
    internal_line    : 2,
    internal_stroke  : `rgba(   0, 144,  13, 1.00 )`,
    internal_fill    : `rgba( 133,  14,  13, 1.00 )`,
  }
  let canvasTemplate = `<canvas id="ID_CANVAS" height="CANVAS_HEIGHT" width="CANVAS_WIDTH"></canvas>`

  class joystick {
    constructor(container, options, callback) {
      // Memory
      this.epx     = 0
      this.epy     = 0
      this.ipx     = 0
      this.ipy     = 0
      this.rx      = 0
      this.ry      = 0
      // These will be overwritten and define the thresholds for determining cardinality
      this.pul     =  1 
      this.nul     = -1
      this.psl     =  1
      this.nsl     = -1
      // IDs 
      this.id_container = container
      this.id_canvas    = options?.title ? options?.title : container + '-joystick'
      // Representation 
      this.canvas_width    = options?.width  ? options?.width  : defaults.canvas_width
      this.canvas_height   = options?.height ? options?.height : defaults.canvas_height
      // these really shouldn't be messed with
      this.radii_increment = defaults.radii_increment
      this.external_margin = defaults.external_margin
      this.max_margin      = defaults.max_margin
      // Representation (cont.)
      this.ir              = (this.canvas_width - (this.radii_increment + (this.canvas_width/2)))/2
      this.er              = this.ir + defaults.external_margin
      this.max             = this.ir + defaults.max_margin
      // Style
      this.elw = options?.externalLineWidth   ? options?.externalLineWidth   : defaults.external_line
      this.ess = options?.externalStrokeColor ? options?.externalStrokeColor : defaults.external_stroke
      this.ilw = options?.internalLineWidth   ? options?.internalLineWidth   : defaults.internal_line
      this.iss = options?.internalStrokeColor ? options?.internalStrokeColor : defaults.internal_stroke
      this.ifi = options?.internalFillColor   ? options?.internalFillColor   : defaults.internal_fill
      // Behaviour
      this.auto_return     = typeof options?.autoReturnToCenter != 'undefined' ? options?.autoReturnToCenter : defaults.auto_return
      this.rotation_invert = typeof options?.rotation_invert    != 'undefined' ? options?.rotation_invert    : defaults.rotation_invert
      this.rotation_offset = typeof options?.rotation_offset    != 'undefined' ? options?.rotation_offset    : defaults.rotation_offset
      // Computational
      this.toucher      = null
      this.mouser       = false
      this.callback     = callback ? callback : function(){}

      // OK, go.
      this.prepare()
    }
    prepare() {
      this.container = document.getElementById( this.id_container )
      this.container.style.touchAction = 'none' /* important! */
      this.renderCanvas()
      this.render()
      // Touch prep
      if ('ontouchstart' in document.documentElement) {
        this.canvas.addEventListener('touchstart', this.touch.bind(this), false)
        document.addEventListener('touchmove', this.touching.bind(this), false)
        document.addEventListener('touchend',  this.touched.bind(this), false)
      } else {
        this.canvas.addEventListener('mousedown', this.mouse.bind(this), false)
        document.addEventListener('mousemove', this.mousing.bind(this), false)
        document.addEventListener('mouseup', this.moused.bind(this), false)
      }
    }
    /* Drawing functions, no computations */
    renderCanvas() {
      // Maximise size if width and height are unstipulated
      if (this.canvas_width  == 0) { this.canvas.width  = this.container.clientWidth  }
      if (this.canvas_height == 0) { this.canvas.height = this.container.clientHeight }
      // Inject the canvas
      this.container.insertAdjacentHTML( `beforeend`, canvasTemplate
         .replace( `ID_CANVAS`, this.id_canvas ) 
         .replace( `CANVAS_WIDTH`, this.canvas_width )
         .replace( `CANVAS_HEIGHT`, this.canvas_height )
      )
      // Shorthand references
      this.canvas  = document.getElementById( this.id_canvas )
      this.context = this.canvas.getContext('2d')

      // Calculations: Radii
      this.ir  = (this.canvas.width - (this.radii_increment + (this.canvas.width/2)))/2
      this.er  = this.ir + this.external_margin
      this.max = this.ir + this.max_margin
      // Calculations: Reference points
      this.ipx = this.canvas.width / 2
      this.ipy = this.canvas.height / 2
      this.rx  = this.ipx
      this.ry  = this.ipy
      this.epx = this.ipx
      this.epy = this.ipy
      // Calculations: Cardinality thresholds
      this.pul = this.canvas.width / 10 
      this.nul = this.pul * -1
      this.psl = this.canvas.height / 10
      this.nsl = this.psl * -1
    }
    // This will be the render called on loop
    render() {
      this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height )
      this.renderOuter()
      this.renderInner()
    }
    renderOuter() {
      this.renderCircle( this.epx, this.epy, this.er, this.elw, this.ess )
    }
    renderInner() {
      this.renderCircle( this.ipx, this.ipy, this.ir, this.ilw, this.iss, true, this.rx, this.ry, this.ifi )
    }
    // Conditional circle render 
    renderCircle( x, y, r = defaults.external_size, lw, ss, g, rx, ry, ifc = defaults.internalFillColor ) {
      this.context.beginPath()
      this.context.arc( rx ? rx : x, ry ? ry : y, r, 0, Math.PI * 2, false )
      this.context.lineWidth = lw
      this.context.strokeStyle = ss
      this.context.stroke()
      if (g) {
        let gd = this.context.createRadialGradient( x, y, 5, x, y, 200 )
            gd.addColorStop( 0, ifc )
            gd.addColorStop( 1,  ss )
        this.context.fillStyle = gd
        this.context.fill()
      }
      this.context.closePath()
    }

    /* Payload function */
    payload() {
      let x = ((this.rx - this.ipx)/this.max *  100).toFixed()
      let y = ((this.ry - this.ipy)/this.max * -100).toFixed()
      return {
        xPosition: this.rx,
        yPosition: this.ry,
        x        : x,
        y        : y,
        cardinalDirection: this.getCardinal(),
        rotation : this.getRotation( x, y ),
      }
    }
    getCardinal() {
       let outp = ''
       let x   = this.rx - this.ipx
       let y   = this.ry - this.ipy
       if (y >= this.nul && y <= this.pul) { outp = 'C' }
       if (y < this.nul) { outp = 'N' }
       if (y > this.pul) { outp = 'S' }
       if (x < this.nsl) {
         if ( outp === 'C' ) {
           outp  = 'W'
         } else {
           outp += 'W'
         }
       }
       if (x > this.psl) {
         if ( outp === 'C' ) {
           outp  = 'E'
         } else {
           outp += 'E'
         }
       }
       return outp
    }
    getRotation( x, y, invert = this.rotation_invert, offset = this.rotation_offset ) {
      let r = Math.atan2( y, x ) * 180 / Math.PI + offset
      if (r > 0) r -= 360
      if (invert) r *= -1
      return (r * Math.PI) / 180
    }

    /* Touch functions */
    touch(e) {
      this.toucher = e.targetTouches[0].identifier
    }
    touching(e) {
      // Failure conditions
      if (!this.toucher) return
      if (!e.targetTouches[0].target == this.canvas) return

      this.rx = e.targetTouches[0].pageX
      this.ry = e.targetTouches[0].pageY
      // Handle offset
      if (this.canvas.offsetParent.tagName.toUpperCase() === 'BODY') {
        this.rx -= this.canvas.offsetLeft
        this.ry -= this.canvas.offsetTop
      } else {
        this.rx -= this.canvas.offsetParent.offsetLeft
        this.ry -= this.canvas.offsetParent.offsetTop
      }
      // Place limitations
      if (this.rx < this.ir) { this.rx = this.max }
      if (this.ry < this.ir) { this.ry = this.max }
      if (this.rx + this.ir > this.canvas.width ) { this.rx = this.canvas.width  - this.max }
      if (this.ry + this.ir > this.canvas.height) { this.ry = this.canvas.height - this.max }
      // Render
      this.render()
      // Callback
      this.callback(this.payload())
    }
    touched(e) {
      if (e.changedTouches[0].identifier !== this.toucher) return
      // Return to the origin
      if (this.auto_return) { 
        this.rx = this.ipx
        this.ry = this.ipy
      }
      // Render
      this.render()
      // Callback
      this.callback(this.payload(), true)
    }

    /* Mouse functions */
    mouse(e) {
      if (e.target.id == this.id_canvas) this.mouser = true
    }
    mousing(e) {
      // Failure conditions
      if (!this.mouser) return
      // if (e.target.id != this.id_canvas) return
      
      this.rx = e.pageX
      this.ry = e.pageY
      // Handle offset
      if (this.canvas.offsetParent.tagName.toUpperCase() === 'BODY') {
        this.rx -= this.canvas.offsetLeft
        this.ry -= this.canvas.offsetTop
      } else {
        this.rx -= this.canvas.offsetParent.offsetLeft
        this.ry -= this.canvas.offsetParent.offsetTop
      }
      // Place limitations
      if (this.rx < this.ir) { this.rx = this.max }
      if (this.ry < this.ir) { this.ry = this.max }
      if (this.rx + this.ir > this.canvas.width ) { this.rx = this.canvas.width  - this.max }
      if (this.ry + this.ir > this.canvas.height) { this.ry = this.canvas.height - this.max }
      // Render
      this.render()
      // Callback
      this.callback(this.payload())
    }
    moused(e) {
      // Return to the origin
      if (this.auto_return) { 
        this.rx = this.ipx
        this.ry = this.ipy
      }
      // Render
      this.render()
      // Callback
      if (this.mouser) this.callback(this.payload(), true)
      this.mouser = false
    }

    getX()   { return this.x }
    getY()   { return this.y }
    getDir() { return this.dir }
    getWidth()   { return this.canvas.width }
    getHeight()  { return this.canvas.height }
    getOffsetX() { return this.offsetX }
    getOffsetY() { return this.offsetY }
  }

  return {
    Stick: joystick,
  }
})()
