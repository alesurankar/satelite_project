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

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(5000, 3000, 5000);
scene.add(sunLight);

// Physical values are received from the C++ simulation.
let earthRadius = 0;
let orbitalRadius = 0;
let orbitalPeriod = 0;

// Earth
let earth = null;
let orbit = null;
const earthMaterial = new THREE.MeshStandardMaterial({
  color: 0x2855a3,
  roughness: 0.8,
  metalness: 0.0
});
const orbitMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.35
});

// Satellite
const satelliteGeometry = new THREE.SphereGeometry(60, 32, 32);
const satelliteMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
scene.add(satellite);

// Simulation state
let simulationTime = 0;
let renderTime = 0;
let satelliteSpeed = 0;
let satelliteDistance = 0;
let satelliteAltitude = 0;
let connected = false;
let previousState = null;
let currentState = null;

// UI
const timeElement = document.getElementById("time");
const altitudeElement = document.getElementById("altitude");
const speedElement = document.getElementById("speed");
const distanceElement = document.getElementById("distance");
const statusElement = document.getElementById("simulation-status");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");

// WebSocket
const socket = new WebSocket("ws://localhost:9002");

socket.addEventListener(
  "open", () => {
    connected = true;
    statusElement.textContent = "Connected";
    console.log("Connected to C++ simulation");
  }
);

socket.addEventListener(
  "message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "simulation_parameters") {
      initializeSimulation(data);
      return;
    }

    if (data.type !== "satellite") {
      return;
    }

    if (currentState === null) {
      currentState = data;
      renderTime = data.time;
      return;
    }

    previousState = currentState;
    currentState = data;
    renderTime = previousState.time;
  }
);

function initializeSimulation(parameters) {
  earthRadius = parameters.earthRadius;
  orbitalRadius = parameters.orbitalRadius;
  orbitalPeriod = parameters.orbitalPeriod;

  earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 64, 64),
    earthMaterial
  );
  scene.add(earth);

  const orbitPoints = [];
  for (let i = 0; i <= 256; i++) {
    const angle = (i / 256) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(
      Math.cos(angle) * orbitalRadius,
      Math.sin(angle) * orbitalRadius,
      0
    ));
  }

  const orbitGeometry = new THREE.BufferGeometry();
  orbitGeometry.setFromPoints(orbitPoints);
  orbit = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbit);
}

socket.addEventListener(
  "error", (error) => {
    console.error("WebSocket error:", error);
    statusElement.textContent = "Connection error";
  }
);

socket.addEventListener(
  "close", () => {
    connected = false;
    statusElement.textContent = "Disconnected";
    console.log("Disconnected from C++ simulation");
  }
);

// Pause / Resume
pauseButton.addEventListener(
  "click", () => {
    // Later this will send a command
    // from Three.js to the C++ simulation.
    console.log("Pause button clicked");
  }
);

// Reset
resetButton.addEventListener(
  "click", () => {
    // Later this will send a reset command
    // from Three.js to the C++ simulation.
    console.log("Reset button clicked");
  }
);

function updateSimulation(deltaTime) {
  if (currentState === null) {
    return;
  }

  if (previousState === null) {
    satellite.position.set(
      currentState.position.x,
      currentState.position.y,
      currentState.position.z
    );
    simulationTime = currentState.time;
    satelliteSpeed = currentState.speed;
    satelliteDistance = currentState.distance;
    satelliteAltitude = currentState.altitude;
    updateUI();
    return;
  }

  renderTime += deltaTime;

  const previousTime = previousState.time;
  const currentTime = currentState.time;
  const snapshotInterval = currentTime - previousTime;

  if (snapshotInterval <= 0) {
    return;
  }

  const interpolation =
    (renderTime - previousTime) /
    snapshotInterval;

  const alpha = Math.max(
    0,
    Math.min(1, interpolation)
  );

  satellite.position.x =
    previousState.position.x +
    (currentState.position.x - previousState.position.x) *
    alpha;

  satellite.position.y =
    previousState.position.y +
    (currentState.position.y - previousState.position.y) *
    alpha;

  satellite.position.z =
    previousState.position.z +
    (currentState.position.z - previousState.position.z) *
    alpha;

  simulationTime =
    previousTime +
    snapshotInterval * alpha;

  satelliteSpeed =
    previousState.speed +
    (currentState.speed - previousState.speed) *
    alpha;

  satelliteDistance =
    previousState.distance +
    (currentState.distance - previousState.distance) *
    alpha;

  satelliteAltitude =
    previousState.altitude +
    (currentState.altitude - previousState.altitude) *
    alpha;

  updateUI();
}

// Update UI
function updateUI() {
  timeElement.textContent = `${simulationTime.toFixed(1)} s`;
  altitudeElement.textContent = `${satelliteAltitude.toFixed(2)} km`;
  distanceElement.textContent = `${satelliteDistance.toFixed(2)} km`;
  speedElement.textContent = `${satelliteSpeed.toFixed(5)} km/s`;
}

const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  updateSimulation(deltaTime);
  controls.update();
  renderer.render(scene, camera);
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
