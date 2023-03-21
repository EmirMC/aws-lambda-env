#!/usr/bin/env node

var argv = require("minimist")(process.argv.slice(2));

if (argv?.h || argv?.help) {
  console.log(`
  Usage: aws-lambda-env-variable-push [options]

  Options:
    -h, --help          output usage information
    -v, --version       output the version number
    -d, --dir           deployment directory
    -s, --stage         stage name
    -n, --name          lambda function name
    -e, --env           environment folder name
    -y, --yes           skip prompts

  Examples:
    $ aws-lambda-env-variable-push -s production -n my-lambda-function -e .env.production -y
    $ aws-lambda-env-variable-push --dir=$(pwd) --stage=production --name=my-lambda-function --env=.env.production -y
  `);
  process.exit(0);
}
const isSkip = argv?.y || argv?.yes;
if (argv?.v || argv?.version) {
  console.log(require("../package.json").version);
  process.exit(0);
}

const child_process = require("child_process");
const path = require("path");
const util = require("util");
const prompt = require("prompt-sync")({ sigint: true });

const deploymentDir = argv?.d || argv?.dir || process.cwd();
if (!deploymentDir) {
  console.error("Please specify a directory to deploy.");
  process.exit(1);
}

const rel = (relPath) => path.resolve(deploymentDir, relPath);

const parse = require("./helpers/parserEnv");
const exec = util.promisify(child_process.exec);

(async () => {
  console.time("Running time");

  // Get stage name
  let STAGE = argv?.s || argv?.stage || "production";
  const ANSWER_STAGE = !isSkip && prompt(`Stage name [${STAGE}]: `);
  if (!isSkip && ANSWER_STAGE?.trim()?.length > 0) STAGE = ANSWER_STAGE;

  // Get lambda function name
  const splited_dir = deploymentDir.split("/");
  let LAMBDA_FUNCTION_NAME =
    argv?.n ||
    argv?.name ||
    splited_dir[splited_dir.length - 2] + "-" + splited_dir[splited_dir.length - 1] + "-" + STAGE;
  const ANSWER_LAMBDA_FUNCTION_NAME = !isSkip && prompt(`Lambda function name [${LAMBDA_FUNCTION_NAME}]: `);
  if (!isSkip && ANSWER_LAMBDA_FUNCTION_NAME?.trim()?.length > 0) LAMBDA_FUNCTION_NAME = ANSWER_LAMBDA_FUNCTION_NAME;

  // Get environment folder name
  let ENVIRONMENT_FOLDER = argv?.e || argv?.env || `.env.${STAGE}`;
  const ANSWER_ENVIRONMENT_FOLDER = !isSkip && prompt(`Lambda function name [${ENVIRONMENT_FOLDER}]: `);
  if (!isSkip && ANSWER_ENVIRONMENT_FOLDER?.trim()?.length > 0) ENVIRONMENT_FOLDER = ANSWER_ENVIRONMENT_FOLDER;

  // Get environment variables
  const variables = await parse(rel(ENVIRONMENT_FOLDER));

  console.log(`Pushing to ${LAMBDA_FUNCTION_NAME} AWS Lambda...`);
  // Push to AWS Lambda
  await exec(
    `aws lambda update-function-configuration \
    --function-name ${LAMBDA_FUNCTION_NAME} \
    --environment "Variables={${variables}}"`,
    { cwd: deploymentDir }
  );

  console.log(`Pushed to ${LAMBDA_FUNCTION_NAME} AWS Lambda.`);
  console.log("Environment variables: \n", variables);
  console.timeEnd("Running time");
  console.log("Finish Date: ", new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }));
})();
