chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('appMain.html', {
    'bounds': {
      'width': 800,
      'height': 600
    }
  });
});
