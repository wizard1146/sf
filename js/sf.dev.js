sf = typeof sf != 'undefined' ? sf : {}

sf.dev = (function() {
  /* Module Settings & Events */
  let settings   = sf.settings.get()
  
  /* Memory */
  let display;
  
  let log = []
  let log_index = 0
  let log_limit = 1000

  let show = function(...args) {
    if (typeof display == 'undefined') display = document.querySelector(`#${settings.hud.id_dev}`)
    
    display.textContent = args
  }
  
  let append = function(data) {
    log[log_index] = {time: Date.now(), performance_now: performance.now(), data: data}
    log_index++
    if (log.length > log_limit) {
      log_index = 0
    }
  }

  return {
    log : append,
    show: show,
    glog: function() { return log },
  }
})()