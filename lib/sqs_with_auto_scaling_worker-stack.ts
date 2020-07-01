import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as sqs from '@aws-cdk/aws-sqs';
import { Duration } from '@aws-cdk/core';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as ec2 from '@aws-cdk/aws-ec2';
import { SubnetType, InstanceType } from '@aws-cdk/aws-ec2';
import * as autoscaling from '@aws-cdk/aws-autoscaling';

export class SqsWithAutoScalingWorkerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // IAM role for EC2 to access to SQS
    const role = new iam.Role(this,"Ec2SqsRole",{
      description: "Allow EC2 Instances to interact with SQS queues",
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSQSFullAccess")],
      roleName: "EC2_SQS_ROLE"
    });


    // Create SQS
    const queue = new sqs.Queue(this, "ToBeProcessedQueue",{
      queueName: "To_Be_Processed_Queue"
    });

    // CloudWatch Alarms
    const metric = queue.metricApproximateNumberOfMessagesVisible({
      period: Duration.minutes(1),
      statistic: "Average"
    });

    const scale_out_init = metric.createAlarm(this,"ScaleOutInit",{
      alarmName: "ScaleOutInit",
      alarmDescription: "First scale out when a message is available",
      threshold: 0,
      evaluationPeriods:1,
      comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
      statistic: "Average",
      treatMissingData: cw.TreatMissingData.NOT_BREACHING
    });

    // VPC
    const vpc = ec2.Vpc.fromLookup(this,"VPC",{
      vpcId: this.node.tryGetContext('vpcId')
    })

    if(vpc == undefined) {
      this.node.addError("Can't find vpcId");
    }

    // Subnet
    //const vpc_subnets = vpc.selectSubnets(ec2.SelectSubnet)
    //vpc.selectSubnets({ec2.SubnetType.PRIVATE})

    // Security Group
    const sg = ec2.SecurityGroup.fromSecurityGroupId(this,"Ec2WorkerSG","sg-1111111");
    if(sg == undefined) {
      this.node.addError("Can't find Security Group Id");
    }

    // EC2 AMI 
    const ami = ec2.MachineImage.genericLinux({
      "ap-northeast-2": "ami-0e1d3f3ca0ff970d1"
    });

    // Auto-Scaling Group 
    const asg = new autoscaling.AutoScalingGroup(this,"ASG",{
      role: role, 
      vpc: vpc,
      instanceType: new ec2.InstanceType("t3.micro"),
      machineImage: ami,
      vpcSubnets: undefined,
      desiredCapacity: 0,
      maxCapacity:2, 
      minCapacity: 0
    })

    


  }
}
