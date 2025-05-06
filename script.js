        document.addEventListener('DOMContentLoaded', function() {
            initParticles();

            setTimeout(() => {
                const profilePic = document.getElementById('profile-picture');
                profilePic.classList.add('loaded');
                profilePic.querySelector('img').onload = function() {
                    explodeParticles(profilePic.getBoundingClientRect().x + profilePic.offsetWidth / 2,
                        profilePic.getBoundingClientRect().y + profilePic.offsetHeight / 2);
                };

                profilePic.querySelector('img').src = profilePic.querySelector('img').src;
            }, 800);

            const mediaItems = document.querySelectorAll('.media-item');
            mediaItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('loaded');
                    const media = item.querySelector('img') || item.querySelector('video');
                    if (media) {
                        media.onload = function() {
                            // Trigger particle animation when media item loads
                            explodeParticles(item.getBoundingClientRect().x + item.offsetWidth / 2,
                                item.getBoundingClientRect().y + item.offsetHeight / 2);
                        };
                        // Force media load (in a real scenario, this would happen naturally)
                        if (media.tagName === 'IMG') {
                            media.src = media.src;
                        } else if (media.tagName === 'VIDEO' && media.querySelector('source')) {
                            media.querySelector('source').src = "sample-video.mp4";
                            media.load();
                        }
                    }
                }, 1000 + index * 300);
            });

            const linkItems = document.querySelectorAll('.link-item');
            linkItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('loaded');
                }, 2000 + index * 200);
            });

            document.getElementById('email-button').addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();
                    return;
                }

                e.preventDefault();
                const loader = this.querySelector('.progress-loader');
                const progressCircle = this.querySelector('.progress-circle');
                const checkmark = this.querySelector('.checkmark');

                loader.classList.add('active');
                progressCircle.style.display = 'flex';
                checkmark.style.display = 'none';

                // Simulate loading and then redirect
                setTimeout(() => {
                    progressCircle.style.display = 'none';
                    checkmark.classList.add('show');

                    setTimeout(() => {
                        window.location.href = this.getAttribute('href');
                    }, 1000);
                }, 1500);
            });

            document.getElementById('call-button').addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();
                    return;
                }

                e.preventDefault();
                const loader = this.querySelector('.progress-loader');
                const progressCircle = this.querySelector('.progress-circle');
                const checkmark = this.querySelector('.checkmark');

                loader.classList.add('active');
                progressCircle.style.display = 'flex';
                checkmark.style.display = 'none';

                setTimeout(() => {
                    progressCircle.style.display = 'none';
                    checkmark.classList.add('show');

                    setTimeout(() => {
                        window.location.href = this.getAttribute('href');
                    }, 1000);
                }, 1500);
            });

            linkItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    explodeParticles(this.getBoundingClientRect().x + this.offsetWidth / 2,
                        this.getBoundingClientRect().y + this.offsetHeight / 2, 5, 0.5);
                });
            });

            mediaItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    if (this.classList.contains('loaded')) {
                        pulseParticles(this.getBoundingClientRect().x + this.offsetWidth / 2,
                            this.getBoundingClientRect().y + this.offsetHeight / 2);
                    }
                });
            });
        });

        let particleSystem, particles, particleGeometry, particleMaterial;
        let scene, camera, renderer;
        let mouseX = 0,
            mouseY = 0;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        function initParticles() {
            const canvas = document.getElementById('particles-canvas');

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
            camera.position.z = 500;

            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);

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

            window.addEventListener('resize', onWindowResize);

            animate();
        }

        function onWindowResize() {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            // Rotate particles slightly
            particleSystem.rotation.x += 0.0001;
            particleSystem.rotation.y += 0.0002;

            renderer.render(scene, camera);
        }

        function explodeParticles(x, y, intensity = 10, duration = 1) {
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

        document.addEventListener('DOMContentLoaded', function() {
            const nameElement = document.getElementById('dust-name');
            let scene, camera, renderer, particles, isAnimating = false;
            let particleSystem;
            const particleParams = {
                count: 2500,
                size: 0.8,
                dispersion: 1.5,
                windStrength: 0.5,
                turbulence: 0.3
            };

            // Premium initialization with GSAP
            function initPremiumEffect() {
                // Store original styles
                const originalStyles = {
                    color: nameElement.style.color,
                    position: nameElement.style.position,
                    zIndex: nameElement.style.zIndex
                };

                // Create fullscreen Three.js scene
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

                // Create precise text-aligned particles
                createPrecisionParticles();

                // Animate with physics
                animateParticles();

                // Fade out original text smoothly
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

                // Create buffer geometry
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(particleParams.count * 3);
                const sizes = new Float32Array(particleParams.count);
                const velocities = new Float32Array(particleParams.count * 3);
                const delays = new Float32Array(particleParams.count);

                // Calculate center position (convert DOM to Three.js coords)
                const centerX = (rect.left + rect.width / 2 - window.innerWidth / 2) * 0.8;
                const centerY = (window.innerHeight / 2 - rect.top - rect.height / 2) * 0.8;

                // Distribute particles precisely within text bounds
                for (let i = 0; i < particleParams.count; i++) {
                    // Position particles in text shape
                    const x = centerX + (Math.random() - 0.5) * textWidth * 0.8;
                    const y = centerY + (Math.random() - 0.5) * textHeight * 0.8;
                    const z = (Math.random() - 0.5) * 20;

                    positions[i * 3] = x;
                    positions[i * 3 + 1] = y;
                    positions[i * 3 + 2] = z;

                    // Random velocities (wind + turbulence)
                    velocities[i * 3] = (Math.random() * 2 - 1) * particleParams.turbulence;
                    velocities[i * 3 + 1] = (Math.random() * 2 - 1) * particleParams.turbulence;
                    velocities[i * 3 + 2] = (Math.random() * 2 - 1) * particleParams.turbulence;

                    // Size variation
                    sizes[i] = Math.random() * particleParams.size * 2;

                    // Staggered animation delays
                    delays[i] = Math.random() * 1.5;
                }

                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
                geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
                geometry.setAttribute('delay', new THREE.BufferAttribute(delays, 1));

                // Premium material with subtle shine
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

                // Physics parameters
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

                    // Update each particle with physics
                    for (let i = 0; i < particleParams.count; i++) {
                        const delay = delayAttribute.array[i];
                        if (elapsed < delay) continue;

                        const i3 = i * 3;

                        // Apply wind force (increases over time)
                        const windFactor = Math.min(1, (elapsed - delay) * 0.5);
                        velocities[i3] += windDirection.x * windFactor;
                        velocities[i3 + 1] += windDirection.y * windFactor;
                        velocities[i3 + 2] += windDirection.z * windFactor;

                        // Apply gravity
                        velocities[i3 + 1] += gravity;

                        // Apply drag
                        velocities[i3] *= drag;
                        velocities[i3 + 1] *= drag;
                        velocities[i3 + 2] *= drag;

                        // Update position
                        positions[i3] += velocities[i3];
                        positions[i3 + 1] += velocities[i3 + 1];
                        positions[i3 + 2] += velocities[i3 + 2];
                    }

                    positionAttribute.needsUpdate = true;

                    // Fade out system gradually
                    const fadeStart = 2.5;
                    if (elapsed > fadeStart) {
                        particleSystem.material.opacity = 1 - ((elapsed - fadeStart) / 3);
                    }

                    renderer.render(scene, camera);

                    // End condition
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

                // Clear Three.js objects
                scene = null;
                camera = null;
                renderer = null;
                particleSystem = null;
            }

            // Enhanced hover interaction
            nameElement.addEventListener('mouseenter', function() {
                if (isAnimating || !nameElement.textContent.trim()) return;
                initPremiumEffect();
            });

            // Handle resize
            window.addEventListener('resize', function() {
                if (isAnimating && camera && renderer) {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
            });
        });


        document.getElementById('shieldBadge').addEventListener('click', function() {
            // Animate the shield first
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






        // Sophisticated quotes
        const quotes = [{
                text: "Numbers may define you, but it's your will to give them meaning.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A man who can do what he wants, does what he wants.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Change is our only goal, and that’s why we're here—to create a new story and become part of history.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "An old book might look like trash, yet it has the power to change lives, even if people can’t see its worth at first glance.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "If life is a labyrinth of illusions, then perhaps my purpose is not to escape, but to wander. To question without answer, to search without end—this may be the only truth we ever know.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "To exist is to question; to question is to live. And if all else is illusion, let my curiosity be real.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "What we deny within ourselves becomes the force that controls us, and what we allow to grow becomes the power that frees us.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Time won’t wait for you, so make sure you don’t wait for it.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "It may feel easier to wear a mask of false emotions than to reveal your true self to others.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I’m in love—not with you, but with the essence of who you are.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Curiosity drives me, yet understanding eludes me. I am drawn to truth like a moth to flame, yet I am burned by my limitations. Am I cursed to seek, but never to find?",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Loyalty is not about staying—it’s about choosing what serves you best. But if ever you return, know that I’ll still be here, ready to listen.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Focus isn’t about being perfect—it’s about showing up, trying, and taking one step at a time. Every small effort brings you closer to your dreams.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Life offers only two choices: failure or success. The journey you take depends on the choices you make.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "If nothing else can do it for you, take that first step for yourself.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "All of what we consider in this reality could be creations of our imaginative minds.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Everything you see around you is the creation of someone who may seem less intelligent than you, but in their pursuit of curiosity, they possess a unique kind of wisdom.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "People speak boldly of their dreams, yet often fail to act upon them. They remain seated, waiting, as if bound by invisible chains, commanded and diminished, unaware that their true freedom lies in their own hands.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "My base is my castle, until the AI comes knocking.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Warfare is won by wit, not just weapons.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "What's the input, and what's the output of my existence?",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "We created devices and tools to understand human nature, but what if we ourselves are part of a complex simulation? Perhaps what we see and know is merely a construct of human design—leaving us to wonder if we are being told the whole truth.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Sometimes, it's people themselves who make things seem impossible.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "If the pursuit of answers to our existence leads only to more uncertainty, can true understanding ever be achieved, or is the journey itself the only meaningful part of the process?",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Is truth merely a reflection of the lies we choose to believe?",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "What if the answers we seek were never meant to be found, but to push us further into the unknown?",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "A mother's love transcends physical gestures and outward expressions. It's the profound depth of her heart, the warmth of her soul, and the unwavering devotion that resonates deeply within you.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Her eyes don’t just shine—they speak in ways words never could. Her voice isn’t just a sound—it’s a warmth that lingers. And when she holds me, it’s more than a touch; it’s home.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "His hands tell stories of strength, his presence feels like greatness itself. But it’s his eyes—they hold the depth of a thousand unspoken words. And his voice? It’s the kind of perfection that isn’t heard, but felt.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Love isn’t something you define—it’s something you recognize when it’s real. It’s a gift you never knew you needed until it finds you.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I tell myself I can move on, but the truth is—I compare everyone to you. And no one comes close. You’re not just special; you’re the kind of incredible that can’t be replaced.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "I serve people not a company.",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Still be the Blue",
                author: "Eldrex Delos Reyes Bula"
            },
            {
                text: "Fly again, My blue",
                author: "Eldrex Delos Reyes Bula"
            }
        ];
        // Initialize carousel
        function initCarousel() {
            const carousel = document.getElementById('quotesCarousel');
            carousel.innerHTML = '';

            quotes.forEach((quote, index) => {
                const quoteCard = document.createElement('div');
                quoteCard.className = `quote-card ${index === 0 ? 'active' : ''}`;
                quoteCard.innerHTML = `
        <blockquote>${quote.text}</blockquote>
        <cite>— ${quote.author}</cite>
      `;
                carousel.appendChild(quoteCard);

                // Animate in with physics
                if (index === 0) {
                    gsap.from(quoteCard, {
                        opacity: 0,
                        y: 30,
                        rotation: -1,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.5)",
                        delay: 0.3
                    });
                }
            });
        }

        // Toggle quotes visibility
        function toggleQuotes() {
            const wrapper = document.querySelector('.quotes-carousel-wrapper');
            const icon = document.querySelector('.dropdown-icon');

            if (wrapper.style.display === 'block') {
                // Collapse with physics
                gsap.to(wrapper, {
                    opacity: 0,
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        wrapper.style.display = 'none';
                    }
                });
                icon.style.transform = 'rotate(0deg)';
            } else {
                // Expand with physics
                wrapper.style.display = 'block';
                initCarousel();

                gsap.from(wrapper, {
                    opacity: 0,
                    height: 0,
                    duration: 0.6,
                    ease: "power2.out"
                });

                gsap.to(wrapper, {
                    opacity: 1,
                    height: 'auto',
                    duration: 0.6,
                    ease: "power2.out"
                });

                icon.style.transform = 'rotate(180deg)';
            }
        }

        // Manual scroll with momentum
        function scrollQuotes(direction) {
            const carousel = document.getElementById('quotesCarousel');
            const scrollAmount = carousel.clientWidth * direction;

            gsap.to(carousel, {
                scrollLeft: `+=${scrollAmount}`,
                duration: 0.8,
                ease: "power2.out",
                onComplete: updateActiveCard
            });
        }

        // Update active card with physics animation
        function updateActiveCard() {
            const carousel = document.getElementById('quotesCarousel');
            const cards = document.querySelectorAll('.quote-card');
            const scrollPos = carousel.scrollLeft + (carousel.clientWidth / 2);

            cards.forEach(card => {
                card.classList.remove('active');
                const cardPos = card.offsetLeft + (card.clientWidth / 2);

                if (Math.abs(scrollPos - cardPos) < card.clientWidth / 2) {
                    card.classList.add('active');

                    // Physics-based animation
                    gsap.fromTo(card, {
                        y: 20,
                        opacity: 0.5,
                        rotation: -0.5
                    }, {
                        y: 0,
                        opacity: 1,
                        rotation: 0,
                        duration: 0.6,
                        ease: "back.out(1.2)"
                    });
                }
            });
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Add glossy hover effect
            const button = document.querySelector('.quotes-toggle');
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                gsap.to(button, {
                    '--x': `${x}px`,
                    '--y': `${y}px`,
                    duration: 0.3,
                    ease: "power1.out"
                });
            });

            // Detect system color scheme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                // Forces CSS variables to update
                document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
            });

            // Update active card on manual scroll
            const carousel = document.getElementById('quotesCarousel');
            if (carousel) {
                carousel.addEventListener('scroll', updateActiveCard);
            }
        });





        // script.js - Internet Connection Detection with Premium UI
        document.addEventListener('DOMContentLoaded', function() {
            // Premium connection detection with multiple fallbacks
            function checkConnection() {
                // Multi-layered detection approach
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
                            // Premium transition to offline page
                            document.body.classList.add('page-exit-animation');
                            setTimeout(() => {
                                window.location.href = 'no.html';
                            }, 800);
                        }
                    });
            }

            checkConnection();

            // Continuous monitoring (every 10 seconds)
            setInterval(checkConnection, 10000);

            window.addEventListener('online', checkConnection);
            window.addEventListener('offline', checkConnection);
        });


        document.getElementById('dust-name').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            window.location.href = "blocked.html"; // Redirect if right-clicked
        });

        document.querySelector('#dust-name img').setAttribute('draggable', 'false');

