const axios = require('axios').default;
const fs = require('fs');
const chalk = require('chalk');

module.exports = class downloader {
  constructor(name, start, end, auth) {
    this.name = name;
    this.start = Math.max(start, end);
    this.auth = auth;
    this.end = Math.min(start, end);
    this.atual = Math.max(start, end);
    this.counter = Math.max(start, end);
    this.messages = [`Current Transcript: ${this.atual} (${this.start-this.atual} done)`];
    this.initiator2 = setInterval(async () => {
      this.messages[0]= `Current Transcript: ${this.atual} (${this.start-this.atual} done)`;
      this.log();
      this.next();
    }, 2000);
  }

  next() {
    if(this.counter==this.atual){
      this.counter--;
      this.gettranscript()
    }
  }
  log() {
    this.messages.forEach(message => {
      console.log(chalk.blue(this.name)+chalk.gray("->")+chalk.white(message))
    });
  }

  async gettranscript() {
    if(this.atual>this.end){
      let response;
      let valid = false;
      try {
        response = await axios.get(`https://api.ticketsbot.net/api/940907977014120488/transcripts/${this.atual}/render`, {
          headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'pt-PT,pt;q=0.5',
            'authorization': this.auth,
            'cache-control': 'no-cache',
            'origin': 'https://dashboard.ticketsbot.net',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': 'https://dashboard.ticketsbot.net/',
            'sec-ch-ua': '"Not(A:Brand";v="99", "Brave";v="133", "Chromium";v="133"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"SteamOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'sec-gpc': '1',
            'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36^",
            'x-tickets': 'true'
          }
        })
        
        valid = true;
      } catch (error) {
        if("You do not have permission to view this transcript"!=error.response.data.error && "Transcript not found"!=error.response.data.error){
          this.counter++;
          this.atual++; 
          this.messages.push(this.atual+" "+error.response.data.error)
        }
      }
      this.atual--;
      if (valid) fs.writeFileSync(__dirname+`/tickets/ticket_${this.atual}.html`, response.data)
    }else{
      clearInterval(this.initiator2);
    }}
}; 