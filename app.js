const url = "https://data.go.th/group/public-health"
const url1 = `https://data.go.th/group/public-health?q=covid19&sort=score+desc%2C+metadata_modified+desc`
const cheerio = require('cheerio')
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })
const reg = new RegExp(/\\n|\n|\s\s/mg)

// Request making using nightmare
nightmare
  .goto(url1)
  .wait('body')
  .evaluate(() => {
    return document.querySelector('body').innerHTML
  })
  .end()
.then(response => {
  const $ = cheerio.load(html);
  $('div.blockContentSearch div.row').each((i, elem) => {
    console.log($(elem).text())
    data = [];
    data.push({
      title : $(elem).find('div.blockSearchHead').text().replace(reg,''),
      link : $(elem).find('a.aGetLink').attr('href')
    });
  });
  console.log(data);
  return data
}).catch(err => {
  console.log('err',err);
});


// Parsing data using cheerio
let getData = html => {
  data = [];
  const $ = cheerio.load(html);
  $('div.blockContentSearch div.row').each((i, elem) => {
    data.push({
      title : $(elem).find('div.blockSearchHead').text().replace(reg,''),
      link : $(elem).find('a.aGetLink').attr('href')
    });
  });
  return data;
}