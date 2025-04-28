import {SQSClient, SendMessageCommand} from '@aws-sdk/client-sqs';
import {inject} from '@loopback/core';

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

  async sendSummaryReport(to: string, summaryContent: string) {
    const body = {
      to,
      summary: summaryContent,
      template: 'non-submission-summary-report',
    };
    await this.sqs.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(body),
      }),
    );
  }

  async sendMiscalibrationReminder(
    to: string,
    vendorCode: string,
    auditDate: Date,
  ) {
    const body = {
      to,
      vendorCode,
      auditDate: auditDate.toISOString(),
      template: 'miscalibration-reminder',
    };
    await this.sqs.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(body),
      }),
    );
  }
}
