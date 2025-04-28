import dealerAssessments from '../data/dealerAssessmentSubmission.json';

export interface DealerAssessment {
  id: number;
  reporting_period: string[];
  type: number;
  userProfileId: number;
  dealerId: number;
  vendorId: number;
}

export class SimulatedDealerRepository {
  async findAssessmentsBeforeNow(): Promise<DealerAssessment[]> {
    const now = new Date();

    return (dealerAssessments as DealerAssessment[]).filter(assessment =>
      assessment.reporting_period.some(period => {
        const [month, year] = period.split('-').map(Number);
        const periodDate = new Date(year, month - 1);
        return periodDate < now;
      }),
    );
  }
}
