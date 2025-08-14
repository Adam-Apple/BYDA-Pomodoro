class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.interval = null;
        this.sessionCount = 1;
        this.totalFocusTime = 0;
        this.currentMode = 'pomodoro';
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeElement = document.getElementById('time');
        this.statusElement = document.getElementById('status');
        this.startButton = document.getElementById('start');
        this.pauseButton = document.getElementById('pause');
        this.resetButton = document.getElementById('reset');
        this.progressFill = document.getElementById('progress-fill');
        this.sessionNumber = document.getElementById('session-number');
        this.totalFocusTimeElement = document.getElementById('total-focus-time');
        this.modeButtons = document.querySelectorAll('.mode-btn');
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
        
        this.modeButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchMode(e));
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startButton.disabled = true;
            this.pauseButton.disabled = false;
            this.statusElement.textContent = 'Focusing...';
            
            this.interval = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.complete();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startButton.disabled = false;
            this.pauseButton.disabled = true;
            this.statusElement.textContent = 'Paused';
            
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    reset() {
        this.pause();
        this.timeLeft = this.totalTime;
        this.statusElement.textContent = 'Ready to start';
        this.updateDisplay();
    }
    
    complete() {
        this.pause();
        
        // Play notification sound if available
        this.playNotification();
        
        // Update session count and focus time for pomodoro sessions
        if (this.currentMode === 'pomodoro') {
            this.sessionCount++;
            this.totalFocusTime += 25;
            this.updateSessionInfo();
        }
        
        // Show completion message
        this.statusElement.textContent = this.getCompletionMessage();
        this.timeElement.classList.add('timer-complete');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.timeElement.classList.remove('timer-complete');
        }, 500);
        
        // Auto-switch to next mode after completion
        this.autoSwitchMode();
    }
    
    playNotification() {
        // Try to play a notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }
    
    getCompletionMessage() {
        const messages = {
            'pomodoro': 'Great work! Time for a break.',
            'short': 'Break time is over. Back to work!',
            'long': 'Long break complete. Ready to focus!'
        };
        return messages[this.currentMode] || 'Session complete!';
    }
    
    autoSwitchMode() {
        // Auto-switch logic: pomodoro -> short break -> pomodoro -> long break
        if (this.currentMode === 'pomodoro') {
            if (this.sessionCount % 4 === 0) {
                this.switchToMode('long');
            } else {
                this.switchToMode('short');
            }
        } else {
            this.switchToMode('pomodoro');
        }
    }
    
    switchMode(event) {
        const button = event.target;
        const time = parseInt(button.dataset.time);
        
        // Update active button
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Determine mode
        let mode = 'pomodoro';
        if (time === 5) mode = 'short';
        else if (time === 15) mode = 'long';
        
        this.switchToMode(mode, time);
    }
    
    switchToMode(mode, time = null) {
        this.currentMode = mode;
        
        // Set time based on mode
        if (time) {
            this.totalTime = time * 60;
        } else {
            switch (mode) {
                case 'pomodoro':
                    this.totalTime = 25 * 60;
                    break;
                case 'short':
                    this.totalTime = 5 * 60;
                    break;
                case 'long':
                    this.totalTime = 15 * 60;
                    break;
            }
        }
        
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.statusElement.textContent = `Ready for ${mode === 'pomodoro' ? 'focus' : mode + ' break'}`;
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.timeElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress bar
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update browser tab title
        this.updateTabTitle();
    }
    
    updateTabTitle() {
        if (this.isRunning) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Show mode and time in title
            let modeText = '';
            switch (this.currentMode) {
                case 'pomodoro':
                    modeText = '🍅 Focus';
                    break;
                case 'short':
                    modeText = '☕ Short Break';
                    break;
                case 'long':
                    modeText = '🌴 Long Break';
                    break;
            }
            
            document.title = `${timeString} - ${modeText} | Pomodoro Timer`;
        } else {
            // Reset to default title when not running
            document.title = 'Pomodoro Timer';
        }
    }
    
    updateSessionInfo() {
        this.sessionNumber.textContent = this.sessionCount;
        this.totalFocusTimeElement.textContent = this.totalFocusTime;
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        const startButton = document.getElementById('start');
        const pauseButton = document.getElementById('pause');
        
        if (!startButton.disabled) {
            startButton.click();
        } else if (!pauseButton.disabled) {
            pauseButton.click();
        }
    } else if (e.code === 'KeyR') {
        document.getElementById('reset').click();
    }
});
