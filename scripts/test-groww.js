const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const { data } = await axios.get('https://groww.in/ipo');
  const $ = cheerio.load(data);
  const nextDataStr = $('#__NEXT_DATA__').html() || '';
  if (!nextDataStr) {
    console.log('No next data');
    const b2bStr = $('script').filter((i, el) => $(el).html().includes('window.__INITIAL_STATE__')).html();
    console.log(b2bStr ? b2bStr.substring(0, 100) : 'No initial state script either.');
    return;
  }
  const nextData = JSON.parse(nextDataStr);
  console.log('Open IPOs count:', nextData.props?.pageProps?.openDataList?.length);
  console.log('Upcoming IPOs count:', nextData.props?.pageProps?.upcomingDataList?.length);
  console.log('Sample Open:', JSON.stringify(nextData.props?.pageProps?.openDataList?.[0] || {}, null, 2));
}

test();
