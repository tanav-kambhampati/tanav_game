import GameControl from './GameEngine/GameControl.js';
import Quiz from './Quiz.js';
import Inventory from "./Inventory.js";
import { defaultItems } from "./items.js";

class StatsManager {
    constructor(game) {
        this.game = game;
        this.stats = {
            balance: parseInt(localStorage.getItem('balance')) || 100000,
            questionAccuracy: localStorage.getItem('questionAccuracy') || '0%',
            questionsAnswered: parseInt(localStorage.getItem('questionsAnswered')) || 0,
            questionsCorrect: parseInt(localStorage.getItem('questionsCorrect')) || 0
        };
        this.npcCookies = JSON.parse(localStorage.getItem('npcCookies')) || {};
        this.initStatsUI();
    }

    async getNpcProgress(personId) {
        return JSON.parse(localStorage.getItem('npcProgress')) || {};
    }

    async fetchStats(personId) {
        const balance = this.stats.balance;
        const accuracy = this.stats.questionAccuracy;
        
        const balanceEl = document.getElementById('balance');
        const accuracyEl = document.getElementById('questionAccuracy');
        
        if (balanceEl) balanceEl.innerHTML = balance;
        if (accuracyEl) accuracyEl.innerHTML = accuracy;
    }

    async createStats(stats, gname, uid) {
        localStorage.setItem('gameStats', JSON.stringify(stats));
        return stats;
    }

    async getStats(uid) {
        return JSON.parse(localStorage.getItem('gameStats')) || this.stats;
    }

    async updateStats(stats, gname, uid) {
        const currentStats = JSON.parse(localStorage.getItem('gameStats')) || {};
        const updatedStats = { ...currentStats, ...stats };
        localStorage.setItem('gameStats', JSON.stringify(updatedStats));
        return updatedStats;
    }

    async updateStatsMCQ(questionId, choiceId, personId) {
        this.stats.questionsAnswered++;
        localStorage.setItem('questionsAnswered', this.stats.questionsAnswered);
        return { ok: true };
    }

    async transitionToRocket(personId) {
        return true;
    }

    updateBalance(amount) {
        this.stats.balance += amount;
        localStorage.setItem('balance', this.stats.balance);
        const balanceEl = document.getElementById('balance');
        if (balanceEl) balanceEl.innerHTML = this.stats.balance;
        return this.stats.balance;
    }

    recordAnswer(isCorrect) {
        this.stats.questionsAnswered++;
        if (isCorrect) this.stats.questionsCorrect++;
        const accuracy = this.stats.questionsAnswered > 0 
            ? Math.round((this.stats.questionsCorrect / this.stats.questionsAnswered) * 100) 
            : 0;
        this.stats.questionAccuracy = `${accuracy}%`;
        localStorage.setItem('questionsAnswered', this.stats.questionsAnswered);
        localStorage.setItem('questionsCorrect', this.stats.questionsCorrect);
        localStorage.setItem('questionAccuracy', this.stats.questionAccuracy);
        
        const accuracyEl = document.getElementById('questionAccuracy');
        if (accuracyEl) accuracyEl.innerHTML = this.stats.questionAccuracy;
    }

    initStatsUI() {
        const statsWrapper = document.createElement('div');
        statsWrapper.id = 'stats-wrapper';
        Object.assign(statsWrapper.style, {
            position: 'fixed',
            top: '80px',
            right: '0',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
        });

        if (!document.getElementById('pixel-font-link')) {
            const fontLink = document.createElement('link');
            fontLink.id = 'pixel-font-link';
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
            document.head.appendChild(fontLink);
        }

        this.initAudioToggle();
        
        this.initAmbientSounds();

        const style = document.createElement('style');
        style.textContent = `
            #stats-button {
                background: #000;
                border: 2px solid #fff;
                padding: 8px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                animation: glowBorder 2s infinite alternate;
            }

            #stats-button::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: rgba(255, 255, 255, 0.5);
                animation: scanline 2s linear infinite;
            }

            #stats-container {
                background: #000;
                border: 3px solid #fff;
                padding: 15px;
                margin-left: 10px;
                min-width: 250px;
                display: none;
                font-family: 'Press Start 2P', cursive;
                color: #fff;
                position: relative;
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                animation: glowBorder 2s infinite alternate;
                opacity: 0;
                transform: translateX(-20px);
                transition: opacity 0.3s, transform 0.3s;
            }

            #stats-wrapper:hover #stats-container,
            #stats-container:focus-within {
                display: block;
                opacity: 1;
                transform: translateX(0);
            }

            #stats-wrapper.pinned #stats-container {
                display: block !important;
                opacity: 1 !important;
                transform: none !important;
            }

            #stats-button {
                background: #000;
                border: 2px solid #fff;
                padding: 8px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                animation: glowBorder 2s infinite alternate;
                z-index: 10001;
            }

            #stats-wrapper.pinned #stats-button {
                display: none;
            }

            #stats-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    transparent 50%,
                    rgba(0, 0, 0, 0.5) 50%
                );
                background-size: 100% 4px;
                pointer-events: none;
                z-index: 1;
            }

            .pixel-title {
                font-size: 14px;
                margin-bottom: 15px;
                text-align: center;
                color: #ffeb3b;
                text-shadow: 2px 2px #000;
                position: relative;
            }

            .pixel-stat-box {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid #ffb300;
                margin: 8px 0;
                padding: 8px;
                display: flex;
                align-items: center;
                font-size: 11px;
                position: relative;
                overflow: hidden;
                transition: all 0.3s;
            }

            .pixel-stat-box:hover {
                transform: translateX(5px);
                background: rgba(255, 255, 255, 0.15);
                border-color: #ffd700;
            }

            .pixel-stat-box::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.2),
                    transparent
                );
                animation: shine 2s infinite;
            }

            #npcs-progress-bar-container {
                position: relative;
                height: 20px;
                background: #000;
                border: 2px solid #ffb300;
                margin-top: 12px;
                overflow: hidden;
            }

            #npcs-progress-bar {
                height: 100%;
                background: repeating-linear-gradient(
                    45deg,
                    #ffd700,
                    #ffd700 10px,
                    #ffb300 10px,
                    #ffb300 20px
                );
                transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                animation: progressPulse 2s infinite;
            }

            #npcs-progress-label {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #fff;
                text-shadow: 1px 1px #000;
                z-index: 2;
            }

            .assets-button {
                background: linear-gradient(45deg, #4CAF50, #45a049);
                border: 2px solid #4CAF50;
                color: #fff;
                padding: 8px 12px;
                cursor: pointer;
                font-family: 'Press Start 2P', cursive;
                font-size: 10px;
                border-radius: 4px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
                margin-top: 10px;
                width: 100%;
                text-align: center;
            }

            .assets-button:hover {
                transform: translateY(-2px);
                background: linear-gradient(45deg, #45a049, #4CAF50);
                box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
            }

            .assets-button::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent,
                    rgba(255, 255, 255, 0.1),
                    transparent
                );
                transform: rotate(45deg);
                animation: shine 3s infinite;
            }

            /* Asset Dashboard Styles */
            #asset-dashboard-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 10500;
                display: none;
                justify-content: center;
                align-items: center;
                animation: blurIn 0.5s ease-out;
            }

            #asset-dashboard {
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
                border: 4px solid #4CAF50;
                border-radius: 15px;
                padding: 30px;
                max-width: 900px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                font-family: 'Press Start 2P', cursive;
                color: #fff;
                position: relative;
                box-shadow: 
                    0 0 30px rgba(76, 175, 80, 0.3),
                    inset 0 1px 0 rgba(255,255,255,0.1);
                animation: dashboardSlideIn 0.5s ease-out;
            }

            .dashboard-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #4CAF50;
                padding-bottom: 20px;
            }

            .dashboard-title {
                font-size: 18px;
                color: #4CAF50;
                margin-bottom: 10px;
                text-shadow: 2px 2px #000;
            }

            .dashboard-subtitle {
                font-size: 10px;
                color: #888;
                margin-bottom: 15px;
            }

            .dashboard-section {
                margin-bottom: 25px;
                background: rgba(76, 175, 80, 0.1);
                border: 2px solid #4CAF50;
                border-radius: 10px;
                padding: 20px;
                position: relative;
            }

            .section-title {
                font-size: 14px;
                color: #4CAF50;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .asset-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }

            .asset-item {
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid #333;
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .asset-item:hover {
                border-color: #4CAF50;
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2);
            }

            .asset-name {
                font-size: 11px;
                color: #4CAF50;
                margin-bottom: 8px;
            }

            .asset-value {
                font-size: 13px;
                color: #fff;
                margin-bottom: 5px;
            }

            .asset-change {
                font-size: 9px;
                margin-bottom: 5px;
            }

            .asset-change.positive {
                color: #4CAF50;
            }

            .asset-change.negative {
                color: #f44336;
            }

            .asset-quantity {
                font-size: 9px;
                color: #888;
            }

            .close-dashboard {
                position: absolute;
                top: 15px;
                right: 20px;
                background: #f44336;
                color: #fff;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                font-family: 'Press Start 2P', cursive;
            }

            .close-dashboard:hover {
                transform: scale(1.1);
                background: #d32f2f;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #333;
                border-top: 4px solid #4CAF50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 20px auto;
            }

            @keyframes blurIn {
                0% { 
                    opacity: 0; 
                    backdrop-filter: blur(0px);
                    -webkit-backdrop-filter: blur(0px);
                }
                100% { 
                    opacity: 1; 
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
            }

            @keyframes dashboardSlideIn {
                0% { 
                    transform: scale(0.9) translateY(50px);
                    opacity: 0;
                }
                100% { 
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes glowBorder {
                0% { box-shadow: 0 0 5px #fff, inset 0 0 5px #fff; }
                100% { box-shadow: 0 0 15px #fff, inset 0 0 8px #fff; }
            }

            @keyframes scanline {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }

            @keyframes shine {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            @keyframes progressPulse {
                0% { opacity: 0.8; }
                50% { opacity: 1; }
                100% { opacity: 0.8; }
            }

            .pixel-icon {
                width: 18px !important;
                height: 18px !important;
                margin-right: 8px;
                animation: iconFloat 2s infinite alternate;
            }

            @keyframes iconFloat {
                0% { transform: translateY(0); }
                100% { transform: translateY(-3px); }
            }
        `;
        document.head.appendChild(style);

        const npcCookies = this.getAllNpcCookies();
        const npcCookiesCount = Object.keys(npcCookies).length;
        const dynamicTotal = Math.max(npcCookiesCount, 1); 

        const availableNpcs = [
            'Propulsion-NPC', 'Orbital-NPC', 'History-NPC', 'SpaceX-NPC', 'Elon-Musk'
        ];
        const totalAvailable = availableNpcs.length;
        const progressPercentage = totalAvailable > 0 ? (npcCookiesCount / totalAvailable) * 100 : 0;

        const coinIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1fa99.png';
        const accuracyIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f3af.png';
        const npcIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f9d1-200d-1f3a4.png';
        const statsIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f3ae.png';

        const statsButton = document.createElement('div');
        statsButton.id = 'stats-button';
        statsButton.innerHTML = `<img src="${statsIcon}" alt="Stats" title="Show Player Stats" style="width:38px;height:38px;image-rendering:pixelated;" />`;

        const statsContainer = document.createElement('div');
        statsContainer.id = 'stats-container';
        statsContainer.tabIndex = 0;

        const pinButton = document.createElement('button');
        pinButton.id = 'stats-pin-btn';
        pinButton.innerHTML = '📌';
        pinButton.title = 'Pin/unpin';
        Object.assign(pinButton.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '22px',
            cursor: 'pointer',
            zIndex: '10002',
            color: '#fff',
            textShadow: '2px 2px #000',
            transition: 'transform 0.2s, color 0.2s'
        });

