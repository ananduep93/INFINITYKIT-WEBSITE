/**
 * Infinity Kit Premium Background Engine
 * Futuristic Neural Network & Gradient Mesh Animation
 * Powered by Three.js & GSAP
 */

class InfinityBackground {
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
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.particles = [];
        this.particleCount = window.innerWidth < 768 ? 40 : 100;
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // 1. Create Neural Network Particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
            
            this.particles.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.4,
                    (Math.random() - 0.5) * 0.4,
                    (Math.random() - 0.5) * 0.4
                )
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: 4,
            color: 0x0145F2, // Primary Blue
            transparent: true,
            opacity: 0.4,
            blending: THREE.NormalBlending
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        // 2. Lines Connecting Particles
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0145F2,
            transparent: true,
            opacity: 0.1,
        });

        // 3. Ambient Glowing Blobs (Mesh)
        this.createGlowBlobs();

        this.camera.position.z = 400;
    }

    createGlowBlobs() {
        const blobGeo = new THREE.SphereGeometry(150, 32, 32);
        const blobMat1 = new THREE.MeshBasicMaterial({
            color: 0x0145F2,
            transparent: true,
            opacity: 0.05,
        });
        
        this.blob1 = new THREE.Mesh(blobGeo, blobMat1);
        this.blob1.position.set(-200, 100, -200);
        this.scene.add(this.blob1);

        const blobMat2 = new THREE.MeshBasicMaterial({
            color: 0x7C3AED,
            transparent: true,
            opacity: 0.04,
        });
        this.blob2 = new THREE.Mesh(blobGeo, blobMat2);
        this.blob2.position.set(200, -100, -300);
        this.scene.add(this.blob2);
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            this.targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            gsap.to(this.scene.position, {
                y: scrollY * 0.2,
                duration: 1,
                ease: 'power2.out'
            });
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Mobile Interactions
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetMouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
                this.targetMouse.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth Mouse Follow
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        this.scene.rotation.y = this.mouse.x * 0.1;
        this.scene.rotation.x = this.mouse.y * 0.1;

        // Animate Particles
        const positions = this.points.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] += this.particles[i].velocity.x;
            positions[i * 3 + 1] += this.particles[i].velocity.y;
            positions[i * 3 + 2] += this.particles[i].velocity.z;

            // Bounce back
            if (Math.abs(positions[i * 3]) > 500) this.particles[i].velocity.x *= -1;
            if (Math.abs(positions[i * 3 + 1]) > 500) this.particles[i].velocity.y *= -1;
            if (Math.abs(positions[i * 3 + 2]) > 500) this.particles[i].velocity.z *= -1;
        }
        
        this.points.geometry.attributes.position.needsUpdate = true;

        // Animate Blobs
        const time = Date.now() * 0.001;
        this.blob1.position.x += Math.sin(time) * 0.2;
        this.blob1.position.y += Math.cos(time) * 0.2;
        this.blob2.position.x -= Math.sin(time) * 0.1;
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when libraries are loaded
function initInfinityBackground() {
    if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
        new InfinityBackground();
    } else {
        setTimeout(initInfinityBackground, 100);
    }
}

initInfinityBackground();
