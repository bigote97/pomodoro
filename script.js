class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutos en segundos
        this.timerId = null;
        this.currentMode = 'focus';
        this.isRunning = false;
        
        // Elementos DOM
        this.minutesDisplay = document.querySelector('.minutes');
        this.secondsDisplay = document.querySelector('.seconds');
        this.startButton = document.querySelector('.start-button');
        this.resetButton = document.querySelector('.reset-button');
        this.modeButtons = document.querySelectorAll('.mode-button');
        this.alarmSound = document.getElementById('alarmSound');

        // Tiempos predeterminados
        this.times = {
            focus: 25,
            shortBreak: 5,
            longBreak: 15
        };

        // Agregar traducciones
        this.translations = {
            es: {
                focus: "Enfoque",
                shortBreak: "Descanso Corto",
                longBreak: "Descanso Largo",
                timeComplete: "¡Tiempo completado!",
                sessionComplete: "Tu sesión de {mode} ha terminado",
                lightMode: "Modo claro",
                darkMode: "Modo oscuro",
                continueButton: "Continuar"
            },
            en: {
                focus: "Focus",
                shortBreak: "Short Break",
                longBreak: "Long Break",
                timeComplete: "Time Complete!",
                sessionComplete: "Your {mode} session has ended",
                lightMode: "Light mode",
                darkMode: "Dark mode",
                continueButton: "Continue"
            },
            pt: {
                focus: "Foco",
                shortBreak: "Pausa Curta",
                longBreak: "Pausa Longa",
                timeComplete: "Tempo Completo!",
                sessionComplete: "Sua sessão de {mode} terminou",
                lightMode: "Modo claro",
                darkMode: "Modo escuro",
                continueButton: "Continuar"
            }
        };

        this.currentLanguage = 'es';
        this.focusSessionsCount = 0;
        this.sessionsUntilLongBreak = 4;
        this.sessionsPerCycle = 4;
        this.initializeEventListeners();
        this.requestNotificationPermission();
        this.initializeLanguageSelector();
        this.initializeThemeSwitch();
        this.initializeProgressBar();
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        
        this.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;
                this.changeMode(mode);
            });
        });

        // Escuchar cambios en los inputs de configuración
        document.getElementById('focusTime').addEventListener('change', (e) => {
            this.times.focus = parseInt(e.target.value);
            if (this.currentMode === 'focus') this.resetTimer();
        });

        document.getElementById('shortBreakTime').addEventListener('change', (e) => {
            this.times.shortBreak = parseInt(e.target.value);
            if (this.currentMode === 'shortBreak') this.resetTimer();
        });

        document.getElementById('longBreakTime').addEventListener('change', (e) => {
            this.times.longBreak = parseInt(e.target.value);
            if (this.currentMode === 'longBreak') this.resetTimer();
        });
    }

    initializeLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.updateLanguage();
        });
    }

    updateLanguage() {
        // Actualizar textos de los botones de modo
        this.modeButtons.forEach(button => {
            const mode = button.dataset.mode;
            button.textContent = this.translations[this.currentLanguage][mode];
        });

        // Actualizar etiquetas de configuración
        const labels = document.querySelectorAll('.setting label');
        labels[0].textContent = this.translations[this.currentLanguage].focus;
        labels[1].textContent = this.translations[this.currentLanguage].shortBreak;
        labels[2].textContent = this.translations[this.currentLanguage].longBreak;

        // Actualizar los tooltips de los indicadores
        this.updateProgressIndicators();
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Este navegador no soporta notificaciones');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Permiso de notificaciones concedido');
            } else {
                console.log('Permiso de notificaciones denegado');
            }
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
        }
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
            this.startButton.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.startTimer();
            this.startButton.innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.isRunning = !this.isRunning;
    }

    startTimer() {
        if (!this.timerId) {
            this.timerId = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft === 0) {
                    this.timerComplete();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.times[this.currentMode] * 60;
        this.updateDisplay();
        this.isRunning = false;
        this.startButton.innerHTML = '<i class="fas fa-play"></i>';
        this.updateProgressIndicators();
    }

    changeMode(mode) {
        if (mode === 'focus' && this.currentMode !== 'shortBreak' && this.currentMode !== 'longBreak') {
            this.focusSessionsCount = 0;
        }

        this.currentMode = mode;
        this.modeButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.mode === mode) {
                button.classList.add('active');
            }
        });

        // Actualizar color de fondo considerando el tema actual
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        const modeColors = {
            focus: isDarkTheme ? 'var(--color-focus)' : 'var(--color-focus)',
            shortBreak: isDarkTheme ? 'var(--color-short-break)' : 'var(--color-short-break)',
            longBreak: isDarkTheme ? 'var(--color-long-break)' : 'var(--color-long-break)'
        };

        document.body.style.backgroundColor = modeColors[mode];
        
        this.resetTimer();
        this.updateProgressIndicators();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    timerComplete() {
        this.pauseTimer();
        this.alarmSound.play();
        this.showNotification();
        this.isRunning = false;
        this.startButton.innerHTML = '<i class="fas fa-play"></i>';

        // Actualizar contadores pero no cambiar modo automáticamente
        if (this.currentMode === 'focus') {
            this.focusSessionsCount++;
        }
        this.updateProgressIndicators();
    }

    showNotification() {
        if (!('Notification' in window)) {
            console.log('Notificaciones no soportadas');
            return;
        }

        if (Notification.permission === 'granted') {
            const title = this.translations[this.currentLanguage].timeComplete;
            const body = this.translations[this.currentLanguage].sessionComplete
                .replace('{mode}', this.translations[this.currentLanguage][this.currentMode]);
            
            try {
                const notification = new Notification(title, {
                    body: body,
                    icon: '/favicon.ico',
                    requireInteraction: true,
                    silent: false
                });

                notification.onclick = () => {
                    notification.close();
                    window.focus();
                    this.handleNotificationAction();
                };

                // Escuchar mensajes del Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data.type === 'notificationClick') {
                        this.handleNotificationAction();
                    }
                });
            } catch (error) {
                console.error('Error al mostrar notificación:', error);
            }
        } else if (Notification.permission !== 'denied') {
            // Si el permiso no está denegado ni concedido, solicitarlo
            this.requestNotificationPermission().then(() => this.showNotification());
        }
    }

    handleNotificationAction() {
        this.alarmSound.pause();
        this.alarmSound.currentTime = 0;
        
        // Iniciar automáticamente el siguiente timer
        if (this.currentMode === 'focus') {
            if (this.focusSessionsCount >= this.sessionsUntilLongBreak) {
                this.focusSessionsCount = 0;
                this.changeMode('longBreak');
            } else {
                this.changeMode('shortBreak');
            }
        } else {
            this.changeMode('focus');
        }
        this.startTimer();
        this.isRunning = true;
        this.startButton.innerHTML = '<i class="fas fa-pause"></i>';
    }

    initializeThemeSwitch() {
        const themeSwitch = document.getElementById('themeSwitch');
        
        // Establecer tema inicial
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeSwitch.checked = savedTheme === 'dark';

        // Manejar cambios de tema
        themeSwitch.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Actualizar colores del modo actual
            this.changeMode(this.currentMode);
        });
    }

    initializeProgressBar() {
        const progressContainer = document.querySelector('.progress-indicators');
        const sessionsInput = document.getElementById('sessionsPerCycle');
        
        // Actualizar cuando cambie el número de sesiones
        sessionsInput.addEventListener('change', (e) => {
            const newValue = parseInt(e.target.value);
            if (newValue >= 1 && newValue <= 10) {
                this.sessionsPerCycle = newValue;
                this.sessionsUntilLongBreak = newValue;
                this.updateProgressIndicators();
                document.getElementById('totalSessions').textContent = newValue;
            }
        });

        this.updateProgressIndicators();
    }

    updateProgressIndicators() {
        const progressContainer = document.querySelector('.progress-indicators');
        progressContainer.innerHTML = '';

        // Crear indicadores para cada sesión
        for (let i = 0; i < this.sessionsPerCycle; i++) {
            // Indicador de sesión de enfoque (línea)
            const indicator = document.createElement('div');
            indicator.classList.add('indicator', 'line');
            indicator.setAttribute('data-session-type', this.translations[this.currentLanguage].focus);
            if (i === this.focusSessionsCount) {
                indicator.classList.add('active');
            }
            if (i < this.focusSessionsCount) {
                indicator.classList.add('completed');
            }
            progressContainer.appendChild(indicator);

            // Añadir indicador de descanso si no es el último
            if (i < this.sessionsPerCycle - 1) {
                const breakIndicator = document.createElement('div');
                breakIndicator.classList.add('indicator', 'circle');
                breakIndicator.setAttribute('data-session-type', this.translations[this.currentLanguage].shortBreak);
                breakIndicator.style.margin = '0 0.2rem';
                progressContainer.appendChild(breakIndicator);
            }
        }

        // Añadir indicador de descanso largo
        const longBreakIndicator = document.createElement('div');
        longBreakIndicator.classList.add('indicator', 'rectangle');
        longBreakIndicator.setAttribute('data-session-type', this.translations[this.currentLanguage].longBreak);
        longBreakIndicator.style.marginLeft = '0.2rem';
        progressContainer.appendChild(longBreakIndicator);
    }

    getSessionProgress() {
        return {
            current: this.focusSessionsCount,
            total: this.sessionsUntilLongBreak
        };
    }
}

// Inicializar el temporizador cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const pomodoro = new PomodoroTimer();
});
