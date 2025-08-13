document
  .getElementById("shorten-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const longUrl = document.getElementById("long-url-input").value;
    const resultContainer = document.getElementById("result-container");

    if (!longUrl) {
      resultContainer.innerHTML =
        '<p style="color: red;">Please enter a URL</p>';
      return;
    }

    try {
      resultContainer.innerHTML = "<p>Shortening URL...</p>";

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: longUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        const shortCode = data.shortUrl.split("/").pop();

        resultContainer.innerHTML = `
                <div class="result-success">
                    <p style="color: green;">✅ URL shortened successfully!</p>
                    <p><strong>Short URL:</strong> 
                        <a href="${data.shortUrl}" target="_blank" style="font-family: monospace; background: #f1f3f4; padding: 6px 12px; border-radius: 4px; font-size: 16px; text-decoration: none; color: #007bff;">short.ly/${shortCode}</a>
                        <button onclick="copyToClipboard('${data.shortUrl}')" class="copy-btn">📋 Copy</button>
                    </p>
                    <p><strong>Original URL:</strong> ${data.originalUrl}</p>
                    <p><a href="/history" style="color: #007bff;">📊 View all your URLs in history</a></p>
                </div>
            `;

        document.getElementById("long-url-input").value = "";
      } else {
        resultContainer.innerHTML = `<p style="color: red;">❌ Error: ${data.error}</p>`;
      }
    } catch (error) {
      resultContainer.innerHTML =
        '<p style="color: red;">❌ Network error. Please try again.</p>';
    }
  });

function copyToClipboard(text) {
  const button = event.target;
  const originalText = button.textContent;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showCopySuccess(button, originalText);
      })
      .catch(() => {
        fallbackCopy(text, button, originalText);
      });
  } else {
    fallbackCopy(text, button, originalText);
  }
}

function fallbackCopy(text, button, originalText) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    showCopySuccess(button, originalText);
  } catch (err) {
    prompt("Copy this URL:", text);
  }

  document.body.removeChild(textArea);
}

function showCopySuccess(button, originalText) {
  button.textContent = "✅";
  button.style.background = "#28a745";

  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = "#6c757d";
  }, 1500);
}
