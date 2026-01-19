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
      <h2>Thông Tin Pet</h2>
      <p><strong>Giống:</strong> Golden Retriever</p>
      <p><strong>Tuổi:</strong> 3 năm</p>
      <p><strong>Tên:</strong> Lucky</p>
      <p><strong>Màu lông:</strong> Vàng kim</p>
      <p><strong>Cân nặng:</strong> 30 kg</p>
      <p><strong>Tính cách:</strong> Thân thiện, năng động</p>
      <p><strong>Sở thích:</strong> Chơi đùa, chạy bộ</p>
      <p><strong>Chế độ ăn:</strong> Thức ăn chuyên dụng cho chó</p>
      <p><strong>Sức khỏe:</strong> Tốt, tiêm phòng đầy đủ</p>
      <p><strong>Đặc điểm:</strong> Thông minh, dễ huấn luyện</p>
    `
  } else if (type === 'pc') {
    content.innerHTML = `
      <h2>Thông Tin Máy Tính</h2>
      <p><strong>CPU:</strong> Intel Core i7-12700K</p>
      <p><strong>RAM:</strong> 32GB DDR5</p>
      <p><strong>GPU:</strong> NVIDIA RTX 4070</p>
      <p><strong>SSD:</strong> 1TB NVMe Gen4</p>
      <p><strong>Nguồn:</strong> 750W 80+ Gold</p>
      <p><strong>Case:</strong> Mid Tower ATX với RGB</p>
      <p><strong>Công dụng:</strong> Gaming, đồ họa, lập trình</p>
      <p><strong>Hệ điều hành:</strong> Windows 11 Pro</p>
    `
  } else if (type === 'rauma') {
    content.innerHTML = `
      <h2>Thông Tin Món Ăn</h2>
      <p><strong>Tên món:</strong> Rau má</p>
      <p><strong>Loại:</strong> Thức uống giải khát</p>
      <p><strong>Thành phần:</strong> Rau má tươi, đường, đá</p>
      <p><strong>Nguồn gốc:</strong> Việt Nam</p>
      <p><strong>Giá trị dinh dưỡng:</strong> Giàu vitamin C, kali</p>
      <p><strong>Công dụng:</strong> Giải nhiệt, thanh lọc cơ thể</p>
      <p><strong>Hương vị:</strong> Thanh mát, dễ uống</p>
      <p><strong>Calo:</strong> Khoảng 50-70 kcal/cốc</p>
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
