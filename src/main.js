import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Khởi tạo scene, camera, renderer
const canvas = document.getElementById('three-canvas')
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xf0f0f0)

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 1, 3)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Orbit Controls - cho phép xoay và zoom
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.minDistance = 1
controls.maxDistance = 10
controls.target.set(0, 0.5, 0)

// Ánh sáng
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(5, 10, 5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
scene.add(directionalLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(-5, 5, -5)
scene.add(pointLight)

// Thêm sàn
const floorGeometry = new THREE.PlaneGeometry(10, 10)
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 0.8,
  metalness: 0.2
})
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
scene.add(floor)

// Tạo bộ PC (cube đại diện)
const pcGeometry = new THREE.BoxGeometry(0.8, 1, 0.5)
const pcMaterial = new THREE.MeshStandardMaterial({
  color: 0x2c3e50,
  metalness: 0.6,
  roughness: 0.4
})
const pcModel = new THREE.Mesh(pcGeometry, pcMaterial)
pcModel.position.set(-2, 0.5, 0)
pcModel.castShadow = true
pcModel.receiveShadow = true
pcModel.name = 'pc'
scene.add(pcModel)

// Tạo bàn
const tableTopGeometry = new THREE.BoxGeometry(1.5, 0.1, 1)
const tableLegGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8)
const tableMaterial = new THREE.MeshStandardMaterial({
  color: 0x8B4513,
  roughness: 0.7,
  metalness: 0.1
})

const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial)
tableTop.position.set(2, 0.6, 0)
tableTop.castShadow = true
tableTop.receiveShadow = true
scene.add(tableTop)

// Chân bàn
const legPositions = [
  [-0.6, 0.3, -0.4],
  [0.6, 0.3, -0.4],
  [-0.6, 0.3, 0.4],
  [0.6, 0.3, 0.4]
]

legPositions.forEach(pos => {
  const leg = new THREE.Mesh(tableLegGeometry, tableMaterial)
  leg.position.set(2 + pos[0], pos[1], pos[2])
  leg.castShadow = true
  scene.add(leg)
})

// Tạo tô rau má
const bowlGroup = new THREE.Group()

// Tô (sử dụng sphere với bottom cut)
const bowlGeometry = new THREE.SphereGeometry(0.2, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6)
const bowlMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.2,
  metalness: 0.05,
  side: THREE.DoubleSide
})
const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial)
bowl.castShadow = true
bowl.receiveShadow = true
bowlGroup.add(bowl)

// Viền tô (rim)
const rimGeometry = new THREE.TorusGeometry(0.2, 0.015, 16, 32)
const rimMaterial = new THREE.MeshStandardMaterial({
  color: 0xe8e8e8,
  roughness: 0.3,
  metalness: 0.1
})
const rim = new THREE.Mesh(rimGeometry, rimMaterial)
rim.rotation.x = Math.PI / 2
rim.position.y = 0.02
rim.castShadow = true
bowlGroup.add(rim)

// Nước rau má bên trong (lớp nước)
const waterGeometry = new THREE.CircleGeometry(0.18, 32)
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x90EE90,
  roughness: 0.1,
  metalness: 0.3,
  transparent: true,
  opacity: 0.8
})
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI / 2
water.position.y = 0.05
bowlGroup.add(water)

// Lá rau má (nhiều lá nhỏ)
const leafMaterial = new THREE.MeshStandardMaterial({
  color: 0x3CB371,
  roughness: 0.9,
  metalness: 0,
  side: THREE.DoubleSide
})

// Tạo các lá rau má hình tròn nhỏ
for (let i = 0; i < 12; i++) {
  const leafGeometry = new THREE.CircleGeometry(0.04 + Math.random() * 0.02, 8)
  const leaf = new THREE.Mesh(leafGeometry, leafMaterial.clone())

  const angle = (i / 12) * Math.PI * 2
  const radius = 0.08 + Math.random() * 0.08
  leaf.position.x = Math.cos(angle) * radius
  leaf.position.z = Math.sin(angle) * radius
  leaf.position.y = 0.06 + Math.random() * 0.02

  leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3
  leaf.rotation.z = Math.random() * Math.PI * 2

  leaf.castShadow = true
  bowlGroup.add(leaf)
}

