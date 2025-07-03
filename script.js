import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//1 vaiables setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 50, 140);
const initialCameraPosition = camera.position.clone();
const initialControlsTarget = new THREE.Vector3(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 500;
// State Management
let isPaused = false;
let cameraMode = 'FREE_ROAM'; 
let cameraTargetPlanet = null;
let hoveredPlanet = null;
// UI Elements & Raycasting
const pauseBtn = document.getElementById('pause-btn');
const themeBtn = document.getElementById('theme-btn');
const resetCameraBtn = document.getElementById('reset-btn');
const tooltip = document.getElementById('tooltip');
const controlsContainer = document.getElementById('controls-container');
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
//2.lighteffect
const pointLight = new THREE.PointLight(0xffffff, 3, 0);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Background 
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// celestial bodies
const sunGeometry = new THREE.SphereGeometry(10, 64, 64);
const sunMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xFFFF00,
    emissiveIntensity: 1.5,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const planetData = [
    { name: 'Mercury', size: 1.2, color: 0x9E9E9E, emissiveColor: 0x222222, distance: 20, speed: 0.8 },
    { name: 'Venus', size: 2, color: 0xF0E68C, emissiveColor: 0x444422, distance: 30, speed: 0.5 },
    { name: 'Earth', size: 2.2, color: 0x3B82F6, emissiveColor: 0x112244, distance: 45, speed: 0.35 },
    { name: 'Mars', size: 1.5, color: 0xC1440E, emissiveColor: 0x441100, distance: 60, speed: 0.2 },
    { name: 'Jupiter', size: 6, color: 0xBCAB97, emissiveColor: 0x333322, distance: 85, speed: 0.1 },
    { name: 'Saturn', size: 5, color: 0xD4C99E, emissiveColor: 0x444133, distance: 110, speed: 0.08 },
    { name: 'Uranus', size: 4, color: 0xAFDBF5, emissiveColor: 0x223344, distance: 130, speed: 0.05 },
    { name: 'Neptune', size: 3.8, color: 0x3F54BA, emissiveColor: 0x111133, distance: 150, speed: 0.03 }
];
const planets = [];
const orbitPaths = [];

function createPlanet(data) {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: data.color, emissive: data.emissiveColor });
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.name = data.name;
    const orbit = new THREE.Object3D();
    scene.add(orbit);
    orbit.add(planetMesh);
    planetMesh.position.x = data.distance;

    if (data.name === 'Saturn') {
        const ringGeometry = new THREE.RingGeometry(data.size + 2, data.size + 5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xD4C99E, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -0.5 * Math.PI;
        planetMesh.add(ring);
    }
    
    return { name: data.name, mesh: planetMesh, orbit: orbit, speed: data.speed, distance: data.distance };
}

planetData.forEach(data => planets.push(createPlanet(data)));

planets.forEach(planet => {
    const orbitPathGeometry = new THREE.RingGeometry(planet.distance, planet.distance + 0.1, 128);
    const orbitPathMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    const orbitPath = new THREE.Mesh(orbitPathGeometry, orbitPathMaterial);
    orbitPath.rotation.x = -0.5 * Math.PI;
    scene.add(orbitPath);
    orbitPaths.push(orbitPath);
});//4.ui and event controlling
// Speed Controls
planetData.forEach((data, index) => {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';
    const label = document.createElement('label');
    label.innerText = data.name;
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = 0; slider.max = 2; slider.step = 0.01; slider.value = data.speed;
    slider.addEventListener('input', (e) => planets[index].speed = parseFloat(e.target.value));
    controlGroup.appendChild(label);
    controlGroup.appendChild(slider);
    controlsContainer.appendChild(controlGroup);
});

// Main Controls
pauseBtn.addEventListener('click', () => { isPaused = !isPaused; pauseBtn.textContent = isPaused ? 'Resume' : 'Pause'; });

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    themeBtn.textContent = isLightMode ? 'Dark Mode' : 'Light Mode';
    ambientLight.intensity = isLightMode ? 1.0 : 0.2;
    pointLight.intensity = isLightMode ? 1 : 3;
    stars.visible = !isLightMode;
    orbitPaths.forEach(path => path.material.color.set(isLightMode ? 0xcccccc : 0x333333));
});

resetCameraBtn.addEventListener('click', () => {
    cameraTargetPlanet = null;
    cameraMode = 'RESETTING';
});

// Mouse effect 
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${event.clientY}px`;
});

window.addEventListener('click', () => {
    if (hoveredPlanet) {
        cameraTargetPlanet = hoveredPlanet.mesh;
        cameraMode = 'FOCUSING';
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 5. animation loop
const clock = new THREE.Clock();
let totalTime = 0;

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    // 1. Planetary animation
    if (!isPaused) {
        totalTime += deltaTime;
        sun.rotation.y += 0.001;
        planets.forEach(planet => {
            planet.orbit.rotation.y = totalTime * planet.speed * 0.5;
            planet.mesh.rotation.y += 0.005;
        });
    }

    // 2. Raycasting for hover effects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
        hoveredPlanet = planets.find(p => p.mesh === intersects[0].object);
        tooltip.style.display = 'block';
        tooltip.textContent = hoveredPlanet.name;
        document.body.style.cursor = 'pointer';
    } else {
        hoveredPlanet = null;
        tooltip.style.display = 'none';
        document.body.style.cursor = 'default';
    }

    // 3. Camera Control State Machine
    if (cameraMode === 'FOCUSING') {
        controls.enabled = false;
        const targetPosition = new THREE.Vector3();
        cameraTargetPlanet.getWorldPosition(targetPosition);
        const offset = new THREE.Vector3(0, cameraTargetPlanet.geometry.parameters.radius * 2, cameraTargetPlanet.geometry.parameters.radius * 5);
        const desiredCameraPosition = targetPosition.clone().add(offset);

        camera.position.lerp(desiredCameraPosition, 0.05);
        controls.target.lerp(targetPosition, 0.05);

        if (camera.position.distanceTo(desiredCameraPosition) < 0.1) {
            cameraMode = 'FREE_ROAM';
        }
    } else if (cameraMode === 'RESETTING') {
        controls.enabled = false;
        camera.position.lerp(initialCameraPosition, 0.05);
        controls.target.lerp(initialControlsTarget, 0.05);

        if (camera.position.distanceTo(initialCameraPosition) < 0.1) {
            cameraMode = 'FREE_ROAM';
        }
    } else { 
        controls.enabled = true;
    }

    controls.update();

    renderer.render(scene, camera);
}

animate();
// completed