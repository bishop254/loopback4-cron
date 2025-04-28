import {inject} from '@loopback/core';
import {CronJob} from 'cron';
import dealerAssessments from '../data/dealerAssessmentSubmission.json';
import dealersData from '../data/dealerData.json';
import {DealerAssessment} from '../repositories/simulated-dealer-assesment.repository';
import {Dealer} from '../repositories/simulated-dealer.repository';
import {EmailQueueService} from '../services/email-queue.service';

export class MonthJob extends CronJob {
  constructor(
    @inject('services.EmailQueueService')
    private emailQueue: EmailQueueService,
  ) {
    const runReminderCheck = async () => {
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
      const currentYear = now.getFullYear();
      const currentPeriod = `${currentMonth}-${currentYear}`;

      console.log('Current Reporting Period:', currentPeriod);

      const submittedVendorIds = new Set<number>();
      (dealerAssessments as DealerAssessment[]).forEach(assessment => {
        if (assessment.reporting_period.includes(currentPeriod)) {
          submittedVendorIds.add(assessment.vendorId);
        }
      });

      console.log(
        'Vendors who have submitted:',
        Array.from(submittedVendorIds),
      );

      const dealers = dealersData as Dealer[];

      const notSubmittedVendors: {
        dealerEmail: string;
        vendorCode: string;
        vendorId: number;
      }[] = [];

      for (const dealer of dealers) {
        for (const vendorCode of dealer.vendorCodes) {
          const vendorId = vendorCode.id;

          if (!submittedVendorIds.has(vendorId)) {
            notSubmittedVendors.push({
              dealerEmail: dealer.email,
              vendorCode: vendorCode.code,
              vendorId: vendorId,
            });

            if (currentDay === 1 || currentDay === 15) {
              console.log(
                `Vendor ${vendorCode.code} (${vendorId}) has NOT submitted. Sending reminder to ${dealer.email}`,
              );
              // Send the email individually on 1st and 15th
              // await this.emailQueue.enqueueEmail(dealer.email, vendorCode.code, currentPeriod);
            }
          } else {
            console.log(
              `Vendor ${vendorCode.code} (${vendorId}) already submitted. No email sent.`,
            );
          }
        }
      }

      if (currentDay === 28) {
        if (notSubmittedVendors.length > 0) {
          const summary = notSubmittedVendors
            .map(
              v =>
                `VendorCode: ${v.vendorCode} (VendorId: ${v.vendorId}) - Dealer Email: ${v.dealerEmail}`,
            )
            .join('\n');

          console.log('Sending full non-submission report to eye@gmail.com');
          console.log(summary);

          // Example: Send the full list as an email to eye@gmail.com
          // await this.emailQueue.sendSummaryReport('eye@gmail.com', summary);
        } else {
          console.log('All vendors have submitted. No summary email needed.');
        }
      }
    };

    super({
      cronTime: '0 0 0 1,15,25 * *',
      onTick: runReminderCheck,
      start: false,
    });

    const today = new Date().getDate();
    if (today === 1 || today === 15 || today === 25) {
      console.log(
        'Running job immediately because today matches 1, 15, or 25.',
      );
      runReminderCheck();
    }

    this.start();
  }
}
