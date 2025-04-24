import dealersData from '../data/dealerData.json';

export interface DealerContactInfo {
  areaManagerName: string;
  areaManagerMailId: string;
  zonalPlannerName?: string;
  zonalPlannerMailId?: string;
  regionalManagerName: string;
  regionalManagerMailId: string;
  hoPlannerName?: string;
  hoPlannerMailId?: string;
}

export interface DealerAOInfo {
  areaCommercialManagerName: string;
  areaCommercialManagerMailId: string;
  regionalCommercialManagerName: string;
  regionalCommercialManagerMailId: string;
}

export interface VendorCode {
  id: number;
  code: string;
  dealerName: string;
  dealerSPOC: string;
  dealerCategory: number;
  dealerZone: number;
  dealerLocation: string;
  dealerCountry: string;
  dealerAO: string;
  service: DealerContactInfo;
  sales: DealerContactInfo;
  aps: DealerContactInfo;
  ao: DealerAOInfo;
  userProfileId: number;
  assessmentStartMonth: string;
}

export interface Dealer {
  id: number;
  vendorCodes: VendorCode[];
  email: string;
}

export class SimulatedDealerRepository {
  async findAssessmentsBeforeNow(): Promise<VendorCode[]> {
    const now = new Date();

    return (dealersData as Dealer[])
      .flatMap(dealer =>
        dealer.vendorCodes.map(vc => ({
          ...vc,
          email: dealer.email, // include top-level dealer email if needed
        })),
      )
      .filter(vendor => new Date(vendor.assessmentStartMonth) < now);
  }
}
