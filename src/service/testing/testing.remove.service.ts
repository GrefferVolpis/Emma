import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from './../config/config.service';
import { TestingDatabaseService } from './testing.database.service';
import { Testing } from './../../entity/Testing';

@Injectable()
export class TestingRemoveService {
  private PROFITS: number = 0;
  private GOOD_DEALS: number = 0;
  private AMOUNT_DEALS: number = 0;
  private THRESHOLD_DEALS: number = 0;
  private THRESHOLD_PROFITS: number = 0;
  /**
   * Constructor TestingRemoveService
   * @param {ConfigService}          @Iniect('ConfigService')          private configService
   * @param {TestingDatabaseService} @Inject('TestingDatabaseService') private testingDatabaseService
   */
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TestingDatabaseService)
    private readonly testingDatabaseService: TestingDatabaseService
  ) {
    this.PROFITS = +this.configService.get('PROFITS');
    this.GOOD_DEALS = +this.configService.get('GOOD_DEALS');
    this.AMOUNT_DEALS = +this.configService.get('AMOUNT_DEALS');
    this.THRESHOLD_DEALS = +this.configService.get('THRESHOLD_DEALS');
    this.THRESHOLD_PROFITS = +this.configService.get('THRESHOLD_PROFITS');
  }
  /**
   * Remove combination by analys
   * @returns {Promise<void>}
   */
  public async removeCombinationByAnalys(): Promise<void> {
    try {
      const testing: Testing[] = await this.testingDatabaseService.getTestings();

      if (Array.isArray(testing) && testing.length > 0) {
        const remove_testing: Testing[] = [];

        for (let i: number = 0; i < testing.length; i++) {
          const profits: number = testing[i].profits / testing[i].good_deals;
          const all_deals: number = testing[i].bad_deals + testing[i].good_deals;
          const good_deals: number = (100 / all_deals) * testing[i].good_deals;

          if (
            profits < this.THRESHOLD_PROFITS ||
            good_deals < this.THRESHOLD_DEALS ||
            testing[i].bad_deals + testing[i].good_deals < this.AMOUNT_DEALS
          ) {
            remove_testing.push(testing[i]);
          }
        }

        await this.testingDatabaseService.deleteTestings(remove_testing);
      } else {
        throw Error('testing is null');
      }
    } catch (err) {
      console.error('removeCombinationByAnalys: ', err.message);
    }
  }
  /**
   * Remove combination by profits
   * @returns {Promise<void>}
   */
  public async removeCombinationByProfits(): Promise<void> {
    try {
      const testing: Testing[] = await this.testingDatabaseService.getTestings();

      if (Array.isArray(testing) && testing.length > 0) {
        const sort_testing: Testing[] = [];
        const good_testing: Testing[] = [];
        const remove_testing: Testing[] = [];

        for (let i: number = 0; i < testing.length; i++) {
          if (
            testing[i].profits < this.PROFITS ||
            testing[i].good_deals < this.GOOD_DEALS
          ) {
            remove_testing.push(testing[i]);
          } else {
            sort_testing.push(testing[i]);
          }
        }

        sort_testing.sort((a: Testing, b: Testing) => {
          if (a.profits < b.profits) {
            return 1;
          } else if (a.profits > b.profits) {
            return -1;
          } else if (
            a.profits === b.profits &&
            a.retention < b.retention
          ) {
            return -1;
          } else if (
            a.profits === b.profits &&
            a.retention > b.retention
          ) {
            return 1;
          } else {
            return 0;
          }
        });

        for (let i: number = 0; i < sort_testing.length; i++) {
          good_testing.push(sort_testing[i]);

          for (let j: number = i + 1; j < sort_testing.length; i++, j++) {
            if (
              sort_testing[i].profits === sort_testing[j].profits &&
              sort_testing[i].bad_deals === sort_testing[j].bad_deals &&
              sort_testing[i].good_deals === sort_testing[j].good_deals
            ) {
              remove_testing.push(testing[j]);

              continue;
            } else {
              break;
            }
          }
        }

        await this.testingDatabaseService.deleteTestings(remove_testing);
      } else {
        throw Error('testing is null');
      }
    } catch (err) {
      console.error('removeCombinationByProfits: ', err.message);
    }
  }
}
