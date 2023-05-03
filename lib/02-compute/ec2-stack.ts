import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface EC2StackProps extends cdk.StackProps {
    readonly vpc: ec2.IVpc;
}

export class EC2Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EC2StackProps) {
      super(scope, id, props);

        const importedVpc = props.vpc;

        const mySG = new ec2.SecurityGroup(this, "SG", {
            vpc: importedVpc,
            description: "Allow SSH access",
            allowAllOutbound: true,
          });

          mySG.addIngressRule(
            ec2.Peer.ipv4('178.84.133.29/32'),
            ec2.Port.tcp(22),
            'Allow to SSH'
          );

        const instance = new ec2.Instance(this, "Instance", {
            instanceName: 'APOS-Gateway',
            instanceType: new ec2.InstanceType("t2.micro"),
            machineImage: new ec2.WindowsImage(ec2.WindowsVersion.WINDOWS_SERVER_2019_ENGLISH_FULL_BASE),
            vpc: importedVpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC},
            securityGroup: mySG,
        });

    }
}