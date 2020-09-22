const url = "https://data.go.th"
const url1 = `https://data.go.th/group/public-health?q=covid19&sort=score+desc%2C+metadata_modified+desc`
const cheerio = require('cheerio')
const Nightmare = require('nightmare')
const axios = require('axios')
let API_KEY_AI4TH = ''
const english = /[A-Za-z0-9]/gim;

const nightmare = Nightmare({ show: true })
const { readFileSync, writeFileSync } = require('fs');
// Request making using nightmare
nightmare
  .goto(url1)
  .wait('body')
  .evaluate(() => {
    return document.querySelector('body').innerHTML
  })
  .end()
.then(async response => {
  let list = await getData(response)
  console.log(list)
  // let result = await trans(list)
  Promise.all(list.map(async (e) => {
    let url = `https://api.aiforthai.in.th/th-zh-nmt/${encodeURI(e.title.replace(english,''))}`
    const options = {
      method: "get",
      url,
      headers: {
        Apikey: API_KEY_AI4TH,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    const { data } = await axios(options)
    let t = {
      ...e,
      title_cn: data
    }
    // console.log('t',t)
    return t
  })).then(async(data) => {
    console.log('result:',data)
    await writeFileSync(`${__dirname}/new.json`, JSON.stringify(data), { encoding: 'utf8' });
  })


})


let trans = (list) => {
  return new Promise(async (resolve, reject) => {
    const result = await list.map(async (e) => {
      let url = `https://api.aiforthai.in.th/th-zh-nmt/${encodeURI(e.title.replace(english,''))}`
      const options = {
        method: "get",
        url,
        headers: {
          Apikey: API_KEY_AI4TH,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      const { data } = await axios(options)
      let t = {
        ...e,
        title_cn: data
      }
      // console.log('t',t)
      return t
    })
    resolve(result)
  })
}

const reg = new RegExp(/\\n|\n|\s\s/mg)

// Parsing data using cheerio
let getData = html => {
  let data = [];
  const $ = cheerio.load(html);
  $('div.blockContentSearch div.row').each((i, elem) => {
    data.push({
      title : $(elem).find('div.blockSearchHead').text().replace(reg,''),
      link : url+$(elem).find('a.aGetLink').attr('href')
    });
  });
  return data;
}