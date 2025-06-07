// Import configuration from separate file
import { firebaseConfig } from './config.js';

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    enableIndexedDbPersistence 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    runTransaction, 
    off 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

// Firebase initialization with error handling
let app, auth, firestore, database;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    database = getDatabase(app);

    // Enable offline persistence for Firestore
    enableIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Offline persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support offline persistence.');
        }
    });
} catch (error) {
    console.error("Firebase initialization failed:", error);
    showFallbackUI();
    throw error;
}

// DOM Elements with null checks
const connectButton = document.getElementById('connectButton');
const connectText = document.getElementById('connectText');
const countElement = document.getElementById('connectionCount');

if (!connectButton || !connectText || !countElement) {
    throw new Error('Required DOM elements not found');
}

// Fallback UI when Firebase fails
function showFallbackUI() {
    connectButton.style.display = 'none';
    countElement.textContent = '5.5K+';
}

// Generate a persistent but privacy-conscious identifier
const getBrowserId = () => {
    const storageKey = 'barkada_browserId';
    let browserId = localStorage.getItem(storageKey);

    if (!browserId) {
        browserId = 'br-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(16) +
            '-' + Date.now().toString(16);
        try {
            localStorage.setItem(storageKey, browserId);
        } catch (e) {
            sessionStorage.setItem(storageKey, browserId);
        }
    }
    return browserId;
};

// Connection management with exponential backoff
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

const withRetry = async (fn, retries = MAX_RETRIES, delay = INITIAL_DELAY) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
};

// Check connection status with caching
const checkUserConnection = async () => {
    const browserId = getBrowserId();
    const connectionRef = doc(firestore, 'connections', browserId);

    try {
        const docSnap = await withRetry(() => getDoc(connectionRef));
        if (docSnap.exists()) {
            updateUI(true);
        }
    } catch (error) {
        console.error("Connection check failed:", error);
    }
};

// Update UI state
const updateUI = (isConnected) => {
    connectButton.classList.toggle('connected', isConnected);
    connectText.textContent = isConnected ? 'Connected' : 'Connect';
    connectButton.disabled = isConnected;
};

// Connection count management
let connectionCountListener;
const setupConnectionCountListener = () => {
    if (connectionCountListener) off(connectionCountListener);

    const countRef = ref(database, 'connectionCount');
    connectionCountListener = onValue(countRef, (snapshot) => {
        const count = snapshot.val() || 5500;
        updateCountUI(count);
    }, { onlyOnce: false });
};

// Optimized count UI update
let lastCountUpdate = 0;
const updateCountUI = (count) => {
    const now = performance.now();
    if (now - lastCountUpdate < 500) return;

    lastCountUpdate = now;

    requestAnimationFrame(() => {
        const formattedCount = count >= 1000 ?
            (Math.round(count / 100) / 10).toFixed(1) + 'K' :
            count.toString();

        if (countElement.textContent !== formattedCount) {
            countElement.classList.add('count-update');
            setTimeout(() => {
                countElement.classList.remove('count-update');
            }, 500);
            countElement.textContent = formattedCount;
        }
    });
};

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        checkUserConnection();
        setupConnectionCountListener();
    } else {
        signInAnonymously(auth).catch(error => {
            console.error("Silent sign-in failed:", error);
            updateCountUI(5500);
        });
    }
});

// Connect button handler
connectButton.addEventListener('click', async () => {
    const browserId = getBrowserId();
    updateUI(false);
    connectText.textContent = 'Connecting...';

    try {
        await withRetry(() => setDoc(doc(firestore, 'connections', browserId), {
            connectedAt: new Date(),
            browserId: browserId,
            userAgent: navigator.userAgent.substring(0, 100),
            screenResolution: `${window.screen.width}x${window.screen.height}`
        }));

        const countRef = ref(database, 'connectionCount');
        await runTransaction(countRef, (currentCount) => {
            return (currentCount || 5500) + 1;
        });

        updateUI(true);
    } catch (error) {
        console.error("Connection failed:", error);
        updateUI(false);
        connectText.textContent = 'Retry Connection';
    }
});

// Cleanup
window.addEventListener('beforeunload', () => {
    if (connectionCountListener) {
        off(connectionCountListener);
    }
});

// Service Worker registration
if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}