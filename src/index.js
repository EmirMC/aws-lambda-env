#!/usr/bin/env node

const child_process = require("child_process");
const path = require("path");
const util = require("util");
const prompt = require("prompt-sync")({ sigint: true });

const deploymentDir = process.argv[2];
const rel = (relPath) => path.resolve(deploymentDir, relPath);

const parse = require("./helpers/parserEnv");
const exec = util.promisify(child_process.exec);

(async () => {
  console.time("Running time");

  // Get stage name
  let STAGE = "production";
  const ANSWER_STAGE = prompt(`Stage name [${STAGE}]: `);
  if (ANSWER_STAGE?.trim()?.length > 0) STAGE = ANSWER_STAGE;

  // Get lambda function name
  const splited_dir = deploymentDir.split("/");
  let LAMBDA_FUNCTION_NAME =
    splited_dir[splited_dir.length - 2] + "-" + splited_dir[splited_dir.length - 1] + "-" + STAGE;
  const ANSWER_LAMBDA_FUNCTION_NAME = prompt(`Lambda function name [${LAMBDA_FUNCTION_NAME}]: `);
  if (ANSWER_LAMBDA_FUNCTION_NAME?.trim()?.length > 0) LAMBDA_FUNCTION_NAME = ANSWER_LAMBDA_FUNCTION_NAME;

  // Get environment folder name
  let ENVIRONMENT_FOLDER = `.env.${STAGE}`;
  const ANSWER_ENVIRONMENT_FOLDER = prompt(`Lambda function name [${ENVIRONMENT_FOLDER}]: `);
  if (ANSWER_ENVIRONMENT_FOLDER?.trim()?.length > 0) ENVIRONMENT_FOLDER = ANSWER_ENVIRONMENT_FOLDER;

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
