async function checkFsq() {
  const key = 'fsq381Gh1nt3e5NXICtQLnyDX3+hwsVBi6IwUphrPoOjLgo=';
  const urls = [
    'https://api.foursquare.com/v4/places/search?query=coffee&limit=1',
    'https://places.foursquare.com/v1/search?query=coffee&limit=1'
  ];
  
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Authorization: key, Accept: 'application/json' } });
      console.log(url, res.status, await res.text());
    } catch (e) {}
  }
}
checkFsq();
