# hello-serverless

An example project with AWS Lambda & API gateway

Usage:

    curl --request POST \
      --url https://aqu81rrcdh.execute-api.us-east-2.amazonaws.com/dev/ \
      --header 'content-type: application/json' \
      --data '{
          "term": "hipster"
        }'
