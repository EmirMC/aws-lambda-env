Set local env file to AWS Lambda Environment Variable

```
npm install aws-lambda-env-variable-push --save-dev
```
OR
```
yarn add aws-lambda-env-variable-push -D
```

# add script in package.json file
```
"pushenv": "aws-lambda-env-variable-push $(pwd)"
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