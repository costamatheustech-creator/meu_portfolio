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

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.googleAnalytics = measurementId;
  document.head.appendChild(script);
})();
