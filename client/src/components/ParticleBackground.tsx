import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Check WebGL support first
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL not supported, disabling particle background');
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      console.warn('WebGL check failed, disabling particle background');
      setWebglSupported(false);
      return;
    }
    
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let animationId: number;
    const allObjects: THREE.Group[] = [];
    
    try {
      // Scene setup
      scene = new THREE.Scene();
      
      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 2;
      
      // Renderer setup with error handling
      renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true,
        failIfMajorPerformanceCaveat: false
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      if (container.children.length > 0) {
        container.removeChild(container.children[0]);
      }
      
      container.appendChild(renderer.domElement);
      
      // Create candlestick particles, dollar signs, and dollar notes
      const candlesticksCount = window.innerWidth < 768 ? 80 : 150;
      const dollarSignsCount = window.innerWidth < 768 ? 40 : 70;
      const dollarNotesCount = window.innerWidth < 768 ? 25 : 50;
      const totalCount = candlesticksCount + dollarSignsCount + dollarNotesCount;
      const velocityArray = new Float32Array(totalCount * 3);
      
      for (let i = 0; i < candlesticksCount; i++) {
        const candlestickGroup = new THREE.Group();
        
        // Random position
        candlestickGroup.position.x = (Math.random() - 0.5) * 20;
        candlestickGroup.position.y = (Math.random() - 0.5) * 20;
        candlestickGroup.position.z = (Math.random() - 0.5) * 20;
        
        // Determine if bullish (green) or bearish (red)
        const isBullish = Math.random() > 0.5;
        const color = isBullish ? 0x00FF88 : 0xFF4444;
        
        // Create candlestick body
        const bodyGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.02);
        const bodyMaterial = new THREE.MeshBasicMaterial({ 
          color: color, 
          transparent: true, 
          opacity: 0.8 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Create candlestick wicks
        const wickGeometry = new THREE.BoxGeometry(0.01, 0.25, 0.01);
        const wickMaterial = new THREE.MeshBasicMaterial({ 
          color: color, 
          transparent: true, 
          opacity: 0.9 
        });
        const topWick = new THREE.Mesh(wickGeometry, wickMaterial);
        const bottomWick = new THREE.Mesh(wickGeometry, wickMaterial);
        
        topWick.position.y = 0.12;
        bottomWick.position.y = -0.12;
        
        candlestickGroup.add(body);
        candlestickGroup.add(topWick);
        candlestickGroup.add(bottomWick);
        
        candlestickGroup.rotation.x = Math.random() * Math.PI;
        candlestickGroup.rotation.y = Math.random() * Math.PI;
        candlestickGroup.rotation.z = Math.random() * Math.PI;
        
        velocityArray[i * 3] = (Math.random() - 0.5) * 0.015;
        velocityArray[i * 3 + 1] = -Math.random() * 0.02 - 0.008;
        velocityArray[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
        
        allObjects.push(candlestickGroup);
        scene.add(candlestickGroup);
      }
      
      // Create dollar sign particles
      for (let i = 0; i < dollarSignsCount; i++) {
        const dollarGroup = new THREE.Group();
        
        dollarGroup.position.x = (Math.random() - 0.5) * 20;
        dollarGroup.position.y = (Math.random() - 0.5) * 20;
        dollarGroup.position.z = (Math.random() - 0.5) * 20;
        
        const color = 0xFFFFFF;
        
        const topRingGeometry = new THREE.RingGeometry(0.04, 0.07, 8);
        const bottomRingGeometry = new THREE.RingGeometry(0.04, 0.07, 8);
        const dollarMaterial = new THREE.MeshBasicMaterial({ 
          color: color, 
          transparent: true, 
          opacity: 0.85,
          side: THREE.DoubleSide
        });
        
        const topRing = new THREE.Mesh(topRingGeometry, dollarMaterial);
        const bottomRing = new THREE.Mesh(bottomRingGeometry, dollarMaterial);
        
        topRing.position.y = 0.05;
        bottomRing.position.y = -0.05;
        
        const lineGeometry = new THREE.BoxGeometry(0.008, 0.18, 0.008);
        const lineMaterial = new THREE.MeshBasicMaterial({ 
          color: color, 
          transparent: true, 
          opacity: 0.9 
        });
        const line1 = new THREE.Mesh(lineGeometry, lineMaterial);
        const line2 = new THREE.Mesh(lineGeometry, lineMaterial);
        line2.position.x = 0.02;
        
        dollarGroup.add(topRing);
        dollarGroup.add(bottomRing);
        dollarGroup.add(line1);
        dollarGroup.add(line2);
        
        dollarGroup.rotation.x = Math.random() * Math.PI;
        dollarGroup.rotation.y = Math.random() * Math.PI;
        dollarGroup.rotation.z = Math.random() * Math.PI;
        
        const dollarIndex = candlesticksCount + i;
        velocityArray[dollarIndex * 3] = (Math.random() - 0.5) * 0.02;
        velocityArray[dollarIndex * 3 + 1] = -Math.random() * 0.025 - 0.01;
        velocityArray[dollarIndex * 3 + 2] = (Math.random() - 0.5) * 0.02;
        
        allObjects.push(dollarGroup);
        scene.add(dollarGroup);
      }
      
      // Create dollar note particles
      for (let i = 0; i < dollarNotesCount; i++) {
        const noteGroup = new THREE.Group();
        
        noteGroup.position.x = (Math.random() - 0.5) * 20;
        noteGroup.position.y = (Math.random() - 0.5) * 20;
        noteGroup.position.z = (Math.random() - 0.5) * 20;
        
        const noteGeometry = new THREE.PlaneGeometry(0.2, 0.12);
        const noteMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xE8F5E8,
          transparent: true, 
          opacity: 0.85,
          side: THREE.DoubleSide
        });
        const note = new THREE.Mesh(noteGeometry, noteMaterial);
        
        const borderGeometry = new THREE.EdgesGeometry(noteGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({ 
          color: 0x2F5233,
          transparent: true, 
          opacity: 0.9 
        });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        
        const detailGeometry = new THREE.PlaneGeometry(0.05, 0.03);
        const detailMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x1E4D72,
          transparent: true, 
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        const detail1 = new THREE.Mesh(detailGeometry, detailMaterial);
        const detail2 = new THREE.Mesh(detailGeometry, detailMaterial);
        
        detail1.position.set(-0.05, 0.02, 0.001);
        detail2.position.set(0.05, -0.02, 0.001);
        
        noteGroup.add(note);
        noteGroup.add(border);
        noteGroup.add(detail1);
        noteGroup.add(detail2);
        
        noteGroup.rotation.x = Math.random() * Math.PI;
        noteGroup.rotation.y = Math.random() * Math.PI;
        noteGroup.rotation.z = Math.random() * Math.PI;
        
        const noteIndex = candlesticksCount + dollarSignsCount + i;
        velocityArray[noteIndex * 3] = (Math.random() - 0.5) * 0.01;
        velocityArray[noteIndex * 3 + 1] = -Math.random() * 0.015 - 0.005;
        velocityArray[noteIndex * 3 + 2] = (Math.random() - 0.5) * 0.01;
        
        allObjects.push(noteGroup);
        scene.add(noteGroup);
      }
      
      // Mouse interaction
      let mouseX = 0;
      let mouseY = 0;
      
      function onMouseMove(event: MouseEvent) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      }
      
      window.addEventListener('mousemove', onMouseMove);
      
      function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      
      window.addEventListener('resize', handleResize);
      
      // Animation loop
      const clock = new THREE.Clock();
      
      const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        
        allObjects.forEach((object, index) => {
          object.position.x += velocityArray[index * 3];
          object.position.y += velocityArray[index * 3 + 1];
          object.position.z += velocityArray[index * 3 + 2];
          
          object.rotation.x += 0.01;
          object.rotation.y += 0.008;
          object.rotation.z += 0.005;
          
          if (object.position.y < -10) {
            object.position.x = (Math.random() - 0.5) * 20;
            object.position.y = 10;
            object.position.z = (Math.random() - 0.5) * 20;
            
            object.rotation.x = Math.random() * Math.PI;
            object.rotation.y = Math.random() * Math.PI;
            object.rotation.z = Math.random() * Math.PI;
          }
          
          if (Math.abs(object.position.x) > 10) {
            object.position.x = (Math.random() - 0.5) * 20;
          }
          if (Math.abs(object.position.z) > 10) {
            object.position.z = (Math.random() - 0.5) * 20;
          }
        });
        
        scene.position.y = Math.sin(elapsedTime * 0.1) * 0.1;
        
        if (mouseX !== 0 || mouseY !== 0) {
          scene.rotation.x += mouseY * 0.0001;
          scene.rotation.y += mouseX * 0.0001;
        }
        
        renderer.render(scene, camera);
        animationId = window.requestAnimationFrame(animate);
      };
      
      animate();
      
      // Cleanup function
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        
        if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        
        allObjects.forEach(object => {
          object.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (child.material instanceof THREE.Material) {
                child.material.dispose();
              }
            }
          });
        });
        
        if (renderer) {
          renderer.dispose();
        }
        if (scene) {
          scene.clear();
        }
      };
    } catch (error) {
      console.warn('Failed to initialize WebGL particle background:', error);
      setWebglSupported(false);
      return;
    }
  }, []);
  
  // Return nothing if WebGL is not supported
  if (!webglSupported) {
    return null;
  }
  
  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: 'transparent'
      }}
    />
  );
};

export default ParticleBackground;
