window.addEventListener('close', function() {
  window.opener.__callback();
  e.preventDefault();
});