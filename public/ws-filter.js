// Olmart Global WebSocket & Runtime Error Filter
window.addEventListener("unhandledrejection", function (e) {
  var r = e && e.reason ? (typeof e.reason === "string" ? e.reason : (e.reason.message || String(e.reason))) : "";
  if (
    r.indexOf("WebSocket") !== -1 ||
    r.indexOf("websocket") !== -1 ||
    r.indexOf("closed without opened") !== -1 ||
    r.indexOf("failed to connect") !== -1
  ) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
});

window.addEventListener("error", function (e) {
  var m = e && e.message ? e.message : "";
  if (
    m.indexOf("WebSocket") !== -1 ||
    m.indexOf("websocket") !== -1 ||
    m.indexOf("closed without opened") !== -1
  ) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true);

// Prevent stale service workers and cached assets from locking the application into a white screen in preview/iframes
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (var i = 0; i < registrations.length; i++) {
        var reg = registrations[i];
        if (reg && reg.active && reg.active.scriptURL && reg.active.scriptURL.indexOf("firebase") === -1) {
          reg.unregister();
        }
      }
    }).catch(function () {});
  } catch (err) {}
}

