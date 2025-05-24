document.addEventListener('DOMContentLoaded', function() {
    // Main initialization
    initParticles();
    initMediaItems();
    initLinkItems();
    initButtons();
    initNameHoverEffect();
    initConnectionCheck();
    initProfilePicture();
    initEnhancedCard();
    initVerificationIcon();
    initFooterAnimation();

    // Event listeners for window events
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
});

// Three.js Particle System
let particleSystem, particles, particleGeometry, particleMaterial;
let scene, camera, renderer;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Particle system
    const particleCount = 1000;
    particleGeometry = new THREE.BufferGeometry();
    particles = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        particles[i * 3] = (Math.random() - 0.5) * 2000;
        particles[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        particles[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

    particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Animate
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate particles slightly
    if (particleSystem) {
        particleSystem.rotation.x += 0.0001;
        particleSystem.rotation.y += 0.0002;
        renderer.render(scene, camera);
    }
}

function handleWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function explodeParticles(x, y, intensity = 10, duration = 1) {
    if (!particleGeometry) return;

    const particlePositions = particleGeometry.attributes.position.array;
    const centerX = x - windowHalfX;
    const centerY = -(y - windowHalfY);

    gsap.to(particleMaterial, {
        opacity: 0.8,
        duration: duration * 0.2,
        ease: "power2.out"
    });

    for (let i = 0; i < particlePositions.length / 3; i++) {
        const dx = particlePositions[i * 3] - centerX;
        const dy = particlePositions[i * 3 + 1] - centerY;
        const dz = particlePositions[i * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const dirX = dx / distance;
        const dirY = dy / distance;
        const dirZ = dz / distance;

        const targetX = centerX + dirX * (Math.random() * 300 + 100) * intensity;
        const targetY = centerY + dirY * (Math.random() * 300 + 100) * intensity;
        const targetZ = dirZ * (Math.random() * 300 + 100) * intensity;

        gsap.to(particlePositions, {
            [i * 3]: targetX,
            [i * 3 + 1]: targetY,
            [i * 3 + 2]: targetZ,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                particleGeometry.attributes.position.needsUpdate = true;
            }
        });
    }

    gsap.to(particleMaterial, {
        opacity: 0,
        delay: duration * 0.8,
        duration: duration * 0.2,
        onComplete: () => {
            // Reset particles to random positions
            for (let i = 0; i < particlePositions.length / 3; i++) {
                particlePositions[i * 3] = (Math.random() - 0.5) * 2000;
                particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
                particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
            }
            particleGeometry.attributes.position.needsUpdate = true;
        }
    });
}

function pulseParticles(x, y) {
    if (!particleGeometry) return;

    const particlePositions = particleGeometry.attributes.position.array;
    const centerX = x - windowHalfX;
    const centerY = -(y - windowHalfY);

    for (let i = 0; i < particlePositions.length / 3; i++) {
        const radius = Math.random() * 50 + 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        particlePositions[i * 3] = centerX + radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = centerY + radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    particleGeometry.attributes.position.needsUpdate = true;

    gsap.to(particleMaterial, {
        opacity: 0.6,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
}

// Media Items Initialization
function initMediaItems() {
    const mediaItems = document.querySelectorAll('.media-item');
    if (!mediaItems.length) return;

    setTimeout(() => {
        const profilePic = document.getElementById('profile-picture');
        if (profilePic) {
            profilePic.classList.add('loaded');
            const img = profilePic.querySelector('img');
            if (img) {
                img.onload = function() {
                    const rect = profilePic.getBoundingClientRect();
                    explodeParticles(rect.x + profilePic.offsetWidth / 2, rect.y + profilePic.offsetHeight / 2);
                };
                img.src = img.src; // Trigger reload
            }
        }
    }, 800);

    mediaItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('loaded');
            const media = item.querySelector('img') || item.querySelector('video');
            if (media) {
                media.onload = function() {
                    const rect = item.getBoundingClientRect();
                    explodeParticles(rect.x + item.offsetWidth / 2, rect.y + item.offsetHeight / 2);
                };
                
                if (media.tagName === 'IMG') {
                    media.src = media.src;
                } else if (media.tagName === 'VIDEO' && media.querySelector('source')) {
                    media.querySelector('source').src = "sample-video.mp4";
                    media.load();
                }
            }

            item.addEventListener('mouseenter', function() {
                if (this.classList.contains('loaded')) {
                    const rect = this.getBoundingClientRect();
                    pulseParticles(rect.x + this.offsetWidth / 2, rect.y + this.offsetHeight / 2);
                }
            });
        }, 1000 + index * 300);
    });
}