        pinButton.addEventListener('mouseenter', () => {
            pinButton.style.transform = 'scale(1.2)';
            pinButton.style.color = '#ffd700';
        });
        pinButton.addEventListener('mouseleave', () => {
            pinButton.style.transform = '';
            pinButton.style.color = '#fff';
        });
        pinButton.addEventListener('click', (e) => {
            e.stopPropagation();
            setPinnedState(!pinned);
            const click = new Audio('data:audio/wav;base64,UklGRXEAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YUQAAAB/f39/gICAgICAgH9/f39/f39/f39/f4CAgICAgIB/f39/f39/f39/f3+AgICAgICAgICAgH9/f39/f39/f39/f39/f39/f39/fw==');
            click.volume = 0.3;
            click.play();
        });

        statsContainer.innerHTML = `
            <div class="pixel-title">
                <img class="pixel-icon" src="${statsIcon}" alt="Game" style="width:22px;height:22px;margin-right:8px;vertical-align:middle;" />
                <span>PLAYER STATS</span>
                <img class="pixel-icon" src="${statsIcon}" alt="Game" style="width:22px;height:22px;margin-left:8px;vertical-align:middle;" />
            </div>
            <div class="pixel-stat-box">
                <img class="pixel-icon" src="${coinIcon}" alt="Coin" style="width:22px;height:22px;vertical-align:middle;" />
                <span style="color: #ffb300;">Balance:</span> <span id="balance" style="margin-left: 6px;">0</span>
            </div>
            <div class="pixel-stat-box">
                <img class="pixel-icon" src="${accuracyIcon}" alt="Accuracy" style="width:22px;height:22px;vertical-align:middle;" />
                <span style="color: #ffb300;">Question Accuracy:</span> <span id="questionAccuracy" style="margin-left: 6px;">0%</span>
            </div>
            <div class="pixel-stat-box">
                <img class="pixel-icon" src="${npcIcon}" alt="NPC" style="width:22px;height:22px;vertical-align:middle;" />
                <span style="color: #ffb300;">NPC Cookies:</span> <span id="npcsTalkedTo" style="margin-left: 6px;">${npcCookiesCount}</span>
            </div>
            <div id="npcs-progress-bar-container">
                <div id="npcs-progress-bar" style="width: ${progressPercentage}%;"></div>
                <span id="npcs-progress-label">${npcCookiesCount} / ${totalAvailable}</span>
            </div>
            <button class="assets-button" id="open-assets-dashboard">
                🚀 VIEW ROCKET PARTS
            </button>
        `;

        statsContainer.appendChild(pinButton);
        statsWrapper.appendChild(statsButton);
        statsWrapper.appendChild(statsContainer);
        document.body.appendChild(statsWrapper);

        this.initAssetDashboard();

        document.getElementById('open-assets-dashboard').addEventListener('click', () => {
            this.openAssetDashboard();
        });

        const hoverSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        hoverSound.volume = 0.2;

        const statBoxes = statsContainer.querySelectorAll('.pixel-stat-box');
        statBoxes.forEach(box => {
            box.addEventListener('mouseenter', () => {
                hoverSound.currentTime = 0;
                hoverSound.play();
            });
        });

        let pinned = false;
        function setPinnedState(isPinned) {
            pinned = isPinned;
            if (pinned) {
                statsWrapper.classList.add('pinned');
                pinButton.classList.add('pinned');
                statsContainer.style.position = 'fixed';
                statsContainer.style.right = '0';
                statsContainer.style.left = '';
                statsContainer.style.display = 'block';
                statsContainer.style.opacity = '1';
                statsContainer.style.transform = 'none';
                statsContainer.style.pointerEvents = 'auto';
                statsContainer.style.padding = '18px 28px';
                statsContainer.style.overflow = 'visible';
                statsContainer.style.zIndex = '10002';
            } else {
                statsWrapper.classList.remove('pinned');
                pinButton.classList.remove('pinned');
                statsContainer.style.position = '';
                statsContainer.style.right = '';
                statsContainer.style.left = '';
                statsContainer.style.display = '';
                statsContainer.style.opacity = '';
                statsContainer.style.transform = '';
                statsContainer.style.pointerEvents = '';
                statsContainer.style.padding = '';
                statsContainer.style.overflow = '';
                statsContainer.style.zIndex = '';
            }
            pinButton.style.color = pinned ? '#ffb300' : '#fff';
            pinButton.style.transform = pinned ? 'rotate(-30deg)' : '';
        }

        statsWrapper.addEventListener('mouseleave', () => {
            if (!pinned) {
                statsContainer.style.display = 'none';
                statsContainer.style.opacity = '0';
                statsContainer.style.transform = 'translateX(-20px)';
            }
        });

        statsWrapper.addEventListener('mouseenter', () => {
            statsContainer.style.display = 'block';
            requestAnimationFrame(() => {
                statsContainer.style.opacity = '1';
                statsContainer.style.transform = 'translateX(0)';
            });
        });