// Thêm vài lá nổi
for (let i = 0; i < 5; i++) {
  const leafGeometry = new THREE.CircleGeometry(0.03, 8)
  const leaf = new THREE.Mesh(leafGeometry, leafMaterial.clone())
  leaf.material.color.setHex(0x2E8B57)

  leaf.position.x = (Math.random() - 0.5) * 0.12
  leaf.position.z = (Math.random() - 0.5) * 0.12
  leaf.position.y = 0.08 + Math.random() * 0.03

  leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5
  leaf.rotation.z = Math.random() * Math.PI * 2

  bowlGroup.add(leaf)
}

// Đặt tô lên bàn
bowlGroup.position.set(2, 0.75, 0)
bowlGroup.name = 'rauma'
scene.add(bowlGroup)

// Load 3D Model
const loader = new GLTFLoader()
let model = null
const tooltip = document.getElementById('tooltip')

loader.load(
  '/models/mô hình chó 3d.glb',
  (gltf) => {
    model = gltf.scene
    model.position.set(0, 0, 0)

    // Điều chỉnh scale nếu cần
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2 / maxDim
    model.scale.setScalar(scale)

    // Center model
    box.setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)
    model.position.y = size.y * scale / 2

    // Enable shadows
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    scene.add(model)
    console.log('Model loaded successfully!')
  },
  (progress) => {
    const percent = (progress.loaded / progress.total * 100).toFixed(2)
    console.log(`Loading: ${percent}%`)
  },
  (error) => {
    console.error('Error loading model:', error)
  }
)

// Tạo hotspot markers
const hotspotGeometry = new THREE.SphereGeometry(0.08, 16, 16)
const hotspotMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff88,
  emissive: 0x00ff88,
  emissiveIntensity: 0.5
})

const dogHotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial.clone())
dogHotspot.position.set(0, 1.2, 0)
dogHotspot.name = 'dogHotspot'
scene.add(dogHotspot)

const pcHotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial.clone())
pcHotspot.position.set(-2, 1.5, 0)
pcHotspot.name = 'pcHotspot'
scene.add(pcHotspot)

const raumaHotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial.clone())
raumaHotspot.position.set(2, 1, 0)
raumaHotspot.name = 'raumaHotspot'
scene.add(raumaHotspot)

const hotspots = [dogHotspot, pcHotspot, raumaHotspot]

// Raycaster cho hover detection
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let isHovering = false
const clickableObjects = [dogHotspot, pcHotspot, raumaHotspot]

// Mouse move event
canvas.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(clickableObjects)

  if (intersects.length > 0) {
    canvas.style.cursor = 'pointer'
    // Làm hotspot phát sáng khi hover
    intersects[0].object.material.emissiveIntensity = 1
  } else {
    canvas.style.cursor = 'default'
    // Reset emissive cho tất cả hotspots
    hotspots.forEach(h => h.material.emissiveIntensity = 0.5)
  }
})

// Camera positions
const cameraPositions = {
  default: { pos: new THREE.Vector3(0, 1, 3), target: new THREE.Vector3(0, 0.5, 0) },
  dog: { pos: new THREE.Vector3(0, 0.8, 1.5), target: new THREE.Vector3(0, 0.5, 0) },
  pc: { pos: new THREE.Vector3(-2, 1, 1.5), target: new THREE.Vector3(-2, 0.5, 0) },
  rauma: { pos: new THREE.Vector3(2, 1, 1.2), target: new THREE.Vector3(2, 0.75, 0) }
}

let isAnimating = false

function animateCamera(targetPos, targetLookAt, callback) {
  if (isAnimating) return
  isAnimating = true

  const startPos = camera.position.clone()
  const startTarget = controls.target.clone()
  const duration = 1500
  const startTime = Date.now()

  function update() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOut

    camera.position.lerpVectors(startPos, targetPos, eased)
    controls.target.lerpVectors(startTarget, targetLookAt, eased)

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      isAnimating = false
      if (callback) callback()
    }
  }

  update()
}

