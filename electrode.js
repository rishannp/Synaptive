import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas     = document.getElementById('electrode-canvas');
const heroVisual = document.querySelector('.hero-visual');
if (!canvas || !heroVisual) throw new Error('electrode: missing elements');

const W = heroVisual.offsetWidth  || 440;
const H = heroVisual.offsetHeight || 440;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 2));
const key = new THREE.DirectionalLight(0xfff5ee, 5);
key.position.set(3, 4, 5);
scene.add(key);
const fill = new THREE.DirectionalLight(0xcb8e7e, 2.5);
fill.position.set(-4, 1, 3);
scene.add(fill);

const mat = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });

let model = null;

new GLTFLoader().load('electrode.glb', (gltf) => {
  model = gltf.scene;
  model.traverse(c => { if (c.isMesh) c.material = mat; });

  // Scale then centre (correct order for Three.js transforms)
  const box  = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const s    = 2.0 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(s);

  // Recompute bounding box after scaling to get true world centre
  box.setFromObject(model);
  const centre = box.getCenter(new THREE.Vector3());
  model.position.sub(centre);

  scene.add(model);
  console.log('[electrode] model ready at origin, scaled', s.toFixed(3));
}, undefined, err => console.warn('[electrode] load error:', err));

window.addEventListener('resize', () => {
  const w = heroVisual.offsetWidth;
  const h = heroVisual.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  if (model) {
    const t = clock.getElapsedTime();
    model.rotation.y = t * 0.4;
    model.rotation.x = Math.sin(t * 0.25) * 0.12;
    model.position.y = Math.sin(t * 0.5) * 0.06;
  }
  renderer.render(scene, camera);
})();
