import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070d);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);
camera.position.set(0, 3000, 10000);

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("simulation-container").appendChild(renderer.domElement);

// Camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight( 0xffffff, 2);
sunLight.position.set(5000, 3000, 5000);
scene.add(sunLight);

// Earth
// Real Earth radius is approximately 6371 km.
// We use kilometers directly in the simulation.
const EARTH_RADIUS = 6371;
const earthGeometry = new THREE.SphereGeometry( EARTH_RADIUS, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x2855a3,
    roughness: 0.8,
    metalness: 0.0
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Orbit
const ORBIT_ALTITUDE = 500;
const ORBIT_RADIUS = EARTH_RADIUS + ORBIT_ALTITUDE;
const orbitGeometry = new THREE.BufferGeometry();
const orbitPoints = [];
const segments = 256;

for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * ORBIT_RADIUS;
    const y = Math.sin(angle) * ORBIT_RADIUS;
    orbitPoints.push(new THREE.Vector3(x, y, 0));
}

orbitGeometry.setFromPoints(orbitPoints);
const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35
  });

const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
scene.add(orbit);

// Satellite
const satelliteGeometry = new THREE.SphereGeometry( 60, 32, 32);
const satelliteMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
scene.add(satellite);

// Simulation state
let simulationTime = 0;
let running = true;

// Initial position:
// C++:
// position = (6871, 0, 0)
// Three.js:
// same coordinate system
satellite.position.set(ORBIT_RADIUS, 0, 0
);

// UI
const timeElement = document.getElementById("time");
const altitudeElement = document.getElementById("altitude");
const speedElement = document.getElementById("speed");
const distanceElement = document.getElementById("distance");
const statusElement = document.getElementById("simulation-status");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");

// Pause / Resume
pauseButton.addEventListener(
  "click", () => {
    running = !running;
    pauseButton.textContent = running ? "Pause" : "Resume";
    statusElement.textContent = running ? "Running" : "Paused";
  }
);

// Reset
resetButton.addEventListener(
  "click", () => {
    simulationTime = 0;
    satellite.position.set(ORBIT_RADIUS, 0, 0);
    updateUI();
  }
);

// Update simulation
function updateSimulation(deltaTime) {
  if (!running) {
    return;
  }
  simulationTime += deltaTime;
  // Temporary orbital motion.
  // This is NOT the physics engine.
  // It is only here so we can see
  // the Three.js visualization working.
  const orbitalSpeed = 7.61656;
  const angularVelocity = orbitalSpeed / ORBIT_RADIUS;
  const angle = simulationTime * angularVelocity;
  satellite.position.x = Math.cos(angle) * ORBIT_RADIUS;
  satellite.position.y = Math.sin(angle) * ORBIT_RADIUS;
  satellite.position.z = 0;
  updateUI();
}

// Update UI
function updateUI() {
  const distance = satellite.position.length();
  const altitude = distance - EARTH_RADIUS;
  timeElement.textContent = `${simulationTime.toFixed(1)} s`;
  altitudeElement.textContent = `${altitude.toFixed(2)} km`;
  distanceElement.textContent = `${distance.toFixed(2)} km`;
  speedElement.textContent = `7.61656 km/s`;
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  updateSimulation(deltaTime);
  controls.update();
  renderer.render(
    scene,
    camera
  );
}
animate();

// Window resize
window.addEventListener(
  "resize", () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);
