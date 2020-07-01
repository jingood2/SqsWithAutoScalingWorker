#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SqsWithAutoScalingWorkerStack } from '../lib/sqs_with_auto_scaling_worker-stack';

const app = new cdk.App();
new SqsWithAutoScalingWorkerStack(app, 'SqsWithAutoScalingWorkerStack');

app.synth()