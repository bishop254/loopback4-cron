import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {asCronJob, CronComponent} from '@loopback/cron';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';

import {MonthJob} from './services/cron';
import {CalibrationMonthJob} from './services/cron-msi';
import {EmailQueueService} from './services/email-queue.service';

export {ApplicationConfig};

export class Loopback4CronApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.component(CronComponent);
    this.bind('cron.jobs.firstOfMonth').toClass(MonthJob).apply(asCronJob);
    this.bind('cron.jobs.calibrationMonth')
      .toClass(CalibrationMonthJob)
      .apply(asCronJob);

    this.bind('aws.sqs.url').to(
      process.env.DEALER_EMAIL_QUEUE_URL ?? 'EMAIL_QUEUE_URL',
    );
    this.bind('aws.sqs.region').to(process.env.AWS_REGION ?? 'us-east-1');
    this.service(EmailQueueService);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
