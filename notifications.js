/**
 * Infinity Kit - Universal Notification Engine
 * Handles persistence (IndexedDB), Permissons, and Scheduling.
 */

const NOTIF_SOUND_BASE64 = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YTtvT18A/f39/f39/f39/f39/f39/f39/f39/f39/f39/X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX2BgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG..."; // Simplified for brevity in code, I will provide a real short beep in the actual file.

class AlertStore {
    constructor() {
        this.dbName = 'InfinityKitAlerts';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = () => reject('IDB Error');
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('alerts')) {
                    db.createObjectStore('alerts', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async add(alert) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('alerts', 'readwrite');
            const store = tx.objectStore('alerts');
            const request = store.add(alert);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getAll() {
        return new Promise((resolve) => {
            const tx = this.db.transaction('alerts', 'readonly');
            const store = tx.objectStore('alerts');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    }

    async delete(id) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('alerts', 'readwrite');
            const store = tx.objectStore('alerts');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
        });
    }

    async update(alert) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('alerts', 'readwrite');
            const store = tx.objectStore('alerts');
            const request = store.put(alert);
            request.onsuccess = () => resolve();
        });
    }

    async clearExpired() {
        const alerts = await this.getAll();
        const now = Date.now();
        for (const a of alerts) {
            if (a.timestamp < now - 3600000) { // Keep for 1h after trigger
                await this.delete(a.id);
            }
        }
    }
}

const alertStore = new AlertStore();

const NotificationManager = {
    audio: null,
    triggeredSet: new Set(),
    
    async init() {
        await alertStore.init();
        this.setupAudio();
        this.checkPermissions();
        this.startEngine();
    },

    setupAudio() {
        // High-pitched clear beep
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.playBeep = () => {
            if (localStorage.getItem('notif_sound') === 'off') return;
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        };
    },

    async requestPermission() {
        if (!('Notification' in window)) return 'unsupported';
        const permission = await Notification.requestPermission();
        this.updateUIStatus();
        return permission;
    },

    checkPermissions() {
        this.updateUIStatus();
    },

    updateUIStatus() {
        const indicators = document.querySelectorAll('.notif-status');
        const status = Notification.permission;
        
        indicators.forEach(el => {
            if (status === 'granted') {
                el.innerHTML = '<span class="status-icon success">🔔 Enabled</span>';
            } else if (status === 'denied') {
                el.innerHTML = '<span class="status-icon danger">❌ Disabled</span>';
            } else {
                el.innerHTML = '<span class="status-icon warning" onclick="NotificationManager.requestPermission()">⏳ Setup Notifications</span>';
            }
        });
    },

    async schedule(title, message, timeMinutes, type, extra = {}) {
        const timestamp = Date.now() + (timeMinutes * 60 * 1000);
        const alert = { title, message, timestamp, type, ...extra, status: 'pending' };
        const id = await alertStore.add(alert);
        
        showToast('✓ Alert Scheduled!', 'success');
        this.updateActiveLists();
        return id;
    },

    async scheduleExact(title, message, dateStr, timeStr, type, extra = {}) {
        const timestamp = new Date(`${dateStr}T${timeStr}`).getTime();
        const alert = { title, message, timestamp, type, ...extra, status: 'pending' };
        const id = await alertStore.add(alert);
        
        showToast('✓ Reminder Set!', 'success');
        this.updateActiveLists();
        return id;
    },

    startEngine() {
        setInterval(async () => {
            const alerts = await alertStore.getAll();
            const now = Date.now();
            
            for (const a of alerts) {
                if (a.status === 'pending' && a.timestamp <= now && !this.triggeredSet.has(a.id)) {
                    this.trigger(a);
                }
            }
        }, 1000); // Check every second
    },

    async trigger(alert) {
        if (this.triggeredSet.has(alert.id)) return;
        this.triggeredSet.add(alert.id);
        
        alert.status = 'triggered';
        
        // Show Local Notification
        if (Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(alert.title, {
                body: alert.message,
                icon: 'icon-192.png',
                badge: 'icon-192.png',
                vibrate: [200, 100, 200],
                data: { id: alert.id, type: alert.type },
                actions: [
                    { action: 'done', title: '✅ Done' },
                    { action: 'snooze', title: '⏳ Snooze 10m' }
                ]
            });
            this.playBeep();
        } else {
            // Fallback to simple toast if focused
            showToast(`⏰ ${alert.title}: ${alert.message}`, 'info');
            this.playBeep();
        }

        // SAVE STATUS TO DB IMMEDIATELY TO PREVENT REPEATING
        await alertStore.update(alert);
        this.updateActiveLists();
    },

    async updateActiveLists() {
        const container = document.getElementById('activeRemindersList');
        if (!container) return;

        const alerts = await alertStore.getAll();
        const pending = alerts.filter(a => a.status === 'pending').sort((a, b) => a.timestamp - b.timestamp);

        if (pending.length === 0) {
            container.innerHTML = '<p style="text-align:center; opacity:0.6; padding:10px;">No active reminders</p>';
            return;
        }

        container.innerHTML = pending.map(a => `
            <div class="reminder-card active">
                <div class="reminder-info">
                    <div class="reminder-title">${a.title}</div>
                    <div class="reminder-time">${new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <button class="delete-rem-btn" onclick="NotificationManager.cancelAlert(${a.id})">🗑️</button>
            </div>
        `).join('');
    },

    async cancelAlert(id) {
        await alertStore.delete(id);
        this.updateActiveLists();
        showToast('Alert canceled', 'info');
    }
};

window.NotificationManager = NotificationManager;