// Link Items Initialization
function initLinkItems() {
    const linkItems = document.querySelectorAll('.link-item');
    linkItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('loaded');
        }, 2000 + index * 200);

        item.addEventListener('mouseenter', function() {
            const rect = this.getBoundingClientRect();
            explodeParticles(rect.x + this.offsetWidth / 2, rect.y + this.offsetHeight / 2, 5, 0.5);
        });
    });
}

// Buttons Initialization
function initButtons() {
    const initButton = (selector) => {
        const button = document.getElementById(selector);
        if (!button) return;

        button.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            const loader = this.querySelector('.progress-loader');
            const progressCircle = this.querySelector('.progress-circle');
            const checkmark = this.querySelector('.checkmark');

            if (loader) loader.classList.add('active');
            if (progressCircle) progressCircle.style.display = 'flex';
            if (checkmark) checkmark.style.display = 'none';

            setTimeout(() => {
                if (progressCircle) progressCircle.style.display = 'none';
                if (checkmark) checkmark.classList.add('show');

                setTimeout(() => {
                    window.location.href = this.getAttribute('href');
                }, 1000);
            }, 1500);
        });
    };

    initButton('email-button');
    initButton('call-button');

    // Shield badge
    const shieldBadge = document.getElementById('shieldBadge');
    if (shieldBadge) {
        shieldBadge.addEventListener('click', function() {
            gsap.to(this, {
                scale: 0.8,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut",
                onComplete: () => {
                    window.location.href = 'load.html';
                }
            });
        });

        // Tutorial for first-time visitors
        if (!localStorage.getItem('shieldTutorialSeen')) {
            shieldBadge.classList.add('tutorial');
            localStorage.setItem('shieldTutorialSeen', 'true');
            setTimeout(() => shieldBadge.classList.remove('tutorial'), 5000);
        }

        // Hover effects
        shieldBadge.addEventListener('mouseenter', () => {
            shieldBadge.style.transform = 'scale(1.1)';
            shieldBadge.style.filter = 'drop-shadow(0 0 8px rgba(81, 203, 238, 0.8))';
        });

        shieldBadge.addEventListener('mouseleave', () => {
            shieldBadge.style.transform = 'scale(1)';
            shieldBadge.style.filter = 'none';
        });
    }
}

