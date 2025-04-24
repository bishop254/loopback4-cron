import dealersData from '../data/dealers.json';

export interface Dealer {
  dealerCode: string;
  email: string;
  firstAssessmentStart: string;
}

export class SimulatedDealerRepository {
  async findByAssessmentWindow(start: Date, end: Date): Promise<Dealer[]> {
    return (dealersData as Dealer[]).filter(d => {
      const dt = new Date(d.firstAssessmentStart);
      return dt >= start && dt < end;
    });
  }
}
