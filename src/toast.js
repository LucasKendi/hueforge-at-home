// Simple toast notification system
const createToastContainer = () => {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  `;
  document.body.appendChild(container);
  return container;
};

export const showToast = (message, type = 'error') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = createToastContainer();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  
  toast.style.cssText = `
    padding: 12px 24px;
    margin-bottom: 10px;
    border-radius: 4px;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease-in;
    ${type === 'error' ? 'background-color: #ef4444;' : 'background-color: #10b981;'}
  `;

  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      container.removeChild(toast);
      if (container.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 300);
  }, 3000);
};