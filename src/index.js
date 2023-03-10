#!/usr/bin/env node

const child_process = require("child_process");
const path = require("path");
const util = require("util");
const prompt = require("prompt-sync")({ sigint: true });

const deploymentDir = process.argv[2];
const rel = (relPath) => path.resolve(deploymentDir, relPath);

require("dotenv").config({ path: rel(".env") });

const parse = require("./helpers/parserEnv");
const exec = util.promisify(child_process.exec);

(async () => {
  console.time("Running time");
  let STAGE = "main";
  const ANSWER_STAGE = prompt(`Stage name [${STAGE}]: `);
  if (ANSWER_STAGE?.trim()?.length > 0) STAGE = ANSWER_STAGE;
  let LAMBDA_FUNCTION_NAME = deploymentDir.split("/").pop() + "-" + STAGE + "-hitook";
  const ANSWER_LAMBDA_FUNCTION_NAME = prompt(`Lambda function name [${LAMBDA_FUNCTION_NAME}]: `);
  if (ANSWER_LAMBDA_FUNCTION_NAME?.trim()?.length > 0) LAMBDA_FUNCTION_NAME = ANSWER_LAMBDA_FUNCTION_NAME;
  const variables = await parse(rel(".env"));
  console.log(`Pushing to ${LAMBDA_FUNCTION_NAME} AWS Lambda...`);
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
