import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';
import variables from '../../bin/load-dotenv';

interface R53StackProps extends StackProps {
  /**
   * You need to fill the stageShort name in your dotenv file.
   * it's a prerequisite in order to create the subdomain for your DTAP accounts.
   *
   * @default - If not given, it will throw out an error
   */
  readonly stageShort?: string;
  readonly vpcStack: VpcStack;
}

export class R53Stack extends Stack {
  public readonly subzone: route53.PublicHostedZone;
  constructor(scope: Construct, id: string, props: R53StackProps) {
    super(scope, id, props);

    const vpc = props.vpcStack.vpc;

    this.subzone = new route53.PublicHostedZone(this, 'subZone', {
      zoneName: `${props?.stageShort}.${variables.CUSTOMER_NAME}`,
    });

    const zone = new route53.PrivateHostedZone(this, 'HostedZone', {
      zoneName: `${props?.stageShort}.${variables.CUSTOMER_NAME}.internal`,
      vpc,    // At least one VPC has to be added to a Private Hosted Zone.
    });

    new CfnOutput(this, 'HostedZoneId', {
      value: zone.hostedZoneId,
      description: 'Hosted Zone ID',
      exportName: 'HostedZoneId',
    });

  }
}
