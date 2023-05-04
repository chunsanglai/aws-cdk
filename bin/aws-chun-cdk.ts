#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/00-pipeline/pipeline-stack';
// import { VpcStack } from '../lib/01-skeleton/vpc-stack';
// import { EC2Stack } from '../lib/02-compute/ec2-stack';

const app = new cdk.App();
new PipelineStack(app, 'pipelineStack', {
    env: {
      account: '788527717058',
      region: 'eu-central-1',
    }
  });
  
  app.synth();

// const vpcStack = new VpcStack(app, 'vpcStack', {});
// new EC2Stack(app, 'ec2Stack', { vpc: vpcStack.vpc });