// Name Hover Effect
function initNameHoverEffect() {
    const nameElement = document.getElementById('dust-name');
    if (!nameElement) return;

    let scene, camera, renderer, particleSystem;
    let isAnimating = false;
    const particleParams = {
        count: 2500,
        size: 0.8,
        dispersion: 1.5,
        windStrength: 0.5,
        turbulence: 0.3
    };

    nameElement.addEventListener('mouseenter', function() {
        if (isAnimating || !nameElement.textContent.trim()) return;
        initPremiumEffect();
    });

    function initPremiumEffect() {
        const originalStyles = {
            color: nameElement.style.color,
            position: nameElement.style.position,
            zIndex: nameElement.style.zIndex
        };

        // Create Three.js scene
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 400;

        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '10000';
        renderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(renderer.domElement);

        createPrecisionParticles();
        animateParticles();

        gsap.to(nameElement, {
            color: 'transparent',
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    function createPrecisionParticles() {
        const rect = nameElement.getBoundingClientRect();
        const textWidth = rect.width;
        const textHeight = rect.height;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleParams.count * 3);
        const sizes = new Float32Array(particleParams.count);
        const velocities = new Float32Array(particleParams.count * 3);
        const delays = new Float32Array(particleParams.count);

        const centerX = (rect.left + rect.width / 2 - window.innerWidth / 2) * 0.8;
        const centerY = (window.innerHeight / 2 - rect.top - rect.height / 2) * 0.8;

        for (let i = 0; i < particleParams.count; i++) {
            const x = centerX + (Math.random() - 0.5) * textWidth * 0.8;
            const y = centerY + (Math.random() - 0.5) * textHeight * 0.8;
            const z = (Math.random() - 0.5) * 20;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            velocities[i * 3] = (Math.random() * 2 - 1) * particleParams.turbulence;
            velocities[i * 3 + 1] = (Math.random() * 2 - 1) * particleParams.turbulence;
            velocities[i * 3 + 2] = (Math.random() * 2 - 1) * particleParams.turbulence;

            sizes[i] = Math.random() * particleParams.size * 2;
            delays[i] = Math.random() * 1.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('delay', new THREE.BufferAttribute(delays, 1));

        const material = new THREE.PointsMaterial({
            size: particleParams.size,
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            alphaTest: 0.01
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
    }

    function animateParticles() {
        isAnimating = true;
        let startTime = Date.now();

        const positionAttribute = particleSystem.geometry.getAttribute('position');
        const velocityAttribute = particleSystem.geometry.getAttribute('velocity');
        const delayAttribute = particleSystem.geometry.getAttribute('delay');
        const positions = positionAttribute.array;
        const velocities = velocityAttribute.array;

        const windDirection = new THREE.Vector3(
            particleParams.windStrength,
            particleParams.windStrength * 0.3,
            0
        );
        const gravity = -0.01;
        const drag = 0.98;

        const render = () => {
            if (!isAnimating) return;

            const elapsed = (Date.now() - startTime) / 1000;

            for (let i = 0; i < particleParams.count; i++) {
                const delay = delayAttribute.array[i];
                if (elapsed < delay) continue;

                const i3 = i * 3;
                const windFactor = Math.min(1, (elapsed - delay) * 0.5);
                velocities[i3] += windDirection.x * windFactor;
                velocities[i3 + 1] += windDirection.y * windFactor;
                velocities[i3 + 2] += windDirection.z * windFactor;

                velocities[i3 + 1] += gravity;
                velocities[i3] *= drag;
                velocities[i3 + 1] *= drag;
                velocities[i3 + 2] *= drag;

                positions[i3] += velocities[i3];
                positions[i3 + 1] += velocities[i3 + 1];
                positions[i3 + 2] += velocities[i3 + 2];
            }

            positionAttribute.needsUpdate = true;

            const fadeStart = 2.5;
            if (elapsed > fadeStart) {
                particleSystem.material.opacity = 1 - ((elapsed - fadeStart) / 3);
            }

            renderer.render(scene, camera);

            if (elapsed > 6 || particleSystem.material.opacity <= 0) {
                cleanup();
            } else {
                requestAnimationFrame(render);
            }
        };

        render();
    }

    function cleanup() {
        isAnimating = false;
        gsap.to(nameElement, {
            color: '',
            duration: 0.5,
            ease: 'power2.inOut'
        });

        if (renderer && renderer.domElement.parentNode) {
            document.body.removeChild(renderer.domElement);
        }

        scene = null;
        camera = null;
        renderer = null;
        particleSystem = null;
    }
}

// Connection Check
function initConnectionCheck() {
    checkConnection();
    setInterval(checkConnection, 10000);
}

function checkConnection() {
    Promise.race([
            fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store'
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ])
        .then(() => {
            if (window.location.pathname.endsWith('no.html')) {
                document.body.classList.add('page-exit-animation');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            }
        })
        .catch(() => {
            if (!window.location.pathname.endsWith('no.html')) {
                document.body.classList.add('page-exit-animation');
                setTimeout(() => {
                    window.location.href = 'no.html';
                }, 800);
            }
        });
}

// Profile Picture
function initProfilePicture() {
    const profilePicture = document.getElementById('profile-picture');
    if (!profilePicture) return;

    const imgElement = profilePicture.querySelector('img');
    if (!imgElement) return;

    const images = [
        "https://ucarecdn.com/f7a97b92-31bd-4e03-a3f4-af5c99c95453/-/preview/750x1000/",
        "https://ucarecdn.com/16d4d51c-3864-4320-a393-d6af0e9d0e98/-/preview/617x588/",
        "https://ucarecdn.com/c07a4845-c61a-4ab8-9408-77c7300191fc/-/preview/1000x1000/"
    ];

    let currentImageIndex = 0;

    function transitionToNextImage() {
        imgElement.classList.add('melting');

        setTimeout(() => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            imgElement.src = images[currentImageIndex];
            imgElement.classList.remove('melting');
            imgElement.classList.add('appearing');

            setTimeout(() => {
                imgElement.classList.remove('appearing');
            }, 1000);
        }, 1500);
    }

    // Auto-transition every 8 seconds
    const intervalId = setInterval(transitionToNextImage, 8000);

    // Hover transition
    let hoverTimer;
    profilePicture.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(transitionToNextImage, 2000);
    });

    profilePicture.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
    });

    // Right-click protection
    imgElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        window.location.href = "blocked.html";
    });

    imgElement.setAttribute('draggable', 'false');
}

