import WebSocket from 'ws';
import fs from 'fs';
import parse from './parse';
import resolvers from '../resolvers';
import log from '../log';

const storeQuestion = (question) => {
  const current = JSON.parse(fs.readFileSync('./data/questions.json'));
  current.questions.push(question);
  fs.writeFile('./data/questions.json', JSON.stringify(current, null, '\t'), () => {
    log.success('Question stored in JSON');
  });
};

export default function scan(socketUrl) {
  const ws = new WebSocket(socketUrl, {
    headers: {
      Authorization: `Bearer ${process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI2Njc5NjI5LCJ1c2VybmFtZSI6IkFMRVg0NjYzIiwiYXZhdGFyVXJsIjoiZ3M6Ly9jZG4tcHJvZC1oeXBlLXNwYWNlL2RhL2dyZWVuLnBuZyIsInRva2VuIjpudWxsLCJyb2xlcyI6W10sImNsaWVudCI6IiIsImd1ZXN0SWQiOm51bGwsInYiOjEsImlhdCI6MTU4OTA4NDEzMiwiZXhwIjoxNTk2ODYwMTMyLCJpc3MiOiJoeXBlcXVpei8xIn0.R64q87O8LxW1m-vnvo0TWSJl2netNDMVAzD87RjwjB0}`,
      'User-Agent': 'okhttp/3.8.0',
      'x-hq-client': 'Android/1.5.1',
      'x-hq-lang': 'en',
      'x-hq-country': 'GB',
      'x-hq-stk': 'MQ==',
    },
  });

  ws.on('open', () => {
    log.success(`Connected to websocket - ${socketUrl}`);
  });

  ws.on('close', () => {
    log.warn('Disconnected from websocket');
    scan(socketUrl);
  });

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.type !== 'question') return;
    log.success('Question found, resolving... \n');
    const question = parse(data);
    const results = await resolvers.init(question);
    storeQuestion(data);
    console.log(results);
  });
}
