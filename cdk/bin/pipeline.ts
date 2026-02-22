import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as cdk from 'aws-cdk-lib/core'
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines'
import { Construct } from 'constructs'
import { CdkStack } from './../lib/cdk-stack'

interface PipelineStackProps extends cdk.StackProps {
  cdkStack: CdkStack
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: PipelineStackProps) {
    super(scope, id, props)

    const connectionArn = ssm.StringParameter.fromStringParameterAttributes(this, 'MyParam', {
      parameterName: 'github-connection-arn',
    }).stringValue

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/aws/codebuild/guide-image-tool',
      retention: logs.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      bucketName: 'metalmental-guide-image-tool-artifact-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1),
        },
      ],
    })

    const synthStep = new CodeBuildStep('Synth', {
      projectName: 'guide-image-tool',
      input: CodePipelineSource.connection('Flupinochan/GuideImageTool', 'master', {
        connectionArn: connectionArn,
      }),
      commands: [
        'set -e',
        'npm ci',
        'npm run build',
        `aws s3 sync dist/ s3://${props?.cdkStack.bucket.bucketName}/ --delete`,
        `aws cloudfront create-invalidation --distribution-id ${props?.cdkStack.distribution.distributionId} --paths "/*"`,
      ],
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.fromDockerRegistry('node:22'),
      },
      logging: {
        cloudWatch: {
          logGroup: logGroup,
        },
      },
      rolePolicyStatements: [
        new iam.PolicyStatement({
          actions: ['s3:*'],
          resources: [
            `${props?.cdkStack.bucket.bucketArn}`,
            `${props?.cdkStack.bucket.bucketArn}/*`,
          ],
        }),
        new iam.PolicyStatement({
          actions: ['cloudfront:CreateInvalidation'],
          resources: [
            `arn:aws:cloudfront::${this.account}:distribution/${props?.cdkStack.distribution.distributionId}`,
          ],
        }),
      ],
    })

    new CodePipeline(this, 'Pipeline', {
      pipelineName: 'guide-image-tool-pipeline',
      crossAccountKeys: false,
      synth: synthStep,
      artifactBucket: artifactBucket,
    })
  }
}
