sf = typeof sf != 'undefined' ? sf : {}

sf.season_001 = (function(){

  let Level = sf.constructs.Level
  let Unit  = sf.constructs.Unit

  /* In-memory data */
  let LEVELS = {}, UNITS = {};
  
  // Player
  UNITS[`player`] = new Unit({
    key: `player`,
    uri: `ssp`,
    scale: 1.45,
    animationKeys: {
      idle: `idle`,
      walk: `walk`,
      walk_back: `walk_back`,
      run : `run`,
      run_back: `run_back`
    },
    // Canvas settings
    sprite: {
      width : 156,
      height: 294,
      ratio : 294 / 156,
    }
  })
  
  /* Level Data */
  // Level 1
  LEVELS[`001`] = new Level({
    startPosition: {x: 0, y: 0},
    enemies: [
      {model: 'hiro', pos: {x: 0, y: 10, r: Math.PI}},
    ],
    map: [],
    terrain: [],
  })
  
  // Level 2
  LEVELS[`002`] = new Level({
    enemies: [
      {model: 'mira', pos: {x: 0, y: 0}},
    ],
  })
  
  // Level 2
  LEVELS[`003`] = new Level({
    enemies: [
      {model: 'thalendir', pos: {x: 0, y: 0}},
      {model: 'saya',      pos: {x: 0, y: 0}},
    ],
  })
  
  // Level 4
  LEVELS[`004`] = new Level({
    enemies: [
      {model: 'sentinel', pos: {x: 0, y: 0}},
    ],
  })
  
  // Level 5
  LEVELS[`005`] = new Level({
    enemies: [
      {model: 'bearsnake', pos: {x: 0, y: 0}},
    ],
  })

  // Level 6
  LEVELS[`006`] = new Level({
    enemies: [
      {model: 'medusa', pos: {x: 0, y: 0}},
    ],
  })

  // Level 7
  LEVELS[`007`] = new Level({
    enemies: [
      {model: 'elf', pos: {x: 0, y: 0}},
    ],
  })

  // Level 8
  LEVELS[`008`] = new Level({
    enemies: [
      {model: 'valerian', pos: {x: 0, y: 0}},
    ],
  })

  // Level 9
  LEVELS[`009`] = new Level({
    enemies: [
      {model: 'kinoichi', pos: {x: 0, y: 0}},
    ],
  })

  // Level 10
  LEVELS[`010`] = new Level({
    enemies: [
      {model: 'illuminaty', pos: {x: 0, y: 0}},
    ],
  })

  // Level 11
  LEVELS[`011`] = new Level({
    enemies: [
      {model: 'attod', pos: {x: 0, y: 0}},
    ],
  })

  // Level 12
  LEVELS[`012`] = new Level({
    enemies: [
      {model: 'pendragon', pos: {x: 0, y: 0}},
      {model: 'helion',    pos: {x: 0, y: 0}},
    ],
  })
  
  /* Hero Data */
  UNITS[`hiro`] = new Unit({
    key: `hiro`,
    uri: `blind_ronin`,
    animationKeys: {
      idle : `001_idle_twoweapons`,
      walk : `001_run`,
    },
  })
  UNITS[`mira`] = new Unit({
    key: `mira`,
    uri: `arachy`,
    animationKeys: {
      idle : `idle`,
      walk : `idle`,
    },
  })
  UNITS[`thalendir`] = new Unit({
    key: `thalendir`,
    uri: `thalendir_the_horned_sentinel`,
    scale: 166,
    animationKeys: {
      idle : `001_idle_naginata`,
      walk : `001_run`,
    },
  })
  UNITS[`saya`] = new Unit({
    key: `saya`,
    uri: `carbon_saya`,
    animationKeys: {
      idle : `001_idle_flying_mage`,
      walk : `flying_run_f`,
    },
  })
  UNITS[`sentinel`] = new Unit({
    key: `sentinel`,
    uri: `azure_sentine`,
    scale: 168,
    animationKeys: {
      idle : `001_idle_spear_weaponposition`,
      walk : `001_run_samurai_f`,
    },
  })
  UNITS[`bearsnake`] = new Unit({
    key: `bearsnake`,
    uri: `lizard_head`,
    scale: 2.8,
    animationKeys: {
      idle : `001_idle_oneweapon_twoweapons`,
      walk : `001_flying`,
    },
  })
  UNITS[`medusa`] = new Unit({
    key: `medusa`,
    uri: `medusa_shield`,
    scale: 6.8,
    animationKeys: {
      idle : `show`,
      walk : `idle`,
    },
  })
  UNITS[`elf`] = new Unit({
    key: `elf`,
    uri: `silvanus_hunter_of_eyeblights`,
    scale: 121,
    animationKeys: {
      idle : `idle`,
      walk : `idle`,
    },
  })
  UNITS[`valerian`] = new Unit({
    key: `valerian`,
    uri: `valerian_queen`,
    scale: 2.1,
    animationKeys: {
      idle : `001_idle_oneweapon_twoweapons_tavern`,
      walk : `001_flying`,
    },
  })
  UNITS[`kinoichi`] = new Unit({
    key: `kinoichi`,
    uri: `kinoichi`,
    scale: 3.8,
    animationKeys: {
      idle : `idle`,
      walk : `idle`,
    },
  })
  UNITS[`illuminaty`] = new Unit({
    key: `illuminaty`,
    uri: `illuminaty`,
    scale: 9.9,
    animationKeys: {
      idle : `001_idle_flying`,
      walk : `001_flying`,
    },
  })
  UNITS[`attod`] = new Unit({
    key: `attod`,
    uri: `hell_face_naginata`,
    scale: 1.9,
    animationKeys: {
      idle : `001_idle_twohanded_catana`,
      walk : `001_run`,
    },
  })
  UNITS[`pendragon`] = new Unit({
    key: `pendragon`,
    uri: `troll_mud`,
    scale: 16,
    animationKeys: {
      idle : `monster_idle`,
      walk : `monster_run`,
    },
  })
  UNITS[`helion`] = new Unit({
    key: `helion`,
    uri: `jungle_elves`,
    scale: 1.6,
    animationKeys: {
      idle : `002_idle_twoweapons`,
      walk : `003_run_weaponshield`,
    },
  })
  UNITS[`ethnic`] = new Unit({
    key: `ethnic`,
    uri: `ethnic_hero`,
    scale: 1.22,
    animationKeys: {
      idle : `001_idle_whip_samurai_f`,
      walk : `001_run_samurai_f`,
    },
  })

  
  return {
    LEVELS: LEVELS,
    UNITS : UNITS,
  }
})()