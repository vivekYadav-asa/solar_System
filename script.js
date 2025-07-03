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
