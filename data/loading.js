let activeRequests = 0;

function getLoadingOverlay() {
  let overlay = document.getElementById('api-loading-overlay');
  if (overlay) return overlay;

  const style = document.createElement('style');
  style.textContent = `
    #api-loading-overlay { position: fixed; inset: 0; z-index: 9999; display: none; align-items: center; justify-content: center; background: rgba(15, 23, 42, .3); }
    #api-loading-overlay.is-visible { display: flex; }
    #api-loading-overlay .api-loading-card { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-radius: 12px; background: #fff; color: #1e293b; font: 600 14px/1.2 Arial, sans-serif; box-shadow: 0 12px 30px rgba(15, 23, 42, .2); }
    #api-loading-overlay .api-loading-spinner { width: 20px; height: 20px; border: 3px solid #ff5a1f; border-right-color: transparent; border-radius: 50%; animation: api-loading-spin .7s linear infinite; }
    @keyframes api-loading-spin { to { transform: rotate(360deg); } }
  `;
  document.head.append(style);

  overlay = document.createElement('div');
  overlay.id = 'api-loading-overlay';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', 'Loading data from the server');
  overlay.innerHTML = '<div class="api-loading-card"><span class="api-loading-spinner" aria-hidden="true"></span><span>Loading...</span></div>';
  document.body.append(overlay);
  return overlay;
}

export async function withLoading(request) {
  activeRequests += 1;
  const overlay = getLoadingOverlay();
  overlay.classList.add('is-visible');

  try {
    return await request();
  } finally {
    activeRequests -= 1;
    if (activeRequests === 0) overlay.classList.remove('is-visible');
  }
}
