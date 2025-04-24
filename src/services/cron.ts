import {inject} from '@loopback/core';
import {CronJob} from 'cron';
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
      const currentMonth = now.getMonth(); // 0-based (Jan = 0)
      const currentYear = now.getFullYear();

      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 1);

      console.log('Assessment window:', start, 'to', end);

      const repo = new SimulatedDealerRepository();
      const dealers = await repo.findAssessmentsBeforeNow();

      if (dealers.length === 0) {
        console.log('No dealers found for current month window.');
        return;
      }

      for (const dealer of dealers) {
        const assessmentDate = new Date(dealer.assessmentStartMonth);

        const isEarlierMonth =
          assessmentDate.getFullYear() < currentYear ||
          (assessmentDate.getFullYear() === currentYear &&
            assessmentDate.getMonth() < currentMonth);

        if (isEarlierMonth) {
          // If assessment is in an earlier month than current
          console.log(
            `Enqueued reminder for ${dealer.code} - earlier month: ${dealer.assessmentStartMonth}`,
          );
          // await this.emailQueue.enqueueEmail(dealer.email, dealer.code, currentMonth + 1); // +1 for human-readable month
        }
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
