            import {
                initializeApp
            } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
            import {
                getAuth,
                signInAnonymously
            } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
            import {
                getFirestore,
                doc,
                setDoc,
                getDoc
            } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
            import {
                getDatabase,
                ref,
                onValue,
                runTransaction
            } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

            // Firebase Configuration
            const firebaseConfig = {
                apiKey: "AIzaSyBRcN1Uwv9g5SYQzfdofc0T8UgYkOAipMY",
                authDomain: "barkada-3c8c5.firebaseapp.com",
                databaseURL: "https://barkada-3c8c5-default-rtdb.firebaseio.com",
                projectId: "barkada-3c8c5",
                storageBucket: "barkada-3c8c5.firebasestorage.app",
                messagingSenderId: "484579003166",
                appId: "1:484579003166:web:e1ab0da6c9f4d6f739570f",
                measurementId: "G-NQ4JR7CC2T"
            };


            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const firestore = getFirestore(app);
            const database = getDatabase(app);

            // DOM Elements
            const connectButton = document.getElementById('connectButton');
            const connectText = document.getElementById('connectText');
            const countElement = document.getElementById('connectionCount');

            // Generate a unique identifier for this browser
            const getBrowserId = () => {
                let browserId = localStorage.getItem('browserId');
                if (!browserId) {
                    browserId = 'br-' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('browserId', browserId);
                }
                return browserId;
            };

            // Check if user is already connected
            const checkUserConnection = async () => {
                const browserId = getBrowserId();
                const connectionRef = doc(firestore, 'connections', browserId);

                try {
                    const docSnap = await getDoc(connectionRef);
                    if (docSnap.exists()) {
                        connectButton.classList.add('connected');
                        connectText.textContent = 'Connected';
                        connectButton.disabled = true;
                    }
                } catch (error) {
                    console.error("Error checking connection:", error);
                }
            };

            // Sign in anonymously and check connection
            signInAnonymously(auth)
                .then(() => {
                    console.log("Anonymous user authenticated");
                    checkUserConnection();

                    // Listen for real-time count updates
                    const countRef = ref(database, 'connectionCount');
                    onValue(countRef, (snapshot) => {
                        const count = snapshot.val() || 5500; // Default to 5.5K if no data

                        // Format number (5.5K)
                        const formattedCount = count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;

                        // Add animation
                        countElement.classList.add('count-update');
                        setTimeout(() => countElement.classList.remove('count-update'), 500);

                        countElement.textContent = formattedCount;
                    });
                })
                .catch(error => {
                    console.error("Anonymous auth error:", error);
                });

            // Connect button handler
            connectButton.addEventListener('click', async () => {
                const browserId = getBrowserId();

                // Show loading state
                connectText.textContent = 'Connecting...';
                connectButton.disabled = true;

                try {
                    // Record connection in Firestore
                    await setDoc(doc(firestore, 'connections', browserId), {
                        connectedAt: new Date(),
                        browserId: browserId
                    });

                    // Atomically increment count in Realtime DB
                    const countRef = ref(database, 'connectionCount');
                    await runTransaction(countRef, (currentCount) => {
                        return (currentCount || 5500) + 1;
                    });

                    // Update UI
                    connectButton.classList.add('connected');
                    connectText.textContent = 'Connected';
                } catch (error) {
                    console.error("Connection failed:", error);
                    connectText.textContent = 'Connect';
                    connectButton.disabled = false;
                }
            });