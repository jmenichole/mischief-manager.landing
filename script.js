document.getElementById("waitlistForm").addEventListener("submit", (e) => {
  e.preventDefault();

  document.getElementById("successMessage").classList.remove("hidden");

  // TODO: hook up actual waitlist backend
});
