const API_URL = "https://mischief-manager.vercel.app/api/waitlist";

document.getElementById("waitlistForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const source = e.target.source.value;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source }),
  });

  if (res.ok) {
    document.getElementById("successMessage").classList.remove("hidden");
    e.target.reset();
  } else {
    alert("Something went wrong. Try again!");
  }
});
