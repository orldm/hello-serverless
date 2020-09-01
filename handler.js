'use strict';

const fetch = require('node-fetch');

const params = {
  method: 'GET',
  headers: { 'Accept': 'application/json' },
};

const url = 'https://icanhazdadjoke.com/search?term=';

module.exports.root = async event => {
  let term = '';
  let message = '';
  if (event.body) {
    const body = JSON.parse(event.body)
    if (body.term) term = body.term;
  }
  const response = await fetch(url+term, params);
  if (response.ok) {
    const json = await response.json();
    if (json.results && json.results.length) {
      const result = json.results[Math.floor(Math.random() * json.results.length)]
      message = result.joke;
    } else {
      message = 'No jokes for today';
    }
  } else {
    message = 'HTTP-Error: ' + response.status;
  }
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message
      },
    ),
  };
};
