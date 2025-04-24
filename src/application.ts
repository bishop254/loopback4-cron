import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {asCronJob, CronComponent} from '@loopback/cron';

import {EmailQueueService} from './services/email-queue.service';
import {FirstOfMonthJob} from './services/cron';

export {ApplicationConfig};

export class Loopback4CronApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.component(CronComponent);
    this.bind('cron.jobs.firstOfMonth')
      .toClass(FirstOfMonthJob)
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
