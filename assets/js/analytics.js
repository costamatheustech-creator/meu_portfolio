(() => {
  const measurementId = "G-4ZQF985V2F";

  if (window.__googleAnalyticsLoaded) return;
  window.__googleAnalyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const currentScript = document.currentScript;
  const loadImmediately = currentScript?.dataset.eager === "true";

  function loadGoogleAnalytics() {
    if (document.querySelector(`script[data-google-analytics="${measurementId}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.fetchPriority = loadImmediately ? "high" : "low";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.googleAnalytics = measurementId;
    document.head.appendChild(script);
  }

  if (loadImmediately) {
    loadGoogleAnalytics();
  } else {
    window.setTimeout(loadGoogleAnalytics, 1500);
  }
})();
