# hello-serverless

An example project with AWS Lambda & API gateway

Usage:

    curl --request POST \
      --url https://aqu81rrcdh.execute-api.us-east-2.amazonaws.com/dev/ \
      --header 'content-type: application/json' \
      --data '{
          "term": "hipster"
        }'

`postprocess` function is triggered when file is uploaded to S3 bucket,
it processes Excel files and writes data to DynamoDB.

Check users in the db:

    curl --request GET \
      --url https://1bif9owb9i.execute-api.us-east-1.amazonaws.com/dev/users \
