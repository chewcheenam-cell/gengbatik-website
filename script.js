const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");
const form = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");
const whatsappNumber = "60199647331";

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      siteNav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const enquiry = {
    name: formData.get("name"),
    contact: formData.get("contact"),
    type: formData.get("type"),
    message: formData.get("message"),
  };
  const message = [
    "Assalamualaikum, saya nak buat tempahan batik.",
    "",
    `Nama: ${enquiry.name}`,
    `Email/WhatsApp: ${enquiry.contact}`,
    `Jenis tempahan: ${enquiry.type}`,
    `Maklumat tempahan: ${enquiry.message}`,
  ].join("\n");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  formNote.textContent = "Sedang simpan enquiry dan buka WhatsApp...";

  const savePromise = window.location.protocol.startsWith("http")
    ? fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiry),
      }).catch(() => null)
    : Promise.resolve(null);

  savePromise.finally(() => {
    formNote.textContent = "WhatsApp akan dibuka. Sila tekan Send untuk hantar tempahan.";
    form.reset();
    window.location.href = whatsappUrl;
  });
});
