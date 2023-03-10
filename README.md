Set local env file to AWS Lambda Environment Variable

```
npm install aws-lambda-environment-push --save-dev
```
OR
```
yarn add aws-lambda-environment-push -D
```

# add script in package.json file
```
"pushenv": "aws-lambda-environment-push $(pwd)"
```

# Run
```
npm run pushenv
```
OR
```
yarn run pushenv
```

That's it :)