import {inject, Provider} from '@loopback/core';
import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';

export class EmailQueueService {
  private sqs: SQSClient;
  private queueUrl: string;

  constructor(
    @inject('aws.sqs.url') queueUrl: string,
    @inject('aws.sqs.region') region: string,
  ) {
    this.queueUrl = queueUrl;
    this.sqs = new SQSClient({region});
  }

  async enqueueEmail(to: string, dealerCode: string, month: number) {
    const body = {
      to,
      dealerCode,
      assessmentMonth: month,
      template: 'first-assessment-reminder',
    };
    await this.sqs.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(body),
      }),
    );
  }
}