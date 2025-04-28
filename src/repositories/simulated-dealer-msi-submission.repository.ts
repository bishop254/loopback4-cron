import msiSubmissions from '../data/dealerAuditorSubmissions.json';

export interface MSISubmission {
  id: number;
  modified_on: string;
  status: string;
  type: number;
  dealerAssessmentAssignmentId: number;
  dealerId: number;
  vendorId: number;
}

export class SimulatedMSISubmissionRepository {
  private readonly typeMapping = new Map<number, string>([
    [0, 'Pending Submission'],
    [1, 'Under Review'],
    [2, 'Under Approval'],
    [3, 'Approved'],
  ]);

  mapTypeToStatus(type: number | undefined): string {
    if (type === undefined || type === null) {
      return 'Pending Submission';
    }
    return this.typeMapping.get(type) ?? 'Pending Submission';
  }

  async findApprovedSubmissionsBeforeNow(): Promise<
    (MSISubmission & {mappedTypeStatus: string})[]
  > {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return (msiSubmissions as MSISubmission[])
      .filter(submission => {
        const modifiedDate = new Date(submission.modified_on);
        modifiedDate.setHours(0, 0, 0, 0);
        return submission.status === 'Approved' && modifiedDate < now;
      })
      .map(submission => ({
        ...submission,
        mappedTypeStatus: this.mapTypeToStatus(submission.type),
      }));
  }

  async findAllSubmissions(): Promise<
    (MSISubmission & {mappedTypeStatus: string})[]
  > {
    return (msiSubmissions as MSISubmission[]).map(submission => ({
      ...submission,
      mappedTypeStatus: this.mapTypeToStatus(submission.type),
    }));
  }
}
