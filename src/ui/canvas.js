import * as THREE from 'three'

export class SceneRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement
    this.scene = null
    this.camera = null
    this.renderer = null
    this.fisherman = null
    this.fishermanTarget = null
    this.fishermanBaseY = 0
    this.waterMeshes = []
    this.renderTick = 0
    this.positions = {}
    this.popEffects = []
    this.previousState = null
    this.previousDay = 0
    this.didShowSellPopup = false
    this._createOverlayElements()
    this._initThree()
    this._buildScene()
    this._buildFisherman()
    this._startRenderLoop()

    this._handleResize = this._handleResize.bind(this)
    window.addEventListener('resize', this._handleResize)
    this._handleResize()
  }

  _createOverlayElements() {
    const canvasHost = this.canvas.parentElement || document.body
    if (canvasHost !== document.body && getComputedStyle(canvasHost).position === 'static') {
      canvasHost.style.position = 'relative'
    }

    // Create overlay divs if they don't exist
    const createDiv = (id, styles, parent = canvasHost) => {
      let div = document.getElementById(id)
      if (!div) {
        div = document.createElement('div')
        div.id = id
        Object.assign(div.style, styles)
        parent.appendChild(div)
      }
      return div
    }

    const hud = createDiv('overlay-hud', {
      position: 'absolute',
      inset: '16px',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gridTemplateRows: 'auto 1fr auto',
      alignItems: 'start',
      pointerEvents: 'none',
      zIndex: '30'
    })

    const cardStyle = {
      color: '#ebf8ff',
      fontSize: '1rem',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      letterSpacing: '0.02em',
      textShadow: '0 2px 8px rgba(0,0,0,0.45)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 10px 28px rgba(0, 0, 0, 0.28)',
      borderRadius: '14px',
      background: 'linear-gradient(150deg, rgba(22,48,94,0.75), rgba(25,116,210,0.45))',
      padding: '10px 14px',
      pointerEvents: 'none'
    }

    const badgeStyle = {
      ...cardStyle,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600'
    }

    const overlayStyle = {
      position: 'absolute',
      color: 'white',
      zIndex: '31',
      whiteSpace: 'nowrap'
    }

    createDiv('overlay-day', {
      ...overlayStyle,
      ...badgeStyle,
      justifySelf: 'center',
      alignSelf: 'start'
    }, hud)

    createDiv('overlay-fish', {
      ...overlayStyle,
      ...badgeStyle,
      justifySelf: 'start',
      alignSelf: 'start'
    }, hud)

    createDiv('overlay-clock', {
      ...overlayStyle,
      ...cardStyle,
      justifySelf: 'end',
      alignSelf: 'end',
      fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
      fontWeight: '700'
    }, hud)
  }

  _initThree() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(800, 500, false)
    this.renderer.setClearColor(0x6ba8de)

    // Create scene
    this.scene = new THREE.Scene()

    // Create camera
    this.camera = new THREE.PerspectiveCamera(65, 800 / 500, 0.1, 1000)
    this.camera.position.set(0, 20, 14)
    this.camera.lookAt(0, 0, 0)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xfff0d6, 1.2)
    directionalLight.position.set(12, 24, 12)
    this.scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight(0x8ec5ff, 0.48)
    fillLight.position.set(-12, 10, -4)
    this.scene.add(fillLight)
  }

  _buildScene() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(40, 20)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x5ea057 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    this.scene.add(ground)

    // Paths
    const pathGeometry = new THREE.PlaneGeometry(3.5, 12)
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0xb69768 })
    const path = new THREE.Mesh(pathGeometry, pathMaterial)
    path.rotation.x = -Math.PI / 2
    path.position.set(0, 0.02, 0.3)
    this.scene.add(path)

    // Lake (plane)
    const lakeGeometry = new THREE.PlaneGeometry(8, 6)
    const lakeMaterial = new THREE.MeshPhongMaterial({
      color: 0x1d74cc,
      shininess: 100,
      transparent: true,
      opacity: 0.92
    })
    const lake = new THREE.Mesh(lakeGeometry, lakeMaterial)
    lake.rotation.x = -Math.PI / 2
    lake.position.set(-8, 0.01, 2)
    this.scene.add(lake)
    this.waterMeshes.push(lake)

    // Lake sign post
    const postGeometry = new THREE.BoxGeometry(0.5, 2, 0.5)
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const post = new THREE.Mesh(postGeometry, postMaterial)
    post.position.set(-8, 1, -1)
    this.scene.add(post)

    // River (long box)
    const riverGeometry = new THREE.BoxGeometry(20, 0.1, 2)
    const riverMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d89d9,
      shininess: 120,
      transparent: true,
      opacity: 0.85
    })
    const river = new THREE.Mesh(riverGeometry, riverMaterial)
    river.position.set(4, 0.01, -4)
    this.scene.add(river)
    this.waterMeshes.push(river)

    // Market village area (moved farther from home so travel is obvious)
    const marketCenter = new THREE.Vector3(11, 0, 4)

    const marketGeometry = new THREE.BoxGeometry(3, 3, 3)
    const marketMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const market = new THREE.Mesh(marketGeometry, marketMaterial)
    market.position.set(marketCenter.x, 1.5, marketCenter.z)
    this.scene.add(market)

    // Market roof (cone)
    const roofGeometry = new THREE.ConeGeometry(2.5, 1.5, 4)
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xcc0000 })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.set(marketCenter.x, 3.75, marketCenter.z)
    roof.rotation.y = Math.PI / 4
    this.scene.add(roof)

    // Market sign
    const signGeometry = new THREE.BoxGeometry(2.2, 0.7, 0.15)
    const signMaterial = new THREE.MeshLambertMaterial({ color: 0xf6d365 })
    const sign = new THREE.Mesh(signGeometry, signMaterial)
    sign.position.set(marketCenter.x, 2.5, marketCenter.z + 1.7)
    this.scene.add(sign)

    // Market crates for visual clarity
    const crateGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7)
    const crateMat = new THREE.MeshLambertMaterial({ color: 0xc58f5a })
    const crate1 = new THREE.Mesh(crateGeo, crateMat)
    crate1.position.set(marketCenter.x - 1.6, 0.35, marketCenter.z - 0.6)
    this.scene.add(crate1)

    const crate2 = new THREE.Mesh(crateGeo, crateMat)
    crate2.position.set(marketCenter.x + 1.4, 0.35, marketCenter.z - 0.7)
    this.scene.add(crate2)

    // Sun accent
    const sunGeometry = new THREE.SphereGeometry(1.2, 24, 24)
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd76 })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    sun.position.set(-14, 14, -10)
    this.scene.add(sun)

    // Trees (4 decorative trees)
    const treePositions = [
      new THREE.Vector3(-14, 0, -6),
      new THREE.Vector3(14, 0, -6),
      new THREE.Vector3(-14, 0, 6),
      new THREE.Vector3(10, 0, 6)
    ]

    treePositions.forEach(pos => {
      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8)
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
      trunk.position.copy(pos)
      trunk.position.y = 0.75
      this.scene.add(trunk)

      // Canopy
      const canopyGeometry = new THREE.CylinderGeometry(0, 1.5, 3, 8)
      const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 })
      const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial)
      canopy.position.copy(pos)
      canopy.position.y = 2.5
      this.scene.add(canopy)
    })

    // Store position vectors for fisherman movement
    this.positions = {
      home: new THREE.Vector3(0, 0, 4),
      lake: new THREE.Vector3(-8, 0, 2),
      river: new THREE.Vector3(4, 0, -4),
      market: new THREE.Vector3(11, 0, 4)
    }

    // Initialize fisherman target position
    this.fishermanTarget = this.positions.home.clone()
  }

  _buildFisherman() {
    // Create fisherman as a group
    this.fisherman = new THREE.Group()

    // Body (blue shirt)
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 1.2
    this.fisherman.add(body)

    // Head (skin)
    const headGeometry = new THREE.SphereGeometry(0.35, 8, 8)
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2.15
    this.fisherman.add(head)

    // Hat (brown fishing hat)
    const hatGeometry = new THREE.CylinderGeometry(0.1, 0.4, 0.4, 8)
    const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const hat = new THREE.Mesh(hatGeometry, hatMaterial)
    hat.position.y = 2.6
    this.fisherman.add(hat)

    // Hat brim
    const brimGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 8)
    const brim = new THREE.Mesh(brimGeometry, hatMaterial)
    brim.position.y = 2.42
    this.fisherman.add(brim)

    // Left arm
    const leftArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8)
    const leftArm = new THREE.Mesh(leftArmGeometry, bodyMaterial)
    leftArm.rotation.z = Math.PI / 4
    leftArm.position.set(-0.55, 1.5, 0)
    this.fisherman.add(leftArm)

    // Right arm
    const rightArmGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8)
    const rightArm = new THREE.Mesh(rightArmGeometry, bodyMaterial)
    rightArm.rotation.z = -Math.PI / 4
    rightArm.position.set(0.55, 1.5, 0)
    this.fisherman.add(rightArm)

    // Fishing rod (in right hand)
    const rodGeometry = new THREE.CylinderGeometry(0.04, 0.04, 2, 4)
    const rodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const rod = new THREE.Mesh(rodGeometry, rodMaterial)
    rod.rotation.z = -Math.PI / 6
    rod.position.set(1.2, 1.8, 0)
    this.fisherman.add(rod)

    // Legs (dark pants)
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1, 8)
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F })

    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.2, 0.35, 0)
    this.fisherman.add(leftLeg)

    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.2, 0.35, 0)
    this.fisherman.add(rightLeg)

    // Set initial position
    this.fisherman.position.copy(this.positions.home)
    this.fishermanBaseY = this.positions.home.y
    this.scene.add(this.fisherman)
  }


  _createTextSprite(text, color = '#ffffff') {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = 'bold 54px Inter, Segoe UI Emoji, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = 6
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2)
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(1.9, 0.95, 1)
    return sprite
  }

  _spawnPopup(text, options = {}) {
    if (!this.scene || !this.fisherman) return

    const sprite = this._createTextSprite(text, options.color)
    if (!sprite) return

    const baseOffset = options.baseOffset || new THREE.Vector3(0, 2.6, 0)
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * (options.spreadX || 0.8),
      Math.random() * (options.spreadY || 0.6),
      (Math.random() - 0.5) * (options.spreadZ || 0.8)
    )

    sprite.position.copy(this.fisherman.position).add(baseOffset).add(randomOffset)
    this.scene.add(sprite)

    this.popEffects.push({
      sprite,
      life: 1,
      riseSpeed: options.riseSpeed || 0.05,
      driftX: options.driftX || (Math.random() - 0.5) * 0.02,
      scaleGrow: options.scaleGrow || 0.006
    })
  }

  _updatePopEffects() {
    if (this.popEffects.length === 0) return

    this.popEffects = this.popEffects.filter(effect => {
      effect.life -= 0.02
      effect.sprite.position.y += effect.riseSpeed
      effect.sprite.position.x += effect.driftX
      effect.sprite.scale.multiplyScalar(1 + effect.scaleGrow)

      if (effect.sprite.material) {
        effect.sprite.material.opacity = Math.max(0, effect.life)
      }

      if (effect.life <= 0) {
        this.scene.remove(effect.sprite)
        effect.sprite.material?.map?.dispose?.()
        effect.sprite.material?.dispose?.()
        return false
      }
      return true
    })
  }

  _handleResize() {
    if (!this.renderer || !this.camera || !this.canvas) return

    const width = this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || 800
    const height = this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || 500

    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / Math.max(height, 1)
    this.camera.updateProjectionMatrix()
  }

  _startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate)
      this.renderTick += 0.02

      // Smoothly interpolate fisherman position toward target
      if (this.fisherman && this.fishermanTarget) {
        this.fisherman.position.lerp(this.fishermanTarget, 0.05)
        this.fisherman.rotation.y += 0.01
        this.fisherman.position.y = this.fishermanBaseY + Math.sin(this.renderTick * 2.5) * 0.08
      }

      // Subtle water motion
      this.waterMeshes.forEach((water, idx) => {
        water.position.y = 0.01 + Math.sin(this.renderTick * (1.4 + idx * 0.2)) * 0.03
      })

      this._updatePopEffects()

      // Render the scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    }
    animate()
  }

  clear() {
    // No-op: Three.js render loop handles clearing
  }

  render(simStatus, agentState) {
    if (simStatus.state !== this.previousState) {
      if (simStatus.state === 'fishing' && simStatus.lastReward !== null && simStatus.lastReward !== undefined) {
        const fishCount = Math.max(1, Math.min(5, Math.round(simStatus.lastReward / 2)))
        for (let i = 0; i < fishCount; i++) {
          this._spawnPopup('🐟', { color: '#9be7ff', baseOffset: new THREE.Vector3(0, 2.2, 0), riseSpeed: 0.045 })
        }
      }

      if (simStatus.state === 'selling' && simStatus.market) {
        const coins = Math.max(2, Math.min(6, Math.round((simStatus.market.revenue || 0) / 6)))
        for (let i = 0; i < coins; i++) {
          this._spawnPopup('🪙', { color: '#ffd166', baseOffset: new THREE.Vector3(0, 2.8, 0), riseSpeed: 0.055, spreadX: 1.1 })
        }
        this._spawnPopup(`+${(simStatus.market.revenue || 0).toFixed(1)}`, { color: '#ffe066', baseOffset: new THREE.Vector3(0, 3.3, 0), riseSpeed: 0.04, spreadX: 0.2 })
      }

      if (simStatus.day > this.previousDay) {
        this._spawnPopup('🧠 +Q', { color: '#b8f2ff', baseOffset: new THREE.Vector3(0, 3.4, 0), riseSpeed: 0.038, spreadX: 0.2 })
      }

      this.previousState = simStatus.state
      this.previousDay = simStatus.day
    }
    // Update fisherman target position based on simulation state
    let targetPos = this.positions.home

    if (simStatus.state === 'deciding' || simStatus.state === 'fishing') {
      targetPos = this.positions[simStatus.currentAction] || this.positions.home
    } else if (simStatus.state === 'selling') {
      targetPos = this.positions.market
    } else if (simStatus.state === 'resting' || simStatus.state === 'idle') {
      targetPos = this.positions.home
    }

    if (simStatus.state !== this.previousState) {
      // Fish should pop after fishing is complete (transition into selling)
      if (simStatus.state === 'selling' && simStatus.lastReward !== null && simStatus.lastReward !== undefined) {
        const fishCount = Math.max(1, Math.min(5, Math.round(simStatus.lastReward / 2)))
        for (let i = 0; i < fishCount; i++) {
          this._spawnPopup('🐟', { color: '#9be7ff', baseOffset: new THREE.Vector3(0, 2.2, 0), riseSpeed: 0.045 })
        }
      }

      if (simStatus.day > this.previousDay) {
        this._spawnPopup('🧠 +Q', { color: '#b8f2ff', baseOffset: new THREE.Vector3(0, 3.4, 0), riseSpeed: 0.038, spreadX: 0.2 })
      }

      this.didShowSellPopup = false
      this.previousState = simStatus.state
      this.previousDay = simStatus.day
    }

    if (this.fishermanTarget) {
      this.fishermanTarget.copy(targetPos)
    }

    // Sell popups should appear near the market once fisherman arrives there
    if (simStatus.state === 'selling' && simStatus.market && this.fisherman && !this.didShowSellPopup) {
      const distToMarket = this.fisherman.position.distanceTo(this.positions.market)
      if (distToMarket < 1.35) {
        const coins = Math.max(2, Math.min(6, Math.round((simStatus.market.revenue || 0) / 6)))
        for (let i = 0; i < coins; i++) {
          this._spawnPopup('🪙', { color: '#ffd166', baseOffset: new THREE.Vector3(0, 2.8, 0), riseSpeed: 0.055, spreadX: 1.1 })
        }
        this._spawnPopup(`+${(simStatus.market.revenue || 0).toFixed(1)}`, { color: '#ffe066', baseOffset: new THREE.Vector3(0, 3.3, 0), riseSpeed: 0.04, spreadX: 0.2 })
        this.didShowSellPopup = true
      }
    }

    // Update overlay elements
    const dayElement = document.getElementById('overlay-day')
    const fishElement = document.getElementById('overlay-fish')
    const clockElement = document.getElementById('overlay-clock')

    if (dayElement) {
      dayElement.textContent = `📅 Day ${simStatus.day}`
    }

    if (fishElement) {
      const fishCount = simStatus.lastReward !== undefined && simStatus.lastReward !== null
        ? Math.round(simStatus.lastReward)
        : 0
      fishElement.textContent = `🎣 Catch: ${fishCount} fish`
    }

    if (clockElement) {
      clockElement.textContent = `🕒 ${simStatus.clock || '8:00 AM'}`
    }
  }
}

// Keep backward compatibility
export { SceneRenderer as Canvas }
