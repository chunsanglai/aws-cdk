// Import required modules from AWS CDK library
import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface EksStackProps extends StackProps {
    readonly vpcCidr?: string;
  }

export class eksStack extends Stack {
    constructor(scope: Construct, id: string, props?: EksStackProps) {
        super(scope, id, props);
        
    }
}