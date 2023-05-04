// Here we initialize the .env.* files in which we can set the Environment Variables for the CDK application
import * as fs from 'fs';
import * as path from 'path';
import * as dotenvFlow from 'dotenv-flow';

// Here we collect the .env.* files in which we can set the Environment Variables for the CDK application
const envdir = './environments/';
const environmentFiles = fs
  .readdirSync(path.resolve(__dirname, envdir), { withFileTypes: true })
  .filter((item) => !item.isDirectory() && item.name.startsWith('.env'))
  .map((item) => path.resolve(__dirname, envdir.concat(item.name)));

// We seperate env variables between different environments.
// Here the env vars are loaded for each environment. You can also add new environment files if applicable.
dotenvFlow.load([...environmentFiles]);

const variables = dotenvFlow.parse([...environmentFiles]);

// You can use the code below for debudding purposes to find out which env vars are loaded
// console.log(typeof variables, variables);

export default variables;
