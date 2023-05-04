import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Stack, StackProps } from 'aws-cdk-lib';


export interface VpcStackProps extends StackProps {
  readonly vpcCidr?: string;
}

export class VpcStack extends Stack {
  public readonly vpc: ec2.IVpc;
  public readonly mySecurityGroup: SecurityGroup;
  constructor(scope: Construct, id: string, props?: VpcStackProps) {
    super(scope, id, props);
    
    if (!(props && props.vpcCidr)) {
      throw new Error("Supply a valid VPC Cidr for the account that you're deploying the stack on!");
    }

    this.vpc = new ec2.Vpc(this, 'skeletonVPC', {
      cidr: props.vpcCidr,
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          cidrMask: 20,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 20,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        },
        {
          cidrMask: 20,
          name: 'data',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        }
      ],
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
      }
    });

    this.mySecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      description: 'Allow ssh access to ec2',
      allowAllOutbound: true,
      disableInlineRules: true,
    });
  }
}