// Enhanced Card
function initEnhancedCard() {
    const card = document.querySelector('.enhanced-image-card');
    if (!card) return;

    const minimizeBtn = card.querySelector('.minimize-btn');
    const restoreBtn = card.querySelector('.restore-btn');
    const imageContainer = card.querySelector('.image-container');

    setTimeout(() => {
        card.classList.add('loaded');
        if (imageContainer) imageContainer.style.display = 'block';
    }, 1500);

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            card.classList.add('hidden');
        });
    }

    if (restoreBtn) {
        restoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            card.classList.remove('hidden');
        });
    }
}

// Verification Icon
function initVerificationIcon() {
    const container = document.getElementById('verify-icon-container');
    if (!container) return;

    const img = document.createElement("img");
    img.src = "verify.svg";
    img.alt = "Verified";
    img.style.width = "1em";
    img.style.height = "5em";
    img.style.verticalAlign = "middle";
    img.style.userSelect = "none";
    img.style.pointerEvents = "auto";
    img.draggable = false;

    // Event handlers
    img.oncontextmenu = (e) => {
        e.preventDefault();
        return false;
    };
    img.ondragstart = (e) => {
        window.location.href = "blocked.html";
        return false;
    };

    let pressTimer;
    const clearPressTimer = () => clearTimeout(pressTimer);

    img.addEventListener("mousedown", () => {
        pressTimer = setTimeout(() => {
            window.location.href = "blocked.html";
        }, 500);
    });
    img.addEventListener("mouseup", clearPressTimer);
    img.addEventListener("mouseleave", clearPressTimer);

    img.addEventListener("touchstart", () => {
        pressTimer = setTimeout(() => {
            window.location.href = "blocked.html";
        }, 500);
    });
    img.addEventListener("touchend", clearPressTimer);
    img.addEventListener("touchcancel", clearPressTimer);

    container.appendChild(img);
}

// Footer Animation
function initFooterAnimation() {
    window.addEventListener('load', () => {
        const footer = document.getElementById('pageFooter');
        if (!footer) return;

        gsap.to(footer, {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 1.5,
            ease: "power2.out"
        });

        const footerLogo = document.querySelector(".footer-logo");
        if (footerLogo) {
            footerLogo.addEventListener("mouseenter", () => {
                gsap.to(footerLogo, {
                    scale: 1.1,
                    opacity: 1,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                });
            });
        }
    });
}
