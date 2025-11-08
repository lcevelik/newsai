// Using CORS proxy to fetch RSS feed
const corsProxy = 'https://api.allorigins.win/raw?url=';
// Using TechCrunch AI feed which is more reliable
const rssFeedUrl = 'https://techcrunch.com/tag/artificial-intelligence/feed/';
const apiUrl = `${corsProxy}${encodeURIComponent(rssFeedUrl)}`;

const newsContainer = document.getElementById('news-container');

// Parse RSS XML and extract items
function parseRSS(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        throw new Error('Error parsing RSS feed');
    }

    const items = xmlDoc.querySelectorAll('item');
    const articles = [];

    items.forEach(item => {
        const title = item.querySelector('title')?.textContent || 'No title';
        const link = item.querySelector('link')?.textContent || '#';
        const description = item.querySelector('description')?.textContent || '';

        articles.push({ title, link, description });
    });

    return articles;
}

// Create article element from item data
function createArticleElement(item) {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');

    const title = document.createElement('h2');
    title.textContent = item.title;

    const description = document.createElement('p');
    // The description from the RSS feed might contain HTML tags,
    // so we'll use a temporary element to decode them.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.description;
    description.textContent = tempDiv.textContent || tempDiv.innerText || "";

    const link = document.createElement('a');
    link.href = item.link;
    link.textContent = 'Read more';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    articleElement.appendChild(title);
    articleElement.appendChild(description);
    articleElement.appendChild(link);

    return articleElement;
}

// Show loading state
function showLoading() {
    newsContainer.classList.add('loading');
    newsContainer.innerHTML = '<p class="loading-message">Loading AI news...</p>';
}

// Show error message
function showError(message) {
    newsContainer.classList.remove('loading');
    newsContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

// Fetch and display news
async function fetchNews() {
    showLoading();

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();
        const articles = parseRSS(xmlText);

        newsContainer.classList.remove('loading');

        if (articles && articles.length > 0) {
            newsContainer.innerHTML = '';
            articles.forEach(item => {
                const articleElement = createArticleElement(item);
                newsContainer.appendChild(articleElement);
            });
        } else {
            showError('No news articles found. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        showError('Could not fetch news. Please check your internet connection and try again.');
    }
}

// Start fetching news when page loads
fetchNews();