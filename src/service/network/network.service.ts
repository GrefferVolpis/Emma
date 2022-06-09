import { Injectable, Inject } from '@nestjs/common';
import { TestingLogicService } from './../testing/testing.logic.service';

@Injectable()
export class NetworkService {
  /**
   * Constructor NetworkService
   * @param {TestingLogicService}     @Inject('TestingLogicService')     private testingLogicService
   */
  constructor(
    @Inject(TestingLogicService)
    private readonly testingLogicService: TestingLogicService,
  ) {
    this.testing();
  }
  /**
   * Testing
   * @returns {Promise<void>}
   */
  private async testing(): Promise<void> {
    try {
      await this.testingLogicService.testing();
    } catch (err) {
      console.error('testing: ', err.message);
    }
  }
}