        document.addEventListener('click', (e) => {
            if (pinned && !statsWrapper.contains(e.target)) {
                setPinnedState(false);
            }
        });
    }

    initAssetDashboard() {
        const modal = document.createElement('div');
        modal.id = 'asset-dashboard-modal';
        
        const dashboard = document.createElement('div');
        dashboard.id = 'asset-dashboard';
        
        dashboard.innerHTML = `
            <button class="close-dashboard" id="close-asset-dashboard">×</button>
            <div class="dashboard-header">
                <div class="dashboard-title">🚀 ROCKET INVENTORY</div>
                <div class="dashboard-subtitle">Collected parts and mission progress</div>
            </div>
            <div id="dashboard-content">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        modal.appendChild(dashboard);
        document.body.appendChild(modal);
        
        document.getElementById('close-asset-dashboard').addEventListener('click', () => {
            this.closeAssetDashboard();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeAssetDashboard();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.closeAssetDashboard();
            }
        });
    }

    async openAssetDashboard() {
        const modal = document.getElementById('asset-dashboard-modal');
        const content = document.getElementById('dashboard-content');
        
        modal.style.display = 'flex';
        content.innerHTML = '<div class="loading-spinner"></div>';
        
        try {
            const [balanceData, stocksData, cryptoHoldingsData, cryptoMiningData, bankData] = await Promise.all([
                this.fetchBalance(),
                this.fetchStocks(),
                this.fetchCryptoHoldings(), 
                this.fetchCryptoMining(),
                this.fetchBankAnalytics()
            ]);
            
            this.renderAssetDashboard(balanceData, stocksData, cryptoHoldingsData, cryptoMiningData, bankData);
            
        } catch (error) {
            console.error('Error loading asset dashboard:', error);
            content.innerHTML = `
                <div class="dashboard-section">
                    <div class="section-title">❌ Error Loading Assets</div>
                    <p style="color: #f44336; font-size: 10px;">
                        Failed to load asset data. Please try again later.
                    </p>
                </div>
            `;
        }
    }

    closeAssetDashboard() {
        const modal = document.getElementById('asset-dashboard-modal');
        modal.style.display = 'none';
    }

    async fetchBalance() {
        return parseInt(localStorage.getItem('balance')) || 100000;
    }

    async fetchStocks() {
        return JSON.parse(localStorage.getItem('stocks')) || [];
    }

    async fetchCryptoHoldings() {
        return JSON.parse(localStorage.getItem('cryptoHoldings')) || [];
    }

    async fetchCryptoMining() {
        return JSON.parse(localStorage.getItem('cryptoMining')) || {
            stats: null,
            state: null,
            status: null
        };
    }

    async fetchBankAnalytics() {
        return JSON.parse(localStorage.getItem('bankAnalytics')) || null;
    }

    async getUserEmail() {
        return localStorage.getItem('userEmail') || 'player@adventure.game';
    }

    async fetchPortfolio() {
        return JSON.parse(localStorage.getItem('portfolio')) || [];
    }

    async fetchCryptoData() {
        return JSON.parse(localStorage.getItem('cryptoData')) || [];
    }

    renderAssetDashboard(balance, stocks, cryptoHoldings, cryptoMining, bankData) {
        const content = document.getElementById('dashboard-content');
        
        const stockValue = Array.isArray(stocks) ? stocks.reduce((sum, stock) => {
            const price = parseFloat(stock.currentPrice || stock.price || 0);
            const quantity = parseFloat(stock.quantity || stock.shares || 0);
            return sum + (price * quantity);
        }, 0) : 0;
        
        const cryptoValue = Array.isArray(cryptoHoldings) ? cryptoHoldings.reduce((sum, coin) => {
            const price = parseFloat(coin.currentPrice || coin.price || 0);
            const quantity = parseFloat(coin.quantity || coin.amount || 0);
            return sum + (price * quantity);
        }, 0) : 0;
        
        const balanceValue = parseFloat(balance) || 0;
        const totalValue = balanceValue + stockValue + cryptoValue;
        
        content.innerHTML = `
            <!-- Portfolio Summary -->
            <div class="dashboard-section">
                <div class="section-title">📊 PORTFOLIO SUMMARY</div>
                <div class="asset-grid">
                    <div class="asset-item">
                        <div class="asset-name">Total Portfolio Value</div>
                        <div class="asset-value">$${totalValue.toLocaleString()}</div>
                    </div>
                    <div class="asset-item">
                        <div class="asset-name">Cash Balance</div>
                        <div class="asset-value">$${balanceValue.toLocaleString()}</div>
                        <div class="asset-quantity">${totalValue > 0 ? ((balanceValue/totalValue)*100).toFixed(1) : 0}% of portfolio</div>
                    </div>
                    <div class="asset-item">
                        <div class="asset-name">Stock Holdings</div>
                        <div class="asset-value">$${stockValue.toLocaleString()}</div>
                        <div class="asset-quantity">${totalValue > 0 ? ((stockValue/totalValue)*100).toFixed(1) : 0}% of portfolio</div>
                    </div>
                    <div class="asset-item">
                        <div class="asset-name">Crypto Holdings</div>
                        <div class="asset-value">$${cryptoValue.toLocaleString()}</div>
                        <div class="asset-quantity">${totalValue > 0 ? ((cryptoValue/totalValue)*100).toFixed(1) : 0}% of portfolio</div>
                    </div>
                </div>
            </div>

            <!-- Stock Holdings -->
            <div class="dashboard-section">
                <div class="section-title">📈 STOCK PORTFOLIO</div>
                <div class="asset-grid">
                    ${Array.isArray(stocks) && stocks.length > 0 ? stocks.map(stock => {
                        const price = parseFloat(stock.currentPrice || stock.price || 0);
                        const quantity = parseFloat(stock.quantity || stock.shares || 0);
                        const change = parseFloat(stock.change || stock.dayChange || 0);
                        const symbol = stock.symbol || stock.ticker || 'N/A';
                        return `
                            <div class="asset-item">
                                <div class="asset-name">${symbol}</div>
                                <div class="asset-value">$${price.toFixed(2)}</div>
                                <div class="asset-change ${change >= 0 ? 'positive' : 'negative'}">
                                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                                </div>
                                <div class="asset-quantity">
                                    ${quantity} shares • $${(quantity * price).toLocaleString()}
                                </div>
                            </div>
                        `;
                    }).join('') : '<div class="asset-item"><div class="asset-name">No stocks owned</div></div>'}
                </div>
            </div>

            <!-- Crypto Holdings -->
            <div class="dashboard-section">
                <div class="section-title">🪙 CRYPTOCURRENCY HOLDINGS</div>
                <div class="asset-grid">
                    ${Array.isArray(cryptoHoldings) && cryptoHoldings.length > 0 ? cryptoHoldings.map(coin => {
                        const price = parseFloat(coin.currentPrice || coin.price || 0);
                        const quantity = parseFloat(coin.quantity || coin.amount || 0);
                        const change = parseFloat(coin.change || coin.dayChange || 0);
                        const symbol = coin.symbol || coin.ticker || 'N/A';
                        return `
                            <div class="asset-item">
                                <div class="asset-name">${symbol}</div>
                                <div class="asset-value">$${price.toFixed(2)}</div>
                                <div class="asset-change ${change >= 0 ? 'positive' : 'negative'}">
                                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                                </div>
                                <div class="asset-quantity">
                                    ${quantity} ${symbol} • $${(quantity * price).toLocaleString()}
                                </div>
                            </div>
                        `;
                    }).join('') : '<div class="asset-item"><div class="asset-name">No crypto owned</div></div>'}
                </div>
            </div>

            <!-- Crypto Mining -->
            <div class="dashboard-section">
                <div class="section-title">⛏️ CRYPTO MINING STATUS</div>
                <div class="asset-grid">
                    ${cryptoMining ? `
                        ${cryptoMining.stats ? `
                            <div class="asset-item">
                                <div class="asset-name">Mining Stats</div>
                                <div class="asset-value">${JSON.stringify(cryptoMining.stats).substring(0, 50)}...</div>
                            </div>
                        ` : ''}
                        ${cryptoMining.state ? `
                            <div class="asset-item">
                                <div class="asset-name">Mining State</div>
                                <div class="asset-value">${cryptoMining.state.status || 'Unknown'}</div>
                            </div>
                        ` : ''}
                        ${cryptoMining.status ? `
                            <div class="asset-item">
                                <div class="asset-name">Current Status</div>
                                <div class="asset-value">${cryptoMining.status.active ? 'Active' : 'Inactive'}</div>
                            </div>
                        ` : ''}
                    ` : '<div class="asset-item"><div class="asset-name">Mining data unavailable</div></div>'}
                </div>
            </div>

            <!-- Bank Analytics -->
            <div class="dashboard-section">
                <div class="section-title">🏦 BANK ANALYTICS</div>
                <div class="asset-grid">
                    ${bankData ? `
                        <div class="asset-item">
                            <div class="asset-name">Account Summary</div>
                            <div class="asset-value">${bankData.accountType || 'N/A'}</div>
                            <div class="asset-quantity">Balance: $${parseFloat(bankData.balance || 0).toLocaleString()}</div>
                        </div>
                        ${bankData.transactions ? `
                            <div class="asset-item">
                                <div class="asset-name">Recent Transactions</div>
                                <div class="asset-value">${bankData.transactions.length || 0} transactions</div>
                            </div>
                        ` : ''}
                    ` : '<div class="asset-item"><div class="asset-name">Bank data unavailable</div></div>'}
                </div>
            </div>
        `;
    }

    updateNpcsTalkedToUI(count) {
        const npcsSpan = document.getElementById('npcsTalkedTo');
        if (npcsSpan) {
            const waypointNpcs = [
                'Propulsion-NPC', 'Orbital-NPC', 'History-NPC', 
                'SpaceX-NPC', 'Elon-Musk'
            ];
            const npcCookies = this.getAllNpcCookies();
            const npcCookiesCount = waypointNpcs.filter(npcId => npcCookies[npcId]).length;
            npcsSpan.textContent = npcCookiesCount;
        }
        const bar = document.getElementById('npcs-progress-bar');
        const label = document.getElementById('npcs-progress-label');
        if (bar && label) {
            const waypointNpcs = [
                'Propulsion-NPC', 'Orbital-NPC', 'History-NPC', 
                'SpaceX-NPC', 'Elon-Musk'
            ];
            const npcCookies = this.getAllNpcCookies();
            const npcCookiesCount = waypointNpcs.filter(npcId => npcCookies[npcId]).length;
            const totalAvailable = waypointNpcs.length;
            
            const percentage = totalAvailable > 0 ? (npcCookiesCount / totalAvailable) * 100 : 0;
            bar.style.width = `${Math.min(percentage, 100)}%`;
            label.textContent = `${npcCookiesCount} / ${totalAvailable}`;
        }
    }

    incrementNpcsTalkedTo() {
        let npcsTalkedTo = 0;
        const cookies = document.cookie.split(';');
        const npcsCookie = cookies.find(cookie => cookie.trim().startsWith('npcsTalkedTo='));
        if (npcsCookie) {
            npcsTalkedTo = parseInt(npcsCookie.split('=')[1]) || 0;
        }
        npcsTalkedTo += 1;
        document.cookie = `npcsTalkedTo=${npcsTalkedTo}; path=/; max-age=${60*60*24*30}`;
        this.updateNpcsTalkedToUI(npcsTalkedTo);
    }

    /**
     * @param {string} npcId 
     * @param {string} reward 
     * @param {string} objective 
     */
    giveNpcCookie(npcId, reward = "completed", objective = null) {
        const cookieName = `npc_${npcId}`;
        const cookieValue = "completed"; 
        const expiryDays = 30;
        
        const existingCookie = this.getNpcCookie(npcId);
        const isFirstTime = !existingCookie;
        
        document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=${60*60*24*expiryDays}`;
        
        if (isFirstTime) {
            this.incrementNpcsTalkedTo();
        }
        
        this.showNpcCookieNotification(npcId, reward, objective);
        
        this.updateNpcsTalkedToUI(0);
        
        if (window.waypointArrow && isFirstTime) {
            window.waypointArrow.onCookieEarned(npcId);
        }
        
        if (isFirstTime) {
            setTimeout(() => {
            }, 500); 
        }
        
        console.log(`NPC Cookie awarded: ${cookieName}=${cookieValue} (displayed as: ${reward})`);
    }

    /**
     * @param {string} npcId 
     * @returns {string|null} 
     */
    getNpcCookie(npcId) {
        const cookies = document.cookie.split(';');
        const cookieName = `npc_${npcId}`;
        const npcCookie = cookies.find(cookie => cookie.trim().startsWith(`${cookieName}=`));
        if (npcCookie) {
            return npcCookie.split('=')[1];
        }
        return null;
    }

    /**
     * @returns {Object}
     */
    getAllNpcCookies() {
        const cookies = document.cookie.split(';');
        const npcCookies = {};
        
        cookies.forEach(cookie => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith('npc_')) {
                const [name, value] = trimmedCookie.split('=');
                const npcId = name.replace('npc_', '');
                npcCookies[npcId] = value;
            }
        });
        
        return npcCookies;
    }

    /**
     * @param {string} npcId 
     * @param {string} reward 
     * @param {string} objective 
     */
    showNpcCookieNotification(npcId, reward, objective) {
        this.createCookieParticles();
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100%);
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            border: 3px solid #ffd700;
            box-shadow: 
                0 8px 32px rgba(0,0,0,0.4),
                0 0 20px rgba(255, 215, 0, 0.3),
                inset 0 1px 0 rgba(255,255,255,0.1);
            z-index: 10000;
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            max-width: 450px;
            min-width: 350px;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            backdrop-filter: blur(10px);
            animation: pulseGlow 2s infinite alternate;
        `;
        
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes pulseGlow {
                    0% { 
                        box-shadow: 
                            0 8px 32px rgba(0,0,0,0.4),
                            0 0 20px rgba(255, 215, 0, 0.3),
                            inset 0 1px 0 rgba(255,255,255,0.1);
                    }
                    100% { 
                        box-shadow: 
                            0 8px 32px rgba(0,0,0,0.4),
                            0 0 30px rgba(255, 215, 0, 0.6),
                            inset 0 1px 0 rgba(255,255,255,0.2);
                    }
                }
                @keyframes slideUpFadeIn {
                    0% { 
                        transform: translateX(-50%) translateY(100%);
                        opacity: 0;
                    }
                    100% { 
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes slideDownFadeOut {
                    0% { 
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                    100% { 
                        transform: translateX(-50%) translateY(100%);
                        opacity: 0;
                    }
                }
                .notification-icon {
                    animation: bounce 1s infinite alternate;
                }
                @keyframes bounce {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-5px); }
                }
                .objective-text {
                    animation: typewriter 0.8s steps(40) 0.5s both;
                    border-right: 2px solid #4CAF50;
                    animation: typewriter 0.8s steps(40) 0.5s both, blink 1s infinite 1.3s;
                }
                @keyframes typewriter {
                    0% { width: 0; }
                    100% { width: 100%; }
                }
                @keyframes blink {
                    0%, 50% { border-color: #4CAF50; }
                    51%, 100% { border-color: transparent; }
                }
            `;
            document.head.appendChild(style);
        }
        
        const cookieEmoji = reward.includes('propulsion') ? '🔥' : 
                           reward.includes('orbital') ? '🌍' : 
                           reward.includes('history') ? '📚' :
                           reward.includes('spacex') ? '🛸' :
                           reward.includes('rocket') || reward.includes('master') ? '🏆' : '🚀';
        const npcDisplayName = npcId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        notification.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <!-- Header with cookie earned -->
                <div style="display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #333; padding-bottom: 15px;">
                    <span class="notification-icon" style="font-size: 28px;">${cookieEmoji}</span>
                    <div style="flex: 1;">
                        <div style="color: #ffd700; font-size: 14px; margin-bottom: 5px;">
                            🎉 COOKIE EARNED!
                        </div>
                        <div style="color: #fff; font-size: 10px; line-height: 1.4;">
                            <strong>${npcDisplayName}</strong><br>
                            <span style="color: #4CAF50;">${reward.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                    <div style="background: #4CAF50; color: #000; padding: 5px 10px; border-radius: 10px; font-size: 8px; font-weight: bold;">
                        +1 XP
                    </div>
                </div>
                
                ${objective ? `
                    <!-- Objective section -->
                    <div style="background: rgba(76, 175, 80, 0.1); border: 2px solid #4CAF50; border-radius: 10px; padding: 15px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                            <span style="font-size: 16px;">🎯</span>
                            <span style="color: #4CAF50; font-size: 11px;">NEW OBJECTIVE</span>
                        </div>
                        <div class="objective-text" style="color: #fff; font-size: 9px; line-height: 1.5; overflow: hidden; white-space: nowrap;">
                            ${objective}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Progress indicator -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid #333;">
                    <div style="display: flex; gap: 5px;">
                        ${this.generateProgressDots()}
                    </div>
                    <div style="color: #888; font-size: 8px;">
                        Press Enter to continue
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUpFadeIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
        }, 100);
        
        this.playNotificationSound();
        
        const dismissHandler = (e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
                this.dismissNotification(notification);
                document.removeEventListener('keydown', dismissHandler);
            }
        };
        document.addEventListener('keydown', dismissHandler);
        
        setTimeout(() => {
            if (notification.parentNode) {
                this.dismissNotification(notification);
                document.removeEventListener('keydown', dismissHandler);
            }
        }, 8000);
    }

    dismissNotification(notification) {
        notification.style.animation = 'slideDownFadeOut 0.4s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }

    generateProgressDots() {
        const allNpcCookies = this.getAllNpcCookies();
        const totalNpcs = 6; 
        const earnedCount = Object.keys(allNpcCookies).length;
        
        let dots = '';
        for (let i = 0; i < totalNpcs; i++) {
            const isEarned = i < earnedCount;
            dots += `<div style="
                width: 8px; 
                height: 8px; 
                border-radius: 50%; 
                background: ${isEarned ? '#4CAF50' : '#333'};
                border: 1px solid ${isEarned ? '#4CAF50' : '#666'};
                ${isEarned ? 'box-shadow: 0 0 5px #4CAF50;' : ''}
            "></div>`;
        }
        return dots;
    }

    playNotificationSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = [523.25, 659.25, 783.99]; 
        
        frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1 + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5 + index * 0.1);
            
            osc.start(audioContext.currentTime + index * 0.1);
            osc.stop(audioContext.currentTime + 0.5 + index * 0.1);
        });
    }

    createCookieParticles() {
        const particles = [];
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                bottom: 200px;
                left: 50%;
                width: 8px;
                height: 8px;
                background: ${this.getRandomSparkleColor()};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 6px ${this.getRandomSparkleColor()};
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            this.animateParticle(particle, i);
        }
        
        setTimeout(() => {
            particles.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }, 2000);
    }

    getRandomSparkleColor() {
        const colors = ['#ffd700', '#ffeb3b', '#4CAF50', '#03a9f4', '#e91e63', '#ff9800'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animateParticle(particle, index) {
        const angle = (Math.PI * 2 * index) / 15 + (Math.random() - 0.5) * 0.5;
        const distance = 100 + Math.random() * 150;
        const duration = 1500 + Math.random() * 500;
        
        const deltaX = Math.cos(angle) * distance;
        const deltaY = Math.sin(angle) * distance - 50; 
        
        const keyframes = [
            {
                transform: 'translate(-50%, 0) scale(0)',
                opacity: 0
            },
            {
                transform: 'translate(-50%, 0) scale(1)',
                opacity: 1,
                offset: 0.1
            },
            {
                transform: `translate(calc(-50% + ${deltaX}px), ${deltaY}px) scale(0.5)`,
                opacity: 0.7,
                offset: 0.7
            },
            {
                transform: `translate(calc(-50% + ${deltaX}px), ${deltaY - 30}px) scale(0)`,
                opacity: 0
            }
        ];
        
        particle.animate(keyframes, {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
    }

    initAudioToggle() {
        const isAudioEnabled = localStorage.getItem('gameAudioEnabled') !== 'false';
        
        const audioToggleContainer = document.createElement('div');
        audioToggleContainer.id = 'audio-toggle-container';
        audioToggleContainer.style.cssText = `
            position: fixed;
            top: 120px;
            left: 20px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const audioButton = document.createElement('button');
        audioButton.id = 'audio-toggle-button';
        audioButton.innerHTML = isAudioEnabled ? '🔊' : '🔇';
        audioButton.title = isAudioEnabled ? 'Click to mute audio' : 'Click to enable audio';
        audioButton.style.cssText = `
            background: #000;
            border: 2px solid #fff;
            color: #fff;
            padding: 12px 15px;
            cursor: pointer;
            font-family: 'Press Start 2P', cursive;
            font-size: 18px;
            border-radius: 4px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            animation: glowBorder 2s infinite alternate;
        `;
        
        const audioLabel = document.createElement('span');
        audioLabel.style.cssText = `
            color: #fff;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            opacity: 0.8;
        `;
        audioLabel.textContent = isAudioEnabled ? 'AUDIO ON' : 'AUDIO OFF';
        
        audioButton.addEventListener('click', () => {
            const currentState = localStorage.getItem('gameAudioEnabled') !== 'false';
            const newState = !currentState;
            
            localStorage.setItem('gameAudioEnabled', newState.toString());
            
            audioButton.innerHTML = newState ? '🔊' : '🔇';
            audioButton.title = newState ? 'Click to mute audio' : 'Click to enable audio';
            audioLabel.textContent = newState ? 'AUDIO ON' : 'AUDIO OFF';
            
            window.gameAudioEnabled = newState;
            
            if (newState) {
                this.playConfirmationSound();
            }
            
            this.showAudioToggleFeedback(newState);
        });
        
        audioButton.addEventListener('mouseenter', () => {
            audioButton.style.transform = 'scale(1.05)';
            audioButton.style.borderColor = '#ffd700';
            audioButton.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
        });
        
        audioButton.addEventListener('mouseleave', () => {
            audioButton.style.transform = 'scale(1)';
            audioButton.style.borderColor = '#fff';
            audioButton.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
        });
        
        audioToggleContainer.appendChild(audioButton);
        audioToggleContainer.appendChild(audioLabel);
        document.body.appendChild(audioToggleContainer);
        
        window.gameAudioEnabled = isAudioEnabled;
        
        if (!document.getElementById('audio-toggle-styles')) {
            const style = document.createElement('style');
            style.id = 'audio-toggle-styles';
            style.textContent = `
                @keyframes audioFeedback {
                    0% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.1) rotate(-5deg); }
                    50% { transform: scale(1.2) rotate(5deg); }
                    75% { transform: scale(1.1) rotate(-2deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                
                .audio-feedback {
                    animation: audioFeedback 0.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    playConfirmationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log("Confirmation sound error:", e);
        }
    }
    
    showAudioToggleFeedback(isEnabled) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${isEnabled ? '#4CAF50' : '#f44336'};
            padding: 20px 30px;
            border: 2px solid ${isEnabled ? '#4CAF50' : '#f44336'};
            border-radius: 8px;
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            z-index: 10001;
            pointer-events: none;
            animation: audioFeedback 0.5s ease-out;
            box-shadow: 0 0 20px rgba(${isEnabled ? '76, 175, 80' : '244, 67, 54'}, 0.5);
        `;
        feedback.textContent = isEnabled ? '🔊 AUDIO ENABLED' : '🔇 AUDIO DISABLED';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    }

    initAmbientSounds() {
        this.musicManager = new MinecraftMusicManager();
        
        this.musicManager.startMusicLoop();
        
        this.addUIInteractionSounds();
        
        this.setupMusicEnvironmentDetection();
    }
    
    setupMusicEnvironmentDetection() {
        setInterval(() => {
            if (this.gameControl && this.gameControl.currentLevel) {
                const levelName = this.gameControl.currentLevel.constructor.name.toLowerCase();
                let musicTheme = 'overworld';
                
                if (levelName.includes('office')) {
                    musicTheme = 'creative';
                } else if (levelName.includes('casino')) {
                    musicTheme = 'nether';
                } else if (levelName.includes('bank')) {
                    musicTheme = 'calm';
                } else if (levelName.includes('airport')) {
                    musicTheme = 'creative';
                } else if (levelName.includes('desert')) {
                    musicTheme = 'dry';
                } else if (levelName.includes('underground') || levelName.includes('cave')) {
                    musicTheme = 'cave';
                }
                
                if (this.musicManager.currentTheme !== musicTheme) {
                    this.musicManager.setMusicTheme(musicTheme);
                }
            }
        }, 3000); 
    }
    
    setMusicTheme(theme) {
        if (this.musicManager) {
            this.musicManager.setMusicTheme(theme);
        }
    }
    
    addUIInteractionSounds() {
    }
    
    addUIInteractionSounds() {
        const addHoverSound = (element) => {
            element.addEventListener('mouseenter', () => {
                if (window.gameAudioEnabled !== false) {
                    this.musicManager.playUIHoverSound();
                }
            });
        };
        
        const addClickSound = (element) => {
            element.addEventListener('click', () => {
                if (window.gameAudioEnabled !== false) {
                    this.musicManager.playUIClickSound();
                }
            });
        };
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { 
                        const buttons = node.querySelectorAll ? node.querySelectorAll('button') : [];
                        buttons.forEach(button => {
                            addHoverSound(button);
                            addClickSound(button);
                        });
                        
                        if (node.tagName === 'BUTTON' || node.style.cursor === 'pointer') {
                            addHoverSound(node);
                            addClickSound(node);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

class MinecraftMusicManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = false;
        this.currentTheme = 'overworld';
        this.musicGain = null;
        this.currentTrack = null;
        
        this.musicThemes = {
            'overworld': {
                key: 'C',
                scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C Major
                chords: [
                    [261.63, 329.63, 392.00], // C Major
                    [293.66, 369.99, 440.00], // D Minor
                    [329.63, 392.00, 493.88], // E Minor  
                    [349.23, 440.00, 523.25], // F Major
                    [392.00, 493.88, 587.33], // G Major
                    [220.00, 261.63, 329.63], // A Minor
                ],
                tempo: 80,
                volume: 0.15,
                mood: 'peaceful'
            },
            'creative': {
                key: 'G',
                scale: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 739.99], // G Major
                chords: [
                    [392.00, 493.88, 587.33], // G Major
                    [220.00, 261.63, 329.63], // A Minor
                    [246.94, 311.13, 369.99], // B Minor
                    [261.63, 329.63, 392.00], // C Major
                    [293.66, 369.99, 440.00], // D Major
                    [329.63, 415.30, 493.88], // E Minor
                ],
                tempo: 95,
                volume: 0.18,
                mood: 'uplifting'
            },
            'calm': {
                key: 'Am',
                scale: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00], // A Minor
                chords: [
                    [220.00, 261.63, 329.63], // A Minor
                    [293.66, 349.23, 440.00], // D Minor
                    [329.63, 392.00, 493.88], // E Minor
                    [349.23, 440.00, 523.25], // F Major
                    [261.63, 329.63, 392.00], // C Major
                    [392.00, 493.88, 587.33], // G Major
                ],
                tempo: 65,
                volume: 0.12,
                mood: 'meditative'
            },
            'nether': {
                key: 'Dm',
                scale: [293.66, 311.13, 349.23, 369.99, 415.30, 440.00, 493.88], // D Minor
                chords: [
                    [293.66, 349.23, 440.00], // D Minor
                    [369.99, 440.00, 554.37], // F# Diminished
                    [415.30, 493.88, 622.25], // G# Minor
                    [246.94, 311.13, 369.99], // B Minor
                    [329.63, 415.30, 493.88], // E Minor
                ],
                tempo: 70,
                volume: 0.14,
                mood: 'mysterious'
            },
            'cave': {
                key: 'Fm',
                scale: [174.61, 196.00, 207.65, 233.08, 261.63, 277.18, 311.13], // F Minor
                chords: [
                    [174.61, 207.65, 261.63], // F Minor
                    [196.00, 233.08, 293.66], // G Minor
                    [207.65, 261.63, 311.13], // Ab Major
                    [233.08, 277.18, 349.23], // Bb Minor
                    [138.59, 174.61, 207.65], // Db Major
                ],
                tempo: 55,
                volume: 0.10,
                mood: 'eerie'
            },
            'dry': {
                key: 'E',
                scale: [329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 622.25], // E Major
                chords: [
                    [329.63, 415.30, 493.88], // E Major
                    [369.99, 466.16, 554.37], // F# Minor
                    [415.30, 523.25, 622.25], // G# Minor
                    [440.00, 554.37, 659.25], // A Major
                    [493.88, 622.25, 739.99], // B Major
                ],
                tempo: 75,
                volume: 0.13,
                mood: 'warm'
            }
        };
    }
    
    startMusicLoop() {
        if (!window.gameAudioEnabled) return;
        
        const initialDelay = 30000 + Math.random() * 60000;
        setTimeout(() => {
            this.scheduleNextTrack();
        }, initialDelay);
    }
    
    scheduleNextTrack() {
        if (!window.gameAudioEnabled) return;
        
        this.playProceduralTrack();
        
        const nextDelay = 180000 + Math.random() * 300000; 
        setTimeout(() => {
            this.scheduleNextTrack();
        }, nextDelay);
    }
    
    setMusicTheme(theme) {
        this.currentTheme = theme || 'overworld';
        console.log(`Music theme set to: ${this.currentTheme}`);
    }
    
    playProceduralTrack() {
        if (!window.gameAudioEnabled || this.isPlaying) return;
        
        this.isPlaying = true;
        const theme = this.musicThemes[this.currentTheme] || this.musicThemes['overworld'];
        
        switch (theme.mood) {
            case 'peaceful':
                this.playPeacefulMelody(theme);
                break;
            case 'uplifting':
                this.playUpliftingMelody(theme);
                break;
            case 'meditative':
                this.playMeditativeMelody(theme);
                break;
            case 'mysterious':
                this.playMysteriousMelody(theme);
                break;
            case 'eerie':
                this.playEerieMelody(theme);
                break;
            case 'warm':
                this.playWarmMelody(theme);
                break;
            default:
                this.playPeacefulMelody(theme);
        }
    }
    
    playPeacefulMelody(theme) {
        const duration = 45 + Math.random() * 30; 
        const beatDuration = 60 / theme.tempo; 
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);
        this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(theme.volume, this.audioContext.currentTime + 4);
        
        this.playChordProgression(theme, duration, beatDuration);
        
        setTimeout(() => {
            this.playSimpleMelody(theme, duration - 8, beatDuration);
        }, 8000);
        
        setTimeout(() => {
            if (this.musicGain) {
                this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 3);
            }
            setTimeout(() => {
                this.isPlaying = false;
            }, 3000);
        }, (duration - 3) * 1000);
    }
    
    playUpliftingMelody(theme) {
        const duration = 40 + Math.random() * 25; 
        const beatDuration = 60 / theme.tempo;
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);
        this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(theme.volume, this.audioContext.currentTime + 3);
        
        this.playChordProgression(theme, duration, beatDuration, 'energetic');
        
        setTimeout(() => {
            this.playArpeggioMelody(theme, duration - 6, beatDuration);
        }, 6000);
        
        setTimeout(() => {
            if (this.musicGain) {
                this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
            }
            setTimeout(() => this.isPlaying = false, 2000);
        }, (duration - 2) * 1000);
    }
    
    playMeditativeMelody(theme) {
        const duration = 60 + Math.random() * 40; 
        const beatDuration = 60 / theme.tempo;
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);
        this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(theme.volume, this.audioContext.currentTime + 6);
        
        this.playPadChords(theme, duration, beatDuration * 2);
        
        setTimeout(() => {
            this.playSparseMelody(theme, duration - 12, beatDuration * 1.5);
        }, 12000);
        
        setTimeout(() => {
            if (this.musicGain) {
                this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 5);
            }
            setTimeout(() => this.isPlaying = false, 5000);
        }, (duration - 5) * 1000);
    }
    
    playMysteriousMelody(theme) {
        const duration = 50 + Math.random() * 30;
        const beatDuration = 60 / theme.tempo;
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);
        this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(theme.volume, this.audioContext.currentTime + 4);
        
        this.playChordProgression(theme, duration, beatDuration, 'mysterious');
        
        setTimeout(() => {
            this.playHauntingMelody(theme, duration - 8, beatDuration);
        }, 8000);
        
        setTimeout(() => {
            if (this.musicGain) {
                this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4);
            }
            setTimeout(() => this.isPlaying = false, 4000);
        }, (duration - 4) * 1000);
    }
    
    playEerieMelody(theme) {
        const duration = 55 + Math.random() * 35;
        const beatDuration = 60 / theme.tempo;
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);
        this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(theme.volume, this.audioContext.currentTime + 5);
        
        this.playDarkChords(theme, duration, beatDuration * 1.5);
        
        setTimeout(() => {
            this.playEerieHighMelody(theme, duration - 10, beatDuration);
        }, 10000);
        
        setTimeout(() => {
            if (this.musicGain) {
                this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4);
            }
            setTimeout(() => this.isPlaying = false, 4000);
        }, (duration - 4) * 1000);
    }
    
    playWarmMelody(theme) {
        const duration = 45 + Math.random() * 25;
        const beatDuration = 60 / theme.tempo;
        
        this.musicGain = this.audioContext.createGain();
        this.musicGain.connect(this.audioContext.destination);
        this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(theme.volume, this.audioContext.currentTime + 3);
        
        this.playChordProgression(theme, duration, beatDuration, 'warm');
        
        setTimeout(() => {
            this.playFlowingMelody(theme, duration - 6, beatDuration);
        }, 6000);
        
        setTimeout(() => {
            if (this.musicGain) {
                this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 3);
            }
            setTimeout(() => this.isPlaying = false, 3000);
        }, (duration - 3) * 1000);
    }
    
    playChordProgression(theme, duration, beatDuration, style = 'normal') {
        const chords = theme.chords;
        let chordIndex = 0;
        const chordDuration = beatDuration * 4; 
        
        const playChord = () => {
            if (!this.musicGain) return;
            
            const chord = chords[chordIndex % chords.length];
            
            chord.forEach((freq, noteIndex) => {
                setTimeout(() => {
                    this.createChordNote(freq, chordDuration, theme.volume * 0.3, style);
                }, noteIndex * 50); 
            });
            
            chordIndex++;
            
            if (chordIndex * chordDuration < duration) {
                setTimeout(playChord, chordDuration * 1000);
            }
        };
        
        playChord();
    }
    
    createChordNote(frequency, duration, volume, style) {
        if (!this.musicGain) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        switch (style) {
            case 'warm':
                osc.type = 'sawtooth';
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
                break;
            case 'mysterious':
                osc.type = 'triangle';
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(600, this.audioContext.currentTime);
                break;
            case 'energetic':
                osc.type = 'square';
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
                break;
            default:
                osc.type = 'sine';
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        }
        
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(volume * 0.7, this.audioContext.currentTime + duration - 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }
    
    playSimpleMelody(theme, duration, beatDuration) {
        const scale = theme.scale;
        let noteIndex = 0;
        const noteDuration = beatDuration / 2; 
        
        const playNote = () => {
            if (!this.musicGain) return;
            

            const direction = Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : -2) : (Math.random() > 0.5 ? 1 : -1);
            noteIndex = Math.max(0, Math.min(scale.length - 1, noteIndex + direction));
            
            const frequency = scale[noteIndex] * (Math.random() > 0.8 ? 2 : 1); 
            
            this.createMelodyNote(frequency, noteDuration, theme.volume * 0.4);
            
            const nextDelay = Math.random() > 0.8 ? noteDuration * 3 : noteDuration * 2;
            
            if (nextDelay / 1000 < duration) {
                setTimeout(playNote, nextDelay * 1000);
                duration -= nextDelay;
            }
        };
        
        playNote();
    }
    
    createMelodyNote(frequency, duration, volume) {
        if (!this.musicGain) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }
    
    playArpeggioMelody(theme, duration, beatDuration) {
        this.playSimpleMelody(theme, duration, beatDuration / 2);
    }
    
    playSparseMelody(theme, duration, beatDuration) {
        this.playSimpleMelody(theme, duration, beatDuration * 3);
    }
    
    playHauntingMelody(theme, duration, beatDuration) {
        this.playSimpleMelody(theme, duration, beatDuration * 1.5);
    }
    
    playPadChords(theme, duration, beatDuration) {
        this.playChordProgression(theme, duration, beatDuration * 2, 'warm');
    }
    
    playDarkChords(theme, duration, beatDuration) {
        this.playChordProgression(theme, duration, beatDuration, 'mysterious');
    }
    
    playEerieHighMelody(theme, duration, beatDuration) {
        const scale = theme.scale.map(freq => freq * 2); 
        this.playSimpleMelody({...theme, scale}, duration, beatDuration * 2);
    }
    
    playFlowingMelody(theme, duration, beatDuration) {
        this.playSimpleMelody(theme, duration, beatDuration);
    }
    
    playUIHoverSound() {
        if (!window.gameAudioEnabled) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(800 + Math.random() * 200, this.audioContext.currentTime);
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.log("UI hover sound error:", e);
        }
    }
    
    playUIClickSound() {
        if (!window.gameAudioEnabled) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(1200, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
            osc.type = 'square';
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.08);
        } catch (e) {
            console.log("UI click sound error:", e);
        }
    }
}

class InventoryManager {
    constructor(game) {
        this.game = game;
        this.inventory = Inventory.getInstance();
    }

    giveItem(itemId, quantity = 1) {
        const item = defaultItems[itemId];
        if (!item) {
            console.error(`Item ${itemId} not found in defaultItems`);
            return false;
        }

        const itemToAdd = {
            ...item,
            quantity: quantity
        };

        return this.inventory.addItem(itemToAdd);
    }

    removeItem(itemId, quantity = 1) {
        return this.inventory.removeItem(itemId, quantity);
    }

    hasItem(itemId) {
        return this.inventory.items.some(item => item.id === itemId);
    }

    getItemQuantity(itemId) {
        const item = this.inventory.items.find(item => item.id === itemId);
        return item ? item.quantity : 0;
    }

    giveStartingItems() {
        this.giveItem('knowledge_boost', 2);
        this.giveItem('speed_boost', 2);
        this.giveItem('telescope', 1);
        this.giveItem('star_chart', 1);
        this.giveItem('astronaut_manual', 1);
        this.giveItem('trajectory_calculator', 1);
    }
}

class QuizManager {
    constructor(game) {
        this.game = game;
        this.localQuestions = {
            'propulsion': [
                { id: 1, question: "What principle allows rockets to work?", choices: [
                    { id: 1, text: "Newton's Third Law - every action has an equal and opposite reaction", isCorrect: true },
                    { id: 2, text: "Newton's First Law - objects in motion stay in motion", isCorrect: false },
                    { id: 3, text: "The law of gravity", isCorrect: false },
                    { id: 4, text: "Magnetic propulsion", isCorrect: false }
                ]},
                { id: 2, question: "What is thrust in rocket science?", choices: [
                    { id: 1, text: "The force that moves a rocket forward by expelling mass backward", isCorrect: true },
                    { id: 2, text: "The weight of the rocket", isCorrect: false },
                    { id: 3, text: "The fuel capacity", isCorrect: false },
                    { id: 4, text: "The rocket's speed", isCorrect: false }
                ]},
                { id: 3, question: "What fuel combination is commonly used in liquid rocket engines?", choices: [
                    { id: 1, text: "Liquid hydrogen and liquid oxygen", isCorrect: true },
                    { id: 2, text: "Gasoline and air", isCorrect: false },
                    { id: 3, text: "Natural gas and helium", isCorrect: false },
                    { id: 4, text: "Diesel and nitrogen", isCorrect: false }
                ]}
            ],
            'orbital': [
                { id: 1, question: "What is escape velocity from Earth?", choices: [
                    { id: 1, text: "About 25,000 mph (40,000 km/h)", isCorrect: true },
                    { id: 2, text: "About 1,000 mph", isCorrect: false },
                    { id: 3, text: "About 100,000 mph", isCorrect: false },
                    { id: 4, text: "The speed of sound", isCorrect: false }
                ]},
                { id: 2, question: "What keeps satellites in orbit around Earth?", choices: [
                    { id: 1, text: "Balance between gravity pulling down and forward velocity", isCorrect: true },
                    { id: 2, text: "Constant rocket thrust", isCorrect: false },
                    { id: 3, text: "Magnetic attraction", isCorrect: false },
                    { id: 4, text: "Solar wind", isCorrect: false }
                ]},
                { id: 3, question: "What is the International Space Station's altitude?", choices: [
                    { id: 1, text: "About 250 miles (400 km) above Earth", isCorrect: true },
                    { id: 2, text: "About 10 miles above Earth", isCorrect: false },
                    { id: 3, text: "Halfway to the Moon", isCorrect: false },
                    { id: 4, text: "About 1,000 miles above Earth", isCorrect: false }
                ]}
            ],
            'history': [
                { id: 1, question: "Who was the first human in space?", choices: [
                    { id: 1, text: "Yuri Gagarin (1961)", isCorrect: true },
                    { id: 2, text: "Neil Armstrong (1961)", isCorrect: false },
                    { id: 3, text: "Buzz Aldrin (1959)", isCorrect: false },
                    { id: 4, text: "John Glenn (1958)", isCorrect: false }
                ]},
                { id: 2, question: "What was the first rocket to land on the Moon?", choices: [
                    { id: 1, text: "Apollo 11's Lunar Module 'Eagle'", isCorrect: true },
                    { id: 2, text: "Saturn V", isCorrect: false },
                    { id: 3, text: "Sputnik 1", isCorrect: false },
                    { id: 4, text: "Falcon 9", isCorrect: false }
                ]},
                { id: 3, question: "Who is known as the 'Father of Modern Rocketry'?", choices: [
                    { id: 1, text: "Robert H. Goddard", isCorrect: true },
                    { id: 2, text: "Wernher von Braun", isCorrect: false },
                    { id: 3, text: "Elon Musk", isCorrect: false },
                    { id: 4, text: "Isaac Newton", isCorrect: false }
                ]}
            ],
            'spacex': [
                { id: 1, question: "What was revolutionary about SpaceX's Falcon 9?", choices: [
                    { id: 1, text: "First orbital rocket to successfully land and be reused", isCorrect: true },
                    { id: 2, text: "First rocket to reach space", isCorrect: false },
                    { id: 3, text: "First rocket to use nuclear power", isCorrect: false },
                    { id: 4, text: "First rocket built by a private company", isCorrect: false }
                ]},
                { id: 2, question: "What is Starship designed for?", choices: [
                    { id: 1, text: "Mars colonization and deep space missions", isCorrect: true },
                    { id: 2, text: "Only Earth orbit missions", isCorrect: false },
                    { id: 3, text: "Underwater exploration", isCorrect: false },
                    { id: 4, text: "Airplane travel", isCorrect: false }
                ]},
                { id: 3, question: "How does SpaceX's reusability reduce costs?", choices: [
                    { id: 1, text: "By landing and reflying rocket boosters instead of discarding them", isCorrect: true },
                    { id: 2, text: "By using cheaper fuel", isCorrect: false },
                    { id: 3, text: "By building smaller rockets", isCorrect: false },
                    { id: 4, text: "By hiring fewer workers", isCorrect: false }
                ]}
            ],
            'default': [
                { id: 1, question: "What is rocket science fundamentally about?", choices: [
                    { id: 1, text: "Using physics to send objects beyond Earth's atmosphere", isCorrect: true },
                    { id: 2, text: "Building airplanes", isCorrect: false },
                    { id: 3, text: "Studying rocks", isCorrect: false },
                    { id: 4, text: "Weather prediction", isCorrect: false }
                ]},
                { id: 2, question: "Why do rockets have multiple stages?", choices: [
                    { id: 1, text: "To shed weight as fuel is used, improving efficiency", isCorrect: true },
                    { id: 2, text: "For decoration", isCorrect: false },
                    { id: 3, text: "To carry more passengers", isCorrect: false },
                    { id: 4, text: "Government regulations require it", isCorrect: false }
                ]}
            ]
        };
        this.answeredQuestions = JSON.parse(localStorage.getItem('answeredQuestions')) || {};
    }

    async fetchQuestionByCategory(category) {
        const categoryKey = category.toLowerCase();
        const questions = this.localQuestions[categoryKey] || this.localQuestions['default'];
        const answered = this.answeredQuestions[categoryKey] || [];
        const unanswered = questions.filter(q => !answered.includes(q.id));
        return { questions: unanswered };
    }
    
    async attemptQuizForNpc(npcCategory, callback = null) {
        try {
            const response = await this.fetchQuestionByCategory(npcCategory);
            const allQuestions = response?.questions || [];
    
            if (allQuestions.length === 0) {
                alert(`✅ You've already completed all of ${npcCategory}'s questions!`);
                return;
            }
    
            const quiz = new Quiz(this);
            quiz.initialize();
            quiz.openPanel(npcCategory, callback, allQuestions);
        } catch (error) {
            console.error("Error during NPC quiz attempt:", error);
            alert("⚠️ There was a problem loading the quiz. Please try again.");
        }
    }

    markQuestionAnswered(category, questionId) {
        const categoryKey = category.toLowerCase();
        if (!this.answeredQuestions[categoryKey]) {
            this.answeredQuestions[categoryKey] = [];
        }
        this.answeredQuestions[categoryKey].push(questionId);
        localStorage.setItem('answeredQuestions', JSON.stringify(this.answeredQuestions));
    }
}

class Game {
    constructor(environment) {
        this.environment = environment;
        this.path = environment.path;
        this.gameContainer = environment.gameContainer;
        this.gameCanvas = environment.gameCanvas;
        this.uid = localStorage.getItem('gameUserId') || 'local_player_' + Date.now();
        this.id = this.uid;
        this.gname = 'Rocket Science Adventure';

        localStorage.setItem('gameUserId', this.uid);

        this.statsManager = new StatsManager(this);
        this.inventoryManager = new InventoryManager(this);
        this.quizManager = new QuizManager(this);
        
        this.initUser();
        this.inventoryManager.giveStartingItems();
        
        const gameLevelClasses = environment.gameLevelClasses;
        this.gameControl = new GameControl(this, gameLevelClasses);
        this.gameControl.start();
    }

    static main(environment) {
        return new Game(environment);
    }

    initUser() {
        console.log('Initialized local user:', this.uid);
        this.statsManager.fetchStats(this.id);
    }

    giveItem(itemId, quantity = 1) {
        return this.inventoryManager.giveItem(itemId, quantity);
    }

    removeItem(itemId, quantity = 1) {
        return this.inventoryManager.removeItem(itemId, quantity);
    }

    hasItem(itemId) {
        return this.inventoryManager.hasItem(itemId);
    }

    getItemQuantity(itemId) {
        return this.inventoryManager.getItemQuantity(itemId);
    }

    attemptQuizForNpc(npcCategory, callback = null) {
        return this.quizManager.attemptQuizForNpc(npcCategory, callback);
    }

    
    /**
     * @param {string} npcId 
     * @param {string} reward 
     * @param {string} objective 
     */
    giveNpcCookie(npcId, reward = "completed", objective = null) {
        return this.statsManager.giveNpcCookie(npcId, reward, objective);
    }

    /**
     * @param {string} npcId 
     * @returns {string|null}
     */
    getNpcCookie(npcId) {
        return this.statsManager.getNpcCookie(npcId);
    }

    /**
     * @returns {Object} 
     */
    getAllNpcCookies() {
        return this.statsManager.getAllNpcCookies();
    }

    getNpcCookiesDisplayHTML() {
        const cookies = this.getAllNpcCookies();
        if (Object.keys(cookies).length === 0) {
            return '<span style="color: #999;">No missions completed yet! Talk to NPCs to learn about rockets!</span>';
        }
        
        return Object.entries(cookies).map(([npcId, reward]) => {
            const emoji = npcId === 'Elon-Musk' ? '🏆' : '🚀';
            return `<span style="color: #4CAF50;">${emoji} ${npcId.replace(/-/g, ' ')}: MASTERED</span>`;
        }).join('<br>');
    }

    initProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.id = 'game-progress-bar';
        progressContainer.style.cssText = `
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            height: auto;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9998;
            border-bottom: 2px solid #333;
            backdrop-filter: blur(5px);
            padding: 8px 0;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const progressEmojis = document.createElement('div');
        progressEmojis.id = 'game-progress-emojis';
        progressEmojis.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
            padding: 0 10px;
        `;

        const progressText = document.createElement('div');
        progressText.id = 'game-progress-text';
        progressText.style.cssText = `
            position: fixed;
            top: 95px;
            left: 20px;
            color: white;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 9999;
            background: rgba(0,0,0,0.6);
            padding: 5px 10px;
            border-radius: 15px;
            border: 1px solid #333;
            backdrop-filter: blur(5px);
        `;

        progressContainer.appendChild(progressEmojis);
        document.body.appendChild(progressContainer);
        document.body.appendChild(progressText);

        this.updateProgressBar();

        if (!document.getElementById('progress-bar-styles')) {
            const style = document.createElement('style');
            style.id = 'progress-bar-styles';
            style.textContent = `
                @keyframes controllerPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @keyframes controllerGlow {
                    0% { 
                        filter: drop-shadow(0 0 5px #4CAF50);
                        text-shadow: 0 0 10px #4CAF50;
                    }
                    50% { 
                        filter: drop-shadow(0 0 15px #4CAF50);
                        text-shadow: 0 0 20px #4CAF50;
                    }
                    100% { 
                        filter: drop-shadow(0 0 5px #4CAF50);
                        text-shadow: 0 0 10px #4CAF50;
                    }
                }
                
                @keyframes controllerBounce {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                    100% { transform: translateY(0); }
                }
                
                .controller-completed {
                    animation: controllerGlow 2s infinite;
                }
                
                .controller-pending {
                    opacity: 0.3;
                    filter: grayscale(100%);
                }
                
                .controller-new {
                    animation: controllerPulse 0.5s ease-out, controllerBounce 1s ease-out 0.5s;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateProgressBar() {
        const progressEmojis = document.getElementById('game-progress-emojis');
        const progressText = document.getElementById('game-progress-text');
        
        if (!progressEmojis || !progressText) return;

        const waypointNpcs = [
            'Propulsion-NPC',
            'Orbital-NPC', 
            'History-NPC',
            'SpaceX-NPC',
            'Elon-Musk'
        ];

        const totalNpcs = waypointNpcs.length; // 6 NPCs
        const npcCookies = this.getAllNpcCookies();
        
        const completedNpcs = waypointNpcs.filter(npcId => npcCookies[npcId]).length;
        const progressPercentage = (completedNpcs / totalNpcs) * 100;

        const previousCompleted = parseInt(progressEmojis.dataset.previousCompleted || '0');
        progressEmojis.dataset.previousCompleted = completedNpcs.toString();

        progressEmojis.innerHTML = '';

        for (let i = 0; i < totalNpcs; i++) {
            const controllerEmoji = document.createElement('span');
            const isCompleted = i < completedNpcs;
            const isNewlyCompleted = i < completedNpcs && i >= previousCompleted;
            
            controllerEmoji.style.cssText = `
                font-size: 24px;
                transition: all 0.3s ease;
                cursor: pointer;
                user-select: none;
            `;
            
            if (isCompleted) {
                controllerEmoji.textContent = '🎮';
                controllerEmoji.className = isNewlyCompleted ? 'controller-completed controller-new' : 'controller-completed';
                controllerEmoji.title = `${waypointNpcs[i]} - Completed!`;
            } else {
                controllerEmoji.textContent = '🕹️'; 
                controllerEmoji.className = 'controller-pending';
                controllerEmoji.title = `${waypointNpcs[i]} - Not completed yet`;
            }
            
            // Add hover effects
            controllerEmoji.addEventListener('mouseenter', () => {
                if (isCompleted) {
                    controllerEmoji.style.transform = 'scale(1.2)';
                    controllerEmoji.style.filter = 'drop-shadow(0 0 10px #ffd700)';
                } else {
                    controllerEmoji.style.transform = 'scale(1.1)';
                    controllerEmoji.style.opacity = '0.6';
                }
            });
            
            controllerEmoji.addEventListener('mouseleave', () => {
                controllerEmoji.style.transform = 'scale(1)';
                if (isCompleted) {
                    controllerEmoji.style.filter = '';
                } else {
                    controllerEmoji.style.opacity = '0.3';
                }
            });
            
            progressEmojis.appendChild(controllerEmoji);
        }
        
        progressText.textContent = `🚀 ${completedNpcs}/${totalNpcs} Missions Complete (${Math.round(progressPercentage)}%)`;

        // Special effect when completed
        if (completedNpcs === totalNpcs) {
            progressText.textContent = '🏆 ROCKET SCIENTIST CERTIFIED! 🚀';
            progressText.style.color = '#ffd700';
            
            const controllers = progressEmojis.querySelectorAll('span');
            controllers.forEach((controller, index) => {
                setTimeout(() => {
                    controller.style.animation = 'controllerPulse 0.5s ease-out, controllerBounce 1s ease-out 0.5s';
                }, index * 100);
            });
            
            this.showCompletionCelebration();
        }
    }

    showCompletionCelebration() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createCelebrationFirework();
            }, i * 100);
        }
    }

    createCelebrationFirework() {
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
        const particles = [];
        const particleCount = 20;
        
        // Random position on screen
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.6; 
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10001;
                box-shadow: 0 0 10px currentColor;
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 100 + Math.random() * 150;
            const deltaX = Math.cos(angle) * distance;
            const deltaY = Math.sin(angle) * distance;
            
            particle.animate([
                {
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 1
                },
                {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1,
                    offset: 0.1
                },
                {
                    transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(0.5)`,
                    opacity: 0.5,
                    offset: 0.8
                },
                {
                    transform: `translate(calc(-50% + ${deltaX * 1.2}px), calc(-50% + ${deltaY * 1.2}px)) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 2000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
        }
        
        setTimeout(() => {
            particles.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }, 3000);
    }

    initAudioToggle() {
        const isAudioEnabled = localStorage.getItem('gameAudioEnabled') !== 'false';
        
        const audioToggleContainer = document.createElement('div');
        audioToggleContainer.id = 'audio-toggle-container';
        audioToggleContainer.style.cssText = `
            position: fixed;
            top: 120px;
            left: 20px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const audioButton = document.createElement('button');
        audioButton.id = 'audio-toggle-button';
        audioButton.innerHTML = isAudioEnabled ? '🔊' : '🔇';
        audioButton.title = isAudioEnabled ? 'Click to mute audio' : 'Click to enable audio';
        audioButton.style.cssText = `
            background: #000;
            border: 2px solid #fff;
            color: #fff;
            padding: 12px 15px;
            cursor: pointer;
            font-family: 'Press Start 2P', cursive;
            font-size: 18px;
            border-radius: 4px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            animation: glowBorder 2s infinite alternate;
        `;
        
        const audioLabel = document.createElement('span');
        audioLabel.style.cssText = `
            color: #fff;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            opacity: 0.8;
        `;
        audioLabel.textContent = isAudioEnabled ? 'AUDIO ON' : 'AUDIO OFF';
        
        audioButton.addEventListener('click', () => {
            const currentState = localStorage.getItem('gameAudioEnabled') !== 'false';
            const newState = !currentState;
            
            localStorage.setItem('gameAudioEnabled', newState.toString());
            
            audioButton.innerHTML = newState ? '🔊' : '🔇';
            audioButton.title = newState ? 'Click to mute audio' : 'Click to enable audio';
            audioLabel.textContent = newState ? 'AUDIO ON' : 'AUDIO OFF';
            
            window.gameAudioEnabled = newState;
            
            if (newState) {
                this.playConfirmationSound();
            }
            
            this.showAudioToggleFeedback(newState);
        });
        
        audioButton.addEventListener('mouseenter', () => {
            audioButton.style.transform = 'scale(1.05)';
            audioButton.style.borderColor = '#ffd700';
            audioButton.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
        });
        
        audioButton.addEventListener('mouseleave', () => {
            audioButton.style.transform = 'scale(1)';
            audioButton.style.borderColor = '#fff';
            audioButton.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
        });
        
        audioToggleContainer.appendChild(audioButton);
        audioToggleContainer.appendChild(audioLabel);
        document.body.appendChild(audioToggleContainer);
        
        window.gameAudioEnabled = isAudioEnabled;
        
        if (!document.getElementById('audio-toggle-styles')) {
            const style = document.createElement('style');
            style.id = 'audio-toggle-styles';
            style.textContent = `
                @keyframes audioFeedback {
                    0% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.1) rotate(-5deg); }
                    50% { transform: scale(1.2) rotate(5deg); }
                    75% { transform: scale(1.1) rotate(-2deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                
                .audio-feedback {
                    animation: audioFeedback 0.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    playConfirmationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log("Confirmation sound error:", e);
        }
    }
    
    showAudioToggleFeedback(isEnabled) {
        // Show visual feedback when audio is toggled
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${isEnabled ? '#4CAF50' : '#f44336'};
            padding: 20px 30px;
            border: 2px solid ${isEnabled ? '#4CAF50' : '#f44336'};
            border-radius: 8px;
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            z-index: 10001;
            pointer-events: none;
            animation: audioFeedback 0.5s ease-out;
            box-shadow: 0 0 20px rgba(${isEnabled ? '76, 175, 80' : '244, 67, 54'}, 0.5);
        `;
        feedback.textContent = isEnabled ? '🔊 AUDIO ENABLED' : '🔇 AUDIO DISABLED';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    }
}

export default Game;