class StockMoodModal {
    constructor(endpoint = '/api/stock-mood') {
      this.endpoint = endpoint;
      this.modal = null;
      this.createModal();
    }
  
    createModal() {
      this.modal = document.createElement('div');
      this.modal.id = 'stockMoodModal';
      Object.assign(this.modal.style, {
        position: 'fixed',
        top: '80px',
        left: '20px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        fontFamily: 'Segoe UI, sans-serif',
        zIndex: '1000',
        width: '260px'
      });
  
      this.modal.innerHTML = `
        <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #333;">
          📈 How are you feeling about the stock market today?
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button data-mood="Good" style="padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Good</button>
          <button data-mood="Medium" style="padding: 10px; background-color: #FF9800; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Medium</button>
          <button data-mood="Bad" style="padding: 10px; background-color: #F44336; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Bad</button>
        </div>
      `;
  
      const buttons = this.modal.querySelectorAll('button');
      buttons.forEach(button => {
        button.addEventListener('click', () => this.handleMoodClick(button.dataset.mood));
      });
  
      document.body.appendChild(this.modal);
      console.log("📊 Stock Mood Modal created successfully.");
    }
  
    async handleMoodClick(mood) {
      const moodHistory = JSON.parse(localStorage.getItem('stockMoodHistory')) || [];
      moodHistory.push({
        mood,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('stockMoodHistory', JSON.stringify(moodHistory));
      
      alert(`Thanks for your response: ${mood}`);
      console.log("✅ Mood saved locally:", mood);
    }
  }
  
  export default StockMoodModal;
  