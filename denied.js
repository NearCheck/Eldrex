document.addEventListener('DOMContentLoaded', function() {
    // ===== PHYSICS ENGINE SETUP =====
    const Engine = Matter.Engine,
          Render = Matter.Render,
          World = Matter.World,
          Bodies = Matter.Bodies,
          Body = Matter.Body,
          Composite = Matter.Composite,
          Runner = Matter.Runner;

    // Create engine
    const engine = Engine.create({
        enableSleeping: true,
        gravity: { x: 0, y: 0.1, scale: 0.001 },
        timing: { timeScale: 0.8 }
    });

    // Create renderer
    const render = Render.create({
        canvas: document.getElementById('physics-canvas'),
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent',
            pixelRatio: Math.min(2, window.devicePixelRatio || 1)
        }
    });

    // ===== BUBBLES CREATION =====
    const colors = ['#FF5F6D', '#FFC371', '#4BC0C8', '#C779D0', '#FEAC5E'];
    const bubbles = Array.from({ length: 20 }, () => {
        const size = Math.random() * 30 + 20;
        const bubble = Bodies.circle(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.5,
            size, {
                restitution: 0.9,
                friction: 0.005,
                frictionAir: 0.02,
                density: 0.04,
                render: {
                    fillStyle: colors[Math.floor(Math.random() * colors.length)],
                    strokeStyle: 'rgba(255,255,255,0.3)',
                    lineWidth: 2,
                    opacity: 0.8
                }
            }
        );
        Body.applyForce(bubble, bubble.position, {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02
        });
        return bubble;
    });

    // ===== BOUNDARIES =====
    const boundaries = [
        Bodies.rectangle(window.innerWidth/2, window.innerHeight + 50, window.innerWidth, 100, { 
            isStatic: true, render: { visible: false } }),
        Bodies.rectangle(-50, window.innerHeight/2, 100, window.innerHeight, { 
            isStatic: true, render: { visible: false } }),
        Bodies.rectangle(window.innerWidth + 50, window.innerHeight/2, 100, window.innerHeight, { 
            isStatic: true, render: { visible: false } }),
        Bodies.rectangle(window.innerWidth/2, -50, window.innerWidth, 100, { 
            isStatic: true, render: { visible: false } })
    ];

    World.add(engine.world, [...bubbles, ...boundaries]);

    // ===== IMPROVED DEVICE MOTION HANDLING =====
    let beta = 0;  // Device tilt front-to-back (in degrees)
    let gamma = 0; // Device tilt left-to-right (in degrees)
    let lastUpdate = 0;
    const sensitivity = 0.0005;

    function handleOrientation(event) {
        // Throttle updates to ~60fps
        const now = Date.now();
        if (now - lastUpdate < 16) return;
        lastUpdate = now;

        beta = event.beta;  // -180 to 180 (front/back tilt)
        gamma = event.gamma; // -90 to 90 (left/right tilt)
        
        // Normalize values and apply sensitivity
        const forceX = Math.min(Math.max(gamma / 45, -1), 1) * sensitivity;
        const forceY = Math.min(Math.max(beta / 45, -1), 1) * sensitivity;
        
        // Apply forces to all bubbles
        bubbles.forEach(bubble => {
            Body.applyForce(bubble, bubble.position, {
                x: forceX,
                y: forceY
            });
        });
    }

    // Add event listeners for different device orientation APIs
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission
            document.addEventListener('click', function initialClick() {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                        }
                    })
                    .catch(console.error);
                document.removeEventListener('click', initialClick);
            });
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }

    // ===== TOUCH/MOUSE CONTROLS =====
    // ... (keep your existing touch/mouse control code) ...

    // ===== RUN THE SIMULATION =====
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // ===== WINDOW RESIZE HANDLER =====
    // ... (keep your existing resize handler) ...

    // ===== ACCESSIBILITY =====
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        engine.timing.timeScale = 0.3;
        bubbles.forEach(bubble => Body.setVelocity(bubble, { x: 0, y: 0 }));
    }
});