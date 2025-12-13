class Market {
    constructor(initialBalance = 1000, checkIntervalMs = 5000, crashProbability = 0.05) {
      this.balance = initialBalance;
      this.crashed = false;
      this.interval = null;
      this.checkIntervalMs = checkIntervalMs;
      this.crashProbability = crashProbability;
  
      this.statusElement = this.createStatusElement();
      this.updateStatus();
  
      this.startMonitoring();
    }
  
    createStatusElement() {
      const status = document.createElement('div');
      status.id = 'marketStatusIndicator';
      Object.assign(status.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 14px',
        borderRadius: '8px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        transition: 'background-color 0.3s ease',
      });
      status.textContent = '📈 Market Stable';
      document.body.appendChild(status);
      return status;
    }
  
    startMonitoring() {
      this.interval = setInterval(() => {
        this.checkForCrash();
      }, this.checkIntervalMs);
    }
  
    stopMonitoring() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  
    checkForCrash() {
      if (!this.crashed && Math.random() < this.crashProbability) {
        this.crashMarket();
      }
    }
  
    crashMarket() {
      this.crashed = true;
      this.balance *= 0.0085;
      this.updateStatus();
      console.warn("💥 The market has crashed!");
      alert(`💥 The market crashed! Your new balance is $${this.getBalance()}`);
    }
  
    updateStatus() {
      if (this.crashed) {
        this.statusElement.textContent = '💥 Market Crashed';
        this.statusElement.style.backgroundColor = '#F44336';
      } else {
        this.statusElement.textContent = '📈 Market Stable';
        this.statusElement.style.backgroundColor = '#4CAF50';
      }
    }
  
    addEarnings(amount) {
      this.balance += amount;
    }
  
    getBalance() {
      return this.balance.toFixed(2);
    }
  
    resetCrash() {
      this.crashed = false;
      this.updateStatus();
    }
  }
  
  export default Market;
  