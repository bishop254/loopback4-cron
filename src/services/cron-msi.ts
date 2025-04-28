import {inject} from '@loopback/core';
import {CronJob} from 'cron';
import msiSubmissions from '../data/dealerAuditorSubmissions.json';
import dealersData from '../data/dealerData.json';
import miscalibrationAssessments from '../data/dealerMSICalibrationAssignment.json';
import usersData from '../data/userData.json';

import {User} from '../repositories/simulated-dealer-assessors.repository';
import {MSISubmission} from '../repositories/simulated-dealer-msi-submission.repository';
import {MiscalibrationAssessment} from '../repositories/simulated-dealer-msi.repository';
import {Dealer} from '../repositories/simulated-dealer.repository';
import {EmailQueueService} from '../services/email-queue.service';

export class CalibrationMonthJob extends CronJob {
  constructor(
    @inject('services.EmailQueueService')
    private emailQueue: EmailQueueService,
  ) {
    const runReminderCheck = async () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dealers = dealersData as Dealer[];
      const miscalibrations =
        miscalibrationAssessments as MiscalibrationAssessment[];
      const users = usersData as User[];
      const submissions = msiSubmissions as MSISubmission[];

      for (const assessment of miscalibrations) {
        const auditDate = new Date(assessment.auditStartDate);
        auditDate.setHours(0, 0, 0, 0);

        if (auditDate.getTime() === tomorrow.getTime()) {
          console.log(
            `Audit for vendorCode ${assessment.vendorCode} is scheduled for tomorrow.`,
          );

          const submission = submissions.find(
            s => s.dealerAssessmentAssignmentId === assessment.id,
          );

          const mappedStatus = mapTypeToStatus(submission?.type);

          if (!submission || mappedStatus === 'Pending Submission') {
            console.log(`No valid submission found. Sending reminder.`);

            const dealer = dealers.find(d =>
              d.vendorCodes.some(vc => vc.id === assessment.vendorId),
            );
            const dealerEmail = dealer?.email ?? '';

            const assessorEmails = assessment.assessors
              .map(assessorId => {
                const user = users.find(u => u.id === assessorId);
                return user?.email ?? '';
              })
              .filter(email => email !== '');

            if (dealerEmail) {
              console.log(`Sending reminder to Dealer: ${dealerEmail}`);
              // await this.emailQueue.sendMiscalibrationReminder(dealerEmail, assessment.vendorCode, auditDate);
            }

            for (const assessorEmail of assessorEmails) {
              if (assessorEmail) {
                console.log(`Sending reminder to Assessor: ${assessorEmail}`);
                // await this.emailQueue.sendMiscalibrationReminder(assessorEmail, assessment.vendorCode, auditDate);
              }
            }
          } else {
            console.log(
              `Audit already submitted with status: ${mappedStatus}. No reminder needed.`,
            );
          }
        }
      }
    };

    super({
      cronTime: '0 0 0 * * *', // Every day at midnight
      onTick: runReminderCheck,
      start: false,
    });

    this.start();
  }
}

function mapTypeToStatus(type?: number): string {
  const typeMapping = new Map<number, string>([
    [0, 'Pending Submission'],
    [1, 'Under Review'],
    [2, 'Under Approval'],
    [3, 'Approved'],
  ]);
  if (type === undefined || type === null) {
    return 'Pending Submission';
  }
  return typeMapping.get(type) ?? 'Pending Submission';
}
