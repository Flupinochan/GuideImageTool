#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core'
import { CdkStack } from '../lib/cdk-stack'
import { PipelineStack } from '../lib/pipeline'

const app = new cdk.App()
const cdkStack = new CdkStack(app, 'CdkStack', {})
new PipelineStack(app, 'PipelineStack', { cdkStack })