function showInfo(type) {
  const panel = document.getElementById('info-panel')
  const content = document.getElementById('panel-content')

  if (type === 'dog') {
    content.innerHTML = `
      <h2>🐕 Thông Tin Con Chó</h2>
      <p><strong>Giống:</strong> Chó Tày</p>
      <p><strong>Chủ nhân:</strong> Ộ i i bị lộ bikini</p>
      <p><strong>Địa chỉ:</strong> 120 Ang Liễn</p>
      <p><strong>Đặc điểm:</strong> Có nốt ruồi trên mặt</p>
      <p><strong>Sở trường:</strong> Móc ví</p>
      <p><strong>Bạn thân:</strong> Ram bộ</p>
      <p><strong>Chế độ ăn:</strong> Được nuôi bằng kem Mixue và bã mía đè tem khô gà loại 1</p>
      <p><strong>Đặc quyền:</strong> Thi thoảng còn được uống trà từ tay</p>
      <p><strong>Sứ mệnh:</strong> Canh chừng ngôi mộ kim châm, trên đó cỏ mọc xum xuê vì một tương lai cao bằng bộ PC</p>
    `
  } else if (type === 'pc') {
    content.innerHTML = `
      <h2>💻 Thông Tin Bộ PC</h2>
      <p><strong>Nơi lắp ráp:</strong> Xưởng 120 Ang Liễn</p>
      <p><strong>Tọa lạc tại:</strong> Raumania</p>
      <p><strong>Giá trị:</strong> 36 triệu VNĐ</p>
      <p><strong>Nguồn năng lượng:</strong> Chạy bằng năng lượng rau má</p>
      <p><strong>Sức mạnh:</strong> Sức mạnh của 12 đôi dép</p>
      <p><strong>Đặc biệt:</strong> Là mục tiêu phấn đấu của con chó canh mộ</p>
    `
  } else if (type === 'rauma') {
    content.innerHTML = `
      <h2>🥗 Thông Tin Tô Rau Má</h2>
      <p><strong>Món ăn:</strong> Rau má ở Hoa Thanh Quế</p>
      <p><strong>Công ty sản xuất:</strong> Hoa Kì Food</p>
      <p><strong>Cách sản xuất:</strong> Phá đường tàu</p>
      <p><strong>Chăm sóc bằng:</strong> Shisa</p>
      <p><strong>Người chăm sóc:</strong> Tá Senu aka Khả Seni</p>
      <p><strong>Giá trị dinh dưỡng:</strong> Chứa đủ năng lượng để chạy 1 bộ PC trong 36h</p>
      <p><strong>Hương vị:</strong> Thanh Hóa mảnh đất anh hùng</p>
      <p><strong>Đặc biệt:</strong> 12 đôi dép mất cùng 1 đêm</p>
    `
  }

  panel.classList.remove('hidden')
}

// Click event
canvas.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(clickableObjects)

  if (intersects.length > 0) {
    const clicked = intersects[0].object
    if (clicked.name === 'dogHotspot') {
      animateCamera(cameraPositions.dog.pos, cameraPositions.dog.target, () => showInfo('dog'))
    } else if (clicked.name === 'pcHotspot') {
      animateCamera(cameraPositions.pc.pos, cameraPositions.pc.target, () => showInfo('pc'))
    } else if (clicked.name === 'raumaHotspot') {
      animateCamera(cameraPositions.rauma.pos, cameraPositions.rauma.target, () => showInfo('rauma'))
    }
  }
})

// Button handlers
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.hotspot-btn')
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target
      if (target === 'dog') {
        animateCamera(cameraPositions.dog.pos, cameraPositions.dog.target, () => showInfo('dog'))
      } else if (target === 'pc') {
        animateCamera(cameraPositions.pc.pos, cameraPositions.pc.target, () => showInfo('pc'))
      } else if (target === 'rauma') {
        animateCamera(cameraPositions.rauma.pos, cameraPositions.rauma.target, () => showInfo('rauma'))
      }
    })
  })

  document.getElementById('reset-view').addEventListener('click', () => {
    animateCamera(cameraPositions.default.pos, cameraPositions.default.target)
    document.getElementById('info-panel').classList.add('hidden')
  })

  document.getElementById('close-panel').addEventListener('click', () => {
    document.getElementById('info-panel').classList.add('hidden')
  })
})

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Animation loop
function animate() {
  requestAnimationFrame(animate)

  // Animate hotspots (bobbing effect)
  const time = Date.now() * 0.001
  hotspots.forEach((hotspot, i) => {
    hotspot.position.y += Math.sin(time * 2 + i * Math.PI) * 0.001
  })

  controls.update()
  renderer.render(scene, camera)
}

animate()
