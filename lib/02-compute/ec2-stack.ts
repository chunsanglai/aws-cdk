// Import required modules from AWS CDK library
import * as cdk from 'aws-cdk-lib';
import { CfnOutput, Size } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { EbsDeviceVolumeType } from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// Define an interface for the properties of the EC2Stack class
interface EC2StackProps extends cdk.StackProps {
    readonly vpc: ec2.IVpc;
    readonly instanceName: string;
    readonly sizeInGb: number;
    readonly instanceType: string;
}

// EC2Stack class extends the AWS CDK Stack class
export class EC2Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EC2StackProps) {
      super(scope, id, props);

        // Import the VPC passed as a prop
        const importedVpc = props.vpc;

        // Create a security group for the EC2 instance
        const mySG = new ec2.SecurityGroup(this, "SG", {
            vpc: importedVpc,
            description: "Allow SSH access", // uncomment line 29 - 33 to add into this security group
            allowAllOutbound: true,
          });
          // Add ingress rules on the security group that has been created
          // mySG.addIngressRule(
          //   ec2.Peer.ipv4('178.84.133.29/32'),
          //   ec2.Port.tcp(22),
          //   'Allow to SSH'
          // );

        // Create an IAM role for the EC2 instance  
        const iamRole = new iam.Role(this, 'EC2-Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            description: 'instance role'
          });

        // Attach the AmazonSSMManagedInstanceCore policy to the IAM role
        iamRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        
        // Create Windows user data for the EC2 instance
        const userData = ec2.UserData.forWindows();

        // Add commands to the user data for configuring the SSM agent
        userData.addCommands(
          `$progressPreference = 'silentlyContinue'`,
          `Invoke-WebRequest https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/windows_amd64/AmazonSSMAgentSetup.exe -OutFile $env:USERPROFILE\Desktop\SSMAgent_latest.exe`,
          `Start-Process -FilePath $env:USERPROFILE\Desktop\SSMAgent_latest.exe -ArgumentList "/S"`,
          `rm -Force $env:USERPROFILE\Desktop\SSMAgent_latest.exe`,
          `Restart-Service AmazonSSMAgent`
        )

        // Create an EC2 instance with the specified configuration
        const instance = new ec2.Instance(this, "Instance", {
            instanceName: props.instanceName,
            instanceType: new ec2.InstanceType(props.instanceType), //t3x.large
            machineImage: new ec2.WindowsImage(ec2.WindowsVersion.WINDOWS_SERVER_2019_ENGLISH_FULL_BASE),
            blockDevices: [
              {
                deviceName: '/dev/xvda',
                volume: ec2.BlockDeviceVolume.ebs(props.sizeInGb, { encrypted: true }),
              }
            ],
            vpc: importedVpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS},
            securityGroup: mySG,
            role: iamRole,
            userData,
            
          });

          const instancePrivateDnsName = new CfnOutput(this, 'instancePrivateDnsName', {
            value: `${instance.instancePrivateDnsName}`,
            description: "Private DNS name"
          });

          const instanceId = new CfnOutput(this, 'instanceId', {
            value: `${instance.instanceId}`,
            description: "The instance's ID"
          });
          
    }
}