document.addEventListener('DOMContentLoaded', function() {
                    const profilePicture = document.getElementById('profile-picture');
                    const imgElement = profilePicture.querySelector('img');
                    const shieldBadge = document.getElementById('shieldBadge');
                    const images = [
                        "https://ucarecdn.com/f7a97b92-31bd-4e03-a3f4-af5c99c95453/-/preview/750x1000/",
                        "https://ucarecdn.com/16d4d51c-3864-4320-a393-d6af0e9d0e98/-/preview/617x588/", // Replace with your second image
                        "https://ucarecdn.com/c07a4845-c61a-4ab8-9408-77c7300191fc/-/preview/1000x1000/" // Replace with your third image
                    ];

                    let currentImageIndex = 0;

                    // Add tutorial class to shield badge for first-time visitors
                    if (!localStorage.getItem('shieldTutorialSeen')) {
                        shieldBadge.classList.add('tutorial');
                        localStorage.setItem('shieldTutorialSeen', 'true');

                        // Remove tutorial animation after 5 seconds
                        setTimeout(() => {
                            shieldBadge.classList.remove('tutorial');
                        }, 5000);
                    }

                    // Set up melting/transition effect
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
                    setInterval(transitionToNextImage, 8000);

                    // Also transition on hover after 2 seconds
                    let hoverTimer;
                    profilePicture.addEventListener('mouseenter', () => {
                        hoverTimer = setTimeout(transitionToNextImage, 2000);
                    });

                    profilePicture.addEventListener('mouseleave', () => {
                        clearTimeout(hoverTimer);
                    });

                    // Shield badge hover effect
                    shieldBadge.addEventListener('mouseenter', () => {
                        shieldBadge.style.transform = 'scale(1.1)';
                        shieldBadge.style.filter = 'drop-shadow(0 0 8px rgba(81, 203, 238, 0.8))';
                    });

                    shieldBadge.addEventListener('mouseleave', () => {
                        shieldBadge.style.transform = 'scale(1)';
                        shieldBadge.style.filter = 'none';
                    });
                });