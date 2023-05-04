#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/00-pipeline/cdk-pipeline-stack';

const app = new cdk.App();
new PipelineStack(app, 'pipelineStack', {
    // env: {
    //   account: '788527717058',
    //   region: 'eu-central-1',
    // }
  });
  
  app.synth();
