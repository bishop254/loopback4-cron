import miscalibrationAssessments from '../data/dealerMSICalibrationAssignment.json';

export interface MiscalibrationAssessment {
  id: number;
  assessors: number[];
  auditStartDate: string;
  created_on: string;
  vendorCode: string;
  dealerId: number;
  vendorId: number;
}

export class SimulatedDealerMSIRepository {
  async findAssessmentsBeforeNow(): Promise<MiscalibrationAssessment[]> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return (miscalibrationAssessments as MiscalibrationAssessment[]).filter(
      assessment => {
        const auditDate = new Date(assessment.auditStartDate);
        auditDate.setHours(0, 0, 0, 0);
        return auditDate < now;
      },
    );
  }
}
