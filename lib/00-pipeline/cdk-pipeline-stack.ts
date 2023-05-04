import { Construct } from 'constructs';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Stack, StackProps } from 'aws-cdk-lib';
import { PipelineStage } from "./cdk-pipeline-stage";
import variables from '../../bin/load-dotenv';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "cdkPipeline", {
        pipelineName: "cdkPipeline",
        synth: new CodeBuildStep("SynthStep", {
            input: CodePipelineSource.connection(
                "chunsanglai/aws-cdk",
                "main",
                {
                    connectionArn:
                        "arn:aws:codestar-connections:eu-central-1:788527717058:connection/79110d73-a381-41db-9a36-d59e06d05adb"
                }
            ),
            // installCommands: ["npm install -g aws-cdk"],
            commands: ["npm ci", "npm run build", "npx cdk synth"]
        })

    });

    
    const prodaccount = new PipelineStage(this, variables.PROD_AWS_ACCOUNT_STAGE, {
        env: {
          account: variables.PROD_AWS_ACCOUNT_ID,
          region: variables.PROD_AWS_REGION,
        },
        stage: variables.PROD_AWS_ACCOUNT_STAGE,
        stageShort: variables.PROD_AWS_ACCOUNT_STAGE_SHORT,
        vpcCidr: variables.PROD_VPC_CIDR,
      });

		pipeline.addStage(prodaccount);
  }
}
