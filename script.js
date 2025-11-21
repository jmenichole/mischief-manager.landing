// Endpoint for serverless waitlist function (configure in deployment)
const API_URL = window.WAITLIST_ENDPOINT || "https://mischief-manager.vercel.app/api/waitlist";

const form = document.getElementById("waitlistForm");
const statusEl = document.getElementById("formStatus");
const successEl = document.getElementById("successMessage");
const submitBtn = document.getElementById("waitlistSubmit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Submitting...";
  statusEl.classList.remove("error");
  submitBtn.disabled = true;
  submitBtn.textContent = "Joining...";

  const email = form.email.value.trim();
  const source = form.source.value;
  const handle = form.handle.value.trim();

  if (!email) {
    statusEl.textContent = "Email required.";
    statusEl.classList.add("error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Join the Waitlist";
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, handle }),
    });

    if (res.ok) {
      successEl.classList.remove("hidden");
      statusEl.textContent = "";
      form.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      statusEl.textContent = data.error || "Something went wrong. Try again.";
      statusEl.classList.add("error");
    }
  } catch (err) {
    statusEl.textContent = "Network error. Check connection.";
    statusEl.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Join the Waitlist";
  }
});

// Fallback local storage (in case offline during demo)
// This does not replace secure backend storage.
function storeLocally(email, source, handle) {
  const existing = JSON.parse(localStorage.getItem("mm_waitlist") || "[]");
  existing.push({ email, source, handle, ts: Date.now() });
  localStorage.setItem("mm_waitlist", JSON.stringify(existing));
}
