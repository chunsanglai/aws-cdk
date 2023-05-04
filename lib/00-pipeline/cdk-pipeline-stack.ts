import { Construct } from 'constructs';
import { CodeBuildStep, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import * as cdkpipelines from 'aws-cdk-lib/pipelines';
import { Stack, StackProps } from 'aws-cdk-lib';
import variables from '../../bin/load-dotenv';
import { PipelineStage } from './cdk-pipeline-stage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdkPipeline = new cdkpipelines.CodePipeline(this, 'cdkPipeline', {
        pipelineName: `${variables.CUSTOMER_NAME}-cdkPipeline`,
        synth: new CodeBuildStep("SynthStep", {
            input: CodePipelineSource.connection(
                `${variables.PIPELINE_GIT_OWNER}/${variables.PIPELINE_GIT_REPO}`,
                variables.PIPELINE_BRANCH,
                { connectionArn: variables.PIPELINE_CODESTAR_CONNECTION_ARN }
            ),
            commands: ['npm ci', 'npm run build', 'npx cdk synth'],
        })
    });

    if (variables.PROD_AWS_ACCOUNT_ID) {
      const production = new PipelineStage(this, variables.PROD_AWS_ACCOUNT_STAGE, {
        stage: variables.PROD_AWS_ACCOUNT_STAGE,
        stageShort: variables.PROD_AWS_ACCOUNT_STAGE_SHORT,
        vpcCidr: variables.PROD_VPC_CIDR,
      });
      cdkPipeline.addStage(production);
    }
  }
}
