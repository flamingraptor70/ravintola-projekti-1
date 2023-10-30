interface Restaurant {
    _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: number[];
    };
    company: 'Sodexo' | 'Compass Group';
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    companyId: number;
  }

  export type {Restaurant}
