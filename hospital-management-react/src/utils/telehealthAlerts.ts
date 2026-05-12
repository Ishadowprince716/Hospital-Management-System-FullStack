let audioContext: AudioContext | null = null;
let ringtoneTimer: number | null = null;
let ringtoneDelayTimer: number | null = null;
let telehealthInCall = false;

const getAudioContext = () => {
    if (audioContext) return audioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    return audioContext;
};

const playTone = (frequency: number, duration = 0.18, volume = 0.08) => {
    try {
        const context = getAudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.value = volume;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
    } catch {
        // Browsers can block audio before the first user interaction.
    }
};

export const unlockTelehealthAudio = async () => {
    try {
        const context = getAudioContext();
        if (context.state === 'suspended') {
            await context.resume();
        }
        localStorage.setItem('telehealthAudioEnabled', 'true');
        return true;
    } catch {
        return false;
    }
};

export const startIncomingRingtone = () => {
    if (telehealthInCall) return;
    stopIncomingRingtone();
    playTone(880, 0.16, 0.09);
    ringtoneDelayTimer = window.setTimeout(() => {
        if (!telehealthInCall) playTone(660, 0.2, 0.08);
    }, 210);
    ringtoneTimer = window.setInterval(() => {
        if (telehealthInCall) {
            stopIncomingRingtone();
            return;
        }
        playTone(880, 0.16, 0.09);
        ringtoneDelayTimer = window.setTimeout(() => {
            if (!telehealthInCall) playTone(660, 0.2, 0.08);
        }, 210);
    }, 1450);
};

export const stopIncomingRingtone = () => {
    if (ringtoneTimer !== null) {
        window.clearInterval(ringtoneTimer);
        ringtoneTimer = null;
    }
    if (ringtoneDelayTimer !== null) {
        window.clearTimeout(ringtoneDelayTimer);
        ringtoneDelayTimer = null;
    }
};

export const playJoinTone = () => {
    if (telehealthInCall) return;
    playTone(740, 0.12, 0.07);
    window.setTimeout(() => playTone(980, 0.14, 0.07), 150);
};

export const playEndTone = () => {
    if (telehealthInCall) return;
    playTone(440, 0.14, 0.07);
    window.setTimeout(() => playTone(330, 0.18, 0.06), 160);
};

export const setTelehealthInCall = (active: boolean) => {
    telehealthInCall = active;
    if (active) {
        stopIncomingRingtone();
    }
};

export const requestTelehealthNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
};

const showServiceWorkerNotification = async (title: string, body: string, url?: string) => {
    if (!('serviceWorker' in navigator)) return false;

    try {
        const registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1500)),
        ]);

        if (!registration) return false;

        await registration.showNotification(title, {
            body,
            tag: 'hms-telehealth-call',
            requireInteraction: true,
            data: { url },
        });
        return true;
    } catch {
        return false;
    }
};

export const showTelehealthBrowserNotification = async (title: string, body: string, url?: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const canConstructNotification = typeof Notification === 'function';
    if (!canConstructNotification) {
        await showServiceWorkerNotification(title, body, url);
        return;
    }

    try {
        const notification = new Notification(title, {
            body,
            tag: 'hms-telehealth-call',
            requireInteraction: true,
        });
        notification.onclick = () => {
            window.focus();
            if (url) window.location.href = url;
            notification.close();
        };
    } catch (error) {
        const isIllegalConstructor =
            error instanceof TypeError && error.message.toLowerCase().includes('illegal constructor');

        if (isIllegalConstructor) {
            await showServiceWorkerNotification(title, body, url);
            return;
        }

        console.warn('Browser notification could not be shown:', error);
    }
};

declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}
