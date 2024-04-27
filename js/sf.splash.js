sf = typeof sf != 'undefined' ? sf : {}

sf.splash = (function() {
  let qset          = function(selector) { let b = document.querySelectorAll( selector ); return b?.length > 1 ? b : document.querySelector( selector ) }
  let sleep         = function(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
  let CSSIdentifier = `sf-splash-css`
  let defaults = {
    zIndex    : 50,
    background: `assets/splash_001.png`,
    width     : 1200,
    height    : 1200,
    pointer   : `assets/daidai.gif`,
    gain      : 1,
    delay     : 1300,
    fade      : 3000,
  }
  let id = {
    main             : `sf-splash-main`,
    background       : `sf-splash-background`,
    background_filter: `sf-splash-background-filter`,
    content          : `sf-splash-content`,
    fader            : `sf-splash-fader`,
    fader_keyframes  : `sf-splash-fader-keyframes`,
    loader           : `sf-splash-loader`,
  }

  class Splash {
    constructor(options = {}) {
      Object.entries(defaults).forEach(([k,v],i) => {
        if (typeof options[k] != 'undefined') {
          this[k] = options[k]
        } else {
          this[k] = v
        }
      })
      if (options && options?.lines) {
        this.parallels = []
        options.lines.forEach(line => {
          this.parallels.push({
            key     : line,
            progress: 0,
            limit   : 100,
            count   : 0,
            max     : options?.max,
          })
        })
      }
    }
    async * start() {
      // add CSS
      let rules = rulesTemplate
                    .replace(`DEFAULTS.BACKGROUND`, this.background)
                    .replace(`DEFAULTS.FADE`, this.fade)
      addCSS(rules)
      // add the Splash page
      let markup = markupTemplate
      document.body.insertAdjacentHTML(`beforeend`, markup)
      // add the Track
      this.parallels.forEach(parallel => {
        let loader = loaderTemplate
             .replace(`ID.LOADER`, id.loader + `-` + parallel.key)
        qset(`#${id.content}`).insertAdjacentHTML(`beforeend`, loader)
      })
      /* PAUSE */
      yield;
      
      /* CONTINUE */
      await sleep(this.delay)
      let main = qset(`#${id.main}`)
      // Fade
      main.classList.add(`${id.fader}`)
      await sleep(this.fade)
      // Clear
      main.remove()
      qset(`.${CSSIdentifier}`).remove()
    }
    getLine(which) {
      for (var i = 0; i < this.parallels.length; i++) {
        let line = this.parallels[i]
        if (line.key == which) {
          return [line, i]
        }
      }
    }
    updateLine(which, value, text) {
      let [line, index] = this.getLine(which)
      let completed = true
      // Update underlying
      this.parallels.forEach(parallel => {
        if (parallel.count < parallel.max) completed = false
      })
      // Visual Update
      return completed
    }
  }
  
  let markupTemplate = `
    <div id="${id.main}" class="absolute center fullscreen">
      <div id="${id.background}" class="fullscreen absolute"></div>
      <div id="${id.background_filter}" class="fullscreen absolute noise"></div>
      <div id="${id.content}" class="fullscreen absolute"></div>
    </div>
    `
  let loaderTemplate = `
    <div id="ID.LOADER" class="absolute center">
      <div class="label"></div>
      <div class="progress">
        <div class="line"></div>
        <div class="marker"></div>
        <div class="text"></div>
      </div>
      <div class="end-label"></div>
    </div>
  `
  let rulesTemplate  = `
    .absolute {
      position : absolute;
    }
    .fullscreen {
      width    : 100%;
      height   : 100%;
    }
    .center {
      left     : 50%;
      top      : 50%;
      transform: translate( -50%, -50% );
    }
    /* https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/ */
    .noise {
      background: rgba(68,0,255,0.13);
      background-image: url("data:image/svg+xml,%3C!-- svg: first layer --%3E%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.12' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.28' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
    #${id.main} {
    
    }
    #${id.background} {
      background-image: url(DEFAULTS.BACKGROUND);
      background-size : cover;
      filter          : contrast(1.33) grayscale(0) brightness(1.0);
    }
    #${id.background_filter} {
      filter          : brightness(0.33);
    }
    #${id.content} {
    
    }
    .${id.fader} {
      animation          : ${id.fader_keyframes} DEFAULTS.FADEms ease;
      animation-fill-mode: forwards;
    }
    @keyframes ${id.fader_keyframes} {
       0% { opacity: 1; }
     100% { opacity: 0; }
    }
  `
    
  /* Helper functions */
  let addCSS = function(r, c, i) {
    let rc = i ? i : CSSIdentifier
    qset(`.${rc}`)?.forEach(e => e.remove())
    let m = c ? qset(c) : document.body
    m.insertAdjacentHTML(`beforeend`, `<div class="${rc} hidden">&shy;<style>${r}</style></div>`)
  }

  return {
    Splash: Splash,
  }
})()