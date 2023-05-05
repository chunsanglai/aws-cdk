import { Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import variables from '../../bin/load-dotenv';

interface R53StackProps extends StackProps {
  /**
   * You need to fill the stageShort name in your dotenv file.
   * it's a prerequisite in order to create the subdomain for your DTAP accounts.
   *
   * @default - If not given, it will throw out an error
   */
  readonly stageShort?: string;
  readonly vpc: ec2.IVpc;
}

export class R53Stack extends Stack {
  public readonly subzone: route53.PublicHostedZone;
  constructor(scope: Construct, id: string, props: R53StackProps) {
    super(scope, id, props);
    
    const importedVpc = props.vpc;

    this.subzone = new route53.PublicHostedZone(this, 'subZone', {
      zoneName: `${props?.stageShort}.${variables.CUSTOMER_NAME}`,
    });

    const zone = new route53.PrivateHostedZone(this, 'HostedZone', {
      zoneName: `${props?.stageShort}.${variables.CUSTOMER_NAME}.internal`,
      vpc: importedVpc,    // At least one VPC has to be added to a Private Hosted Zone.
    });
  }
}
