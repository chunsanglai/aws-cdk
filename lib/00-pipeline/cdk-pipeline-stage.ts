import { Fn, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from 'constructs';
import { VpcStack } from '../01-skeleton/vpc-stack';
import { R53Stack } from '../01-skeleton/r53-stack';
import stackName from "../../bin/name-stacks";
import { EC2Stack } from "../02-compute";

export interface CdkPipelineStageProps extends StageProps {
	readonly stageShort?: string;
  	readonly stage?: string;
	readonly vpcCidr?: string;
  }
  

export class PipelineStage extends Stage {
	constructor(scope: Construct, id: string, props?: CdkPipelineStageProps) {
		super(scope, id, props);

		const privateHostedZoneId = Fn.importValue('PrivateHostedZoneID');
		const privateHostedZoneName = Fn.importValue('PrivateHostedZoneName');

		if (!(props && props.vpcCidr)) {
			throw new Error("Supply a valid VPC Cidr for the account that you're deploying the stack on!");
		  }

		/**  Here you can add your stacks which you want to deploy on the target accounts
		The order of the stacks is important e.g. start with skeleton stacks since
		these have the longest lifecycle */
		const vpcStack = new VpcStack(this, stackName('vpc'), {
			vpcCidr: props.vpcCidr
		  });

		const r53Stack = new R53Stack(this, stackName('r53'), {
			stageShort: props.stageShort,
			vpcStack: vpcStack
		  });
		
		new EC2Stack(this, stackName('ec2'), {
			vpc: vpcStack.vpc,
			instanceName: 'APOS-Gateway',
			sizeInGb: 40,
			instanceType: "t2.micro",
			privateHostedZoneId, // Pass the imported private hosted zone ID
  			privateHostedZoneName, // Pass the imported private hosted zone name
		});
	  
	}
}