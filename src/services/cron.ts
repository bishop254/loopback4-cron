import {CronJob} from 'cron';
import {inject} from '@loopback/core';
import {SimulatedDealerRepository} from '../repositories/simulated-dealer.repository';
import {EmailQueueService} from '../services/email-queue.service';

/**
 * Cron job that runs at midnight on the 24th of each month,
 * and also fires immediately if the server starts on the 24th.
 */
export class FirstOfMonthJob extends CronJob {
  constructor(
    @inject('services.EmailQueueService')
    private emailQueue: EmailQueueService,
  ) {
    const handler = async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      console.log(start);
      console.log(end);

      const repo = new SimulatedDealerRepository();
      const dealers = await repo.findByAssessmentWindow(start, end);

      if (dealers.length === 0) {
        console.log('No dealers to notify this month.');
        return;
      }

      for (const d of dealers) {
        // await emailQueue.enqueueEmail(d.email, d.dealerCode, month);
        console.log(`Enqueued reminder for ${d.dealerCode} <${d.email}>`);
      }
    };

    super({
      cronTime: '0 0 0 24 * *',
      onTick: handler,
      start: false,
    });

    if (new Date().getDate() === 24) {
      console.log('Running job immediately because today is the 24th.');

      handler();
    }

    this.start();
  }
}
