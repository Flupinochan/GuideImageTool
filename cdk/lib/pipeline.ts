import * as cdk from 'aws-cdk-lib'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline'
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'
import { CdkStack } from './cdk-stack'

interface PipelineStackProps extends cdk.StackProps {
  cdkStack: CdkStack
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props)

    const connectionArn = ssm.StringParameter.fromStringParameterAttributes(this, 'MyParam', {
      parameterName: 'github-connection-arn',
    }).stringValue

    const codeBuildLogGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/aws/codebuild/guide-image-tool-build-project',
      retention: logs.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      bucketName: 'metalmental-guide-image-tool-artifact-bucket2',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1),
        },
      ],
    })

    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      projectName: 'guide-image-tool-build-project',
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      logging: {
        cloudWatch: {
          logGroup: codeBuildLogGroup,
        },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '22',
            },
            commands: ['node -v', 'npm ci'],
          },
          build: {
            commands: ['npm run build'],
          },
          post_build: {
            commands: [
              `aws s3 sync dist/ s3://${props.cdkStack.bucket.bucketName}/ --delete`,
              `aws cloudfront create-invalidation --distribution-id ${props.cdkStack.distribution.distributionId} --paths "/*"`,
            ],
          },
        },
      }),
    })

    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:*'],
        resources: [props.cdkStack.bucket.bucketArn, `${props.cdkStack.bucket.bucketArn}/*`],
      }),
    )

    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${props.cdkStack.distribution.distributionId}`,
        ],
      }),
    )

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'guide-image-tool-pipeline2',
      artifactBucket: artifactBucket,
      crossAccountKeys: false,
    })

    const sourceOutput = new codepipeline.Artifact('SourceOutput')
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.CodeStarConnectionsSourceAction({
          actionName: 'GitHub_Source',
          connectionArn: connectionArn,
          owner: 'Flupinochan',
          repo: 'GuideImageTool',
          branch: 'master',
          output: sourceOutput,
        }),
      ],
    })

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build_And_Deploy',
          project: buildProject,
          input: sourceOutput,
          outputs: [new codepipeline.Artifact('BuildOutput')],
        }),
      ],
    })
  }
}
