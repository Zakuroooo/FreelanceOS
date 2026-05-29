const cheerio = require('cheerio')

async function test(url) {
  const getRes = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })
  const html = await getRes.text()
  const $ = cheerio.load(html)
  
  const socials = { instagram: '', facebook: '', linkedin: '', twitter: '', youtube: '', whatsapp: '', email: '' }
  
  $('a').each((_, el) => {
    const href = $(el).attr('href')
    if (href) {
      const lowerHref = href.toLowerCase()
      if ((lowerHref.includes('instagram.com/') || lowerHref.includes('instagr.am/')) && !socials.instagram) socials.instagram = href
      if ((lowerHref.includes('facebook.com/') || lowerHref.includes('fb.com/')) && !socials.facebook) socials.facebook = href
      if (lowerHref.includes('linkedin.com/') && !socials.linkedin) socials.linkedin = href
      if ((lowerHref.includes('twitter.com/') || lowerHref.includes('x.com/')) && !socials.twitter) socials.twitter = href
      if ((lowerHref.includes('youtube.com/') || lowerHref.includes('youtu.be/')) && !socials.youtube) socials.youtube = href
      if ((lowerHref.includes('wa.me/') || lowerHref.includes('api.whatsapp.com/')) && !socials.whatsapp) socials.whatsapp = href
      if (lowerHref.startsWith('mailto:') && !socials.email) socials.email = href.replace('mailto:', '').split('?')[0]
    }
  })
  console.log(socials)
}

test('https://www.starbucks.in/')
