(() => {
  const phoneNumber = "5511917692288";
  const defaultMessage = "Olá, Matheus! Quero conversar sobre um site.";
  const requestedMessage = new URLSearchParams(window.location.search).get("text");
  const message = requestedMessage && requestedMessage.trim().length <= 2000
    ? requestedMessage.trim()
    : defaultMessage;

  const destination = new URL(`https://wa.me/${phoneNumber}`);
  destination.searchParams.set("text", message);

  const fallback = document.querySelector("[data-whatsapp-fallback]");
  if (fallback) {
    fallback.href = destination.toString();
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "whatsapp_click", {
      method: "whatsapp",
      transport_type: "beacon"
    });
  }

  const redirectTimer = window.setTimeout(() => {
    window.location.replace(destination.toString());
  }, 2000);

  if (fallback) {
    fallback.addEventListener("click", () => window.clearTimeout(redirectTimer), { once: true });
  }
})();
