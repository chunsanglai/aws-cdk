import * as cdk from 'aws-cdk-lib';
import { Size } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { EbsDeviceVolumeType } from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
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

        const iamRole = new iam.Role(this, 'EC2-Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            description: 'instance role'
          });

        iamRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

        const userData = ec2.UserData.forWindows();

        userData.addCommands(
          `$progressPreference = 'silentlyContinue'`,
          `Invoke-WebRequest https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/windows_amd64/AmazonSSMAgentSetup.exe -OutFile $env:USERPROFILE\Desktop\SSMAgent_latest.exe`,
          `Start-Process -FilePath $env:USERPROFILE\Desktop\SSMAgent_latest.exe -ArgumentList "/S"`,
          `rm -Force $env:USERPROFILE\Desktop\SSMAgent_latest.exe`,
          `Restart-Service AmazonSSMAgent`
        )

        const instance = new ec2.Instance(this, "Instance", {
            instanceName: 'APOS-Gateway',
            instanceType: new ec2.InstanceType("t2.micro"), //t3x.large
            machineImage: new ec2.WindowsImage(ec2.WindowsVersion.WINDOWS_SERVER_2019_ENGLISH_FULL_BASE),
            blockDevices: [
              {
                deviceName: '/dev/xvda',
                volume: ec2.BlockDeviceVolume.ebs(30, { encrypted: true }),
              }
            ],
            vpc: importedVpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC},
            securityGroup: mySG,
            role: iamRole,
            userData
          });

        const volume = new ec2.Volume(this, "instanceVolume", {
          availabilityZone: 'eu-central-1a',
          size: Size.gibibytes(40),
          encrypted: true,
          volumeType: EbsDeviceVolumeType.GENERAL_PURPOSE_SSD_GP3
        });

        volume.grantAttachVolumeByResourceTag(instance.grantPrincipal, [instance]);
    }
}