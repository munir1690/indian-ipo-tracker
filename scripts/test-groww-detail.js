const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  const { data } = await axios.get('https://groww.in/ipo/striders-impex-ipo');
  const $ = cheerio.load(data);
  const nextDataStr = $('#__NEXT_DATA__').html() || '';
  if (!nextDataStr) {
    console.log('No next data');
    return;
  }
  const d = JSON.parse(nextDataStr);
  
  // Dump the entire pageProps to see where things live
  fs.writeFileSync('./scripts/groww-dump.json', JSON.stringify(d.props?.pageProps || {}, null, 2));
  console.log('Dumped to scripts/groww-dump.json');
}

test();
