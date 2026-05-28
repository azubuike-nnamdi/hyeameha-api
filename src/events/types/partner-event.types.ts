export type PartnerEventTicket = {
  id: number;
  name: string;
  quantity: number;
  max_per_ticket: number;
  stop_sales: boolean;
  price: string;
  real_price: string;
  fee: number;
  insurance_fee: string;
};

export type PartnerEvent = {
  id: number;
  name: string;
  category_name: string;
  date_status: string;
  venue_name: string;
  city: string;
  address: string;
  friendly_price: string;
  startdate: string;
  enddate: string;
  banner_photo?: { url: string | null };
  tickets?: PartnerEventTicket[];
};
