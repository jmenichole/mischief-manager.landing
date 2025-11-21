document.getElementById("waitlistForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.elements[0].value;
  const source = e.target.elements[1].value;

  const res = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source })
  });

  if (res.ok) {
    document.getElementById("successMessage").classList.remove("hidden");
  } else {
    alert("Something went wrong joining the waitlist.");
  }
});
