/**
 * Infinity Kit Premium Background Engine
 * Option 1: 3D Interactive Constellation Network
 * Powered by Three.js
 */

class Infinity3DBackground {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'infinity-bg-canvas';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.zIndex = '-1';
        this.container.style.pointerEvents = 'none';
        this.container.style.background = '#F8FAFC'; // Soft Slate White
        document.body.prepend(this.container);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 60 : 120;
        this.maxDistance = 150;
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // 1. Create Particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 800;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 800;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
            
            this.particles.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                )
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: 4,
            color: 0x0145F2, // Primary Blue
            transparent: true,
            opacity: 0.6,
            blending: THREE.NormalBlending
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        // 2. Create Lines Geometry
        this.lineGeometry = new THREE.BufferGeometry();
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x7C3AED, // Purple lines for contrast
            transparent: true,
            opacity: 0.2,
            blending: THREE.NormalBlending
        });
        
        this.lines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
        this.scene.add(this.lines);

        this.camera.position.z = 400;
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            this.targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mobile touch support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetMouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
                this.targetMouse.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth Mouse Follow (Parallax)
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        this.scene.rotation.y = this.mouse.x * 0.2;
        this.scene.rotation.x = this.mouse.y * 0.2;

        // Auto-rotation
        this.scene.rotation.y += 0.001;

        // Move Particles
        const positions = this.points.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] += this.particles[i].velocity.x;
            positions[i * 3 + 1] += this.particles[i].velocity.y;
            positions[i * 3 + 2] += this.particles[i].velocity.z;

            // Bounce back if they go too far
            if (Math.abs(positions[i * 3]) > 400) this.particles[i].velocity.x *= -1;
            if (Math.abs(positions[i * 3 + 1]) > 400) this.particles[i].velocity.y *= -1;
            if (Math.abs(positions[i * 3 + 2]) > 400) this.particles[i].velocity.z *= -1;
        }
        
        this.points.geometry.attributes.position.needsUpdate = true;

        // Update Lines
        const linePositions = [];
        let lineCount = 0;

        for (let i = 0; i < this.particleCount; i++) {
            for (let j = i + 1; j < this.particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < this.maxDistance) {
                    linePositions.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                    lineCount++;
                }
            }
        }

        this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
        this.lineGeometry.computeBoundingSphere(); // Required for rendering updates

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when libraries are loaded
function initInfinity3DBackground() {
    if (typeof THREE !== 'undefined') {
        new Infinity3DBackground();
    } else {
        setTimeout(initInfinity3DBackground, 100);
    }
}

initInfinity3DBackground();
