const cheerio = require('cheerio');

async function checkWebsite(url) {
  if (!url.startsWith('http')) url = 'https://' + url;
  console.log("Fetching", url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const socials = {};
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        if (href.includes('instagram.com')) socials.instagram = href;
        if (href.includes('facebook.com')) socials.facebook = href;
        if (href.includes('linkedin.com')) socials.linkedin = href;
      }
    });
    console.log(socials);
  } catch (e) {
    console.error(e.message);
  }
}
checkWebsite('cafevolkan.com');
checkWebsite('https://cafevolkan.com');
