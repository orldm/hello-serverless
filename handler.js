"use strict";

const fetch = require("node-fetch");
const uuid = require("uuid");
const AWS = require("aws-sdk");
const xlsx = require("node-xlsx");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const params = {
  method: "GET",
  headers: { Accept: "application/json" },
};

const url = "https://icanhazdadjoke.com/search?term=";

module.exports.root = async (event) => {
  let term = "";
  let message = "";
  if (event.body) {
    const body = JSON.parse(event.body);
    if (body.term) term = body.term;
  }
  const response = await fetch(url + term, params);
  if (response.ok) {
    const json = await response.json();
    if (json.results && json.results.length) {
      const result =
        json.results[Math.floor(Math.random() * json.results.length)];
      message = result.joke;
    } else {
      message = "No jokes for today";
    }
  } else {
    message = "HTTP-Error: " + response.status;
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message,
    }),
  };
};

module.exports.getUsers = async () => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };
  const { Items } = await dynamoDb.scan(params).promise();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(Items),
  };
};

module.exports.postprocess = async (event) => {
  const buffer = await getBufferFromS3Promise(event.Records[0].s3.object.key);
  const workbook = xlsx.parse(buffer);
  const { data } = workbook[0];
  const items = data.map((item) => ({
    PutRequest: {
      Item: {
        id: uuid.v1(),
        firstName: item[0],
        lastName: item[1],
      },
    },
  }));
  const params = {
    RequestItems: {
      [process.env.DYNAMODB_TABLE]: items,
    },
  };

  await dynamoDb
    .batchWrite(params, (error, data) => {
      if (error) {
        console.log("Error", error);
      } else {
        console.log("Success", data);
      }
    })
    .promise();
};

// Get buffered file from s3
function getBufferFromS3(file, callback) {
  const buffers = [];
  const s3 = new AWS.S3();
  const stream = s3
    .getObject({ Bucket: process.env.STORAGE, Key: file })
    .createReadStream();
  stream.on("data", (data) => buffers.push(data));
  stream.on("end", () => callback(null, Buffer.concat(buffers)));
  stream.on("error", (error) => callback(error));
}

// promisify read stream from s3
function getBufferFromS3Promise(file) {
  return new Promise((resolve, reject) => {
    getBufferFromS3(file, (error, s3buffer) => {
      if (error) return reject(error);
      return resolve(s3buffer);
    });
  });
}
