document.getElementById("searchBtn").addEventListener("click", async () => {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  try {
    // Replace with your API endpoint
    const response = await fetch(`https://your-api.com/search/${query}`);
    const data = await response.json();

    document.getElementById("results").innerHTML = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
    document.getElementById("results").textContent = "Error fetching data.";
  }
});
