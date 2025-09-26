export class LoadingIndicator {
  constructor() {
    this.element = null;
    this.createLoadingElement();
  }

  createLoadingElement() {
    this.element = document.createElement('div');
    this.element.className = 'loading-indicator';
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(style);
    this.element.appendChild(spinner);
    document.body.appendChild(this.element);
  }

  show(message = 'Processing...') {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      color: white;
      margin-top: 20px;
      font-size: 16px;
      position: absolute;
      bottom: 20%;
    `;
    messageElement.textContent = message;
    
    this.element.appendChild(messageElement);
    this.element.style.display = 'flex';
  }

  hide() {
    this.element.style.display = 'none';
    // Remove any message elements
    const messages = this.element.querySelectorAll('div:not(.spinner)');
    messages.forEach(msg => msg.remove());
  }
}