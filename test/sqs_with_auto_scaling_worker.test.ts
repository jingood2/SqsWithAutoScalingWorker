import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SqsWithAutoScalingWorker from '../lib/sqs_with_auto_scaling_worker-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SqsWithAutoScalingWorker.SqsWithAutoScalingWorkerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
