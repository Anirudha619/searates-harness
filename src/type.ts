export interface Port {
  id: string;
  name: string;
  unlocode: string;
  countryCode: string;
}

export interface ContainerType {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: string;
  category: string;
  group: string | null;
}

export interface RateCard {
  rateId: string;
  carrier: string | null;
  price: number | null;
  currency: string | null;
  containerType: string | null;
  transitTimeDays: number | null;
}

export interface FetchInput {
  origin: string;
  destination: string;
  dispatchDate: string;
  containerType: string;
}

export interface NormalizedQuery {
  originPort: Port | undefined;
  destinationPort: Port | undefined;
  container: ContainerType | undefined;
  dispatchDate: string;
}

export interface DataSource {
  getRates(query: NormalizedQuery): Promise<RateCard[]>;
}
