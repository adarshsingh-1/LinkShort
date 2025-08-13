document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    document.getElementById('refresh-btn').addEventListener('click', loadHistory);
});

async function loadHistory() {
    const loading = document.getElementById('loading');
    const table = document.getElementById('history-table');
    const noUrls = document.getElementById('no-urls');
    const tableBody = document.getElementById('url-table-body');
    
    loading.style.display = 'block';
    table.style.display = 'none';
    noUrls.style.display = 'none';
    
    try {
        const response = await fetch('/api/urls');
        const urls = await response.json();
        
        loading.style.display = 'none';
        
        if (urls.length === 0) {
            noUrls.style.display = 'block';
            return;
        }
        
        tableBody.innerHTML = '';
        
        urls.forEach(url => {
            const row = document.createElement('tr');
            const shortUrl = `${window.location.origin}/${url.shortCode}`;
            const createdDate = new Date(url.createdAt).toLocaleDateString();
            
            row.innerHTML = `
                <td>
                    <a href="${url.originalUrl}" target="_blank" title="${url.originalUrl}">
                        ${truncateUrl(url.originalUrl, 50)}
                    </a>
                </td>
                <td>
                    <a href="${shortUrl}" target="_blank" style="font-family: monospace; background: #f1f3f4; padding: 4px 8px; border-radius: 4px; text-decoration: none; color: #007bff;">short.ly/${url.shortCode}</a>
                    <button onclick="copyToClipboard('${shortUrl}')" class="copy-btn">📋</button>
                </td>
                <td><span class="click-count">${url.clicks}</span></td>
                <td>${createdDate}</td>
                <td>
                    <button onclick="getAnalytics('${url.shortCode}')" class="analytics-btn">📈 View</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        table.style.display = 'table';
        
    } catch (error) {
        loading.style.display = 'none';
        noUrls.innerHTML = '<p style="color: red;">❌ Error loading URL history.</p>';
        noUrls.style.display = 'block';
    }
}

function truncateUrl(url, maxLength) {
    return url.length <= maxLength ? url : url.substring(0, maxLength) + '...';
}

function copyToClipboard(text) {
    const button = event.target;
    const originalText = button.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button, originalText);
        }).catch(() => {
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
        document.execCommand('copy');
        showCopySuccess(button, originalText);
    } catch (err) {
        prompt('Copy this URL:', text);
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess(button, originalText) {
    button.textContent = '✅';
    button.style.background = '#28a745';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#6c757d';
    }, 1500);
}

async function getAnalytics(shortCode) {
    try {
        const response = await fetch(`/api/analytics/${shortCode}`);
        const analytics = await response.json();
        
        if (response.ok) {
            alert(`📊 Analytics for ${shortCode}:\n\nClicks: ${analytics.clicks}\nCreated: ${new Date(analytics.createdAt).toLocaleString()}\nOriginal URL: ${analytics.originalUrl}`);
        } else {
            alert('Error getting analytics: ' + analytics.error);
        }
    } catch (error) {
        alert('Error getting analytics. Please try again.');
    }
}