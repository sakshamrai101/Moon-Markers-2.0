import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import './App.css';

const moonquakeData = [
  { dateTime: "1973-03-13 07:56:30", lat: -84.0, long: -134.0, magnitude: 3.2 },
  { dateTime: "1975-01-03 01:42:00", lat: 29.0, long: -98.0, magnitude: 3.2 },
  { dateTime: "1971-04-17 07:00:55", lat: 48.0, long: 35.0, magnitude: 2.8 },
  { dateTime: "1974-07-11 00:46:30", lat: 21.0, long: 88.0, magnitude: 2.7 },
  { dateTime: "1976-03-06 10:12:40", lat: 50.0, long: -20.0, magnitude: 2.3 },
];

const App = () => {
  const sceneRef = useRef(null);
  const camera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const controls = useRef(null);
  const moon = useRef(null);
  const isSceneInitialized = useRef(false);
  const [showDropdown, setShowDropdown] = useState(false);
 

  useEffect(() => {
    if (!isSceneInitialized.current && sceneRef.current) {
      camera.current.position.z = 30;
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      sceneRef.current.appendChild(renderer.current.domElement);

      const scene = new THREE.Scene();
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 3, 5);
      scene.add(light);

      // Initial texture
      const texture = new THREE.TextureLoader().load("/moon_texture.jpg");
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const geometry = new THREE.SphereGeometry(10, 32, 32);
      moon.current = new THREE.Mesh(geometry, material);
      scene.add(moon.current);

      controls.current = new OrbitControls(camera.current, renderer.current.domElement);
      controls.current.enableDamping = true;
      controls.current.dampingFactor = 0.25;

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.current.render(scene, camera.current);
      };
      animate();

      isSceneInitialized.current = true;
    }
  }, []);

  const visualizeMoonquake = (quake) => {
    const { lat, long } = quake;
    const position = latLongToVector3(lat, long, 10.5); // Position slightly above the moon surface
    camera.current.lookAt(position);
    controls.current.target.set(position.x, position.y, position.z);

    // Create ripple effect at the quake location
    const rippleGeometry = new THREE.CircleGeometry(1, 32);
    const rippleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
    ripple.position.set(position.x, position.y, position.z);
    ripple.lookAt(moon.current.position);
    moon.current.add(ripple);

    // Simple animation to grow the ripple effect
    let scale = 0.1;
    const animateRipple = () => {
      if (scale < 2) {
        scale += 0.05;
        ripple.scale.set(scale, scale, scale);
        requestAnimationFrame(animateRipple);
      } else {
        moon.current.remove(ripple);
      }
    };
    animateRipple();
  };

  const latLongToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div ref={sceneRef} className="scene-container">
      {/* Conditionally render dropdown and texture change button */}
      {showDropdown ? (
        <div>
          <div className="button-container">
            <span className="dropdown-text">Visualise Moon quake on:</span>
            <select onChange={(e) => visualizeMoonquake(moonquakeData[e.target.value])}>
              {moonquakeData.map((quake, index) => (
                <option value={index} key={index}>{quake.dateTime}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="landing-page">
          <h1>Moon Markers 2.0</h1>
          <button onClick={toggleDropdown} className="launch-button">Take me to the moon</button>
        </div>
      )}
    </div>
  );
};

export default App;
