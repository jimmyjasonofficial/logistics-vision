
import { config } from 'dotenv';
import { db, auth, initializationError } from './firebase-admin';

// Load environment variables from .env.local
config({ path: '.env' });

const mockEmployees = [
    { id: 'DRV-001', name: 'John Doe', role: 'Senior Driver' as const, leaveAllowance: 25, baseSalary: 6500 },
    { id: 'DRV-002', name: 'Jane Smith', role: 'Driver' as const, leaveAllowance: 20, baseSalary: 6000 },
    { id: 'DRV-003', name: 'Mike Johnson', role: 'Driver' as const, leaveAllowance: 20, baseSalary: 6000 },
    { id: 'DRV-004', name: 'Sarah Williams', role: 'Dispatcher' as const, leaveAllowance: 22, baseSalary: 7200 },
    { id: 'DRV-005', name: 'Robert Brown', role: 'Mechanic' as const, leaveAllowance: 18, baseSalary: 8000 },
    { id: 'DRV-006', name: 'Emily Davis', role: 'Driver' as const, leaveAllowance: 20, baseSalary: 5800 },
    { id: 'DRV-007', name: 'David Wilson', role: 'Accountant' as const, leaveAllowance: 25, baseSalary: 8500 },
    { id: 'DRV-008', name: 'Linda Martinez', role: 'HR Manager' as const, leaveAllowance: 30, baseSalary: 9000 },
];

const mockLeaveRequests = [
    { employee: 'John Doe', employeeId: 'DRV-001', startDate: '2024-08-10', endDate: '2024-08-12', reason: 'Personal', status: 'Approved' as const },
    { employee: 'Jane Smith', employeeId: 'DRV-002', startDate: '2024-08-15', endDate: '2024-08-15', reason: 'Sick Leave', status: 'Approved' as const },
    { employee: 'Mike Johnson', employeeId: 'DRV-003', startDate: '2024-09-01', endDate: '2024-09-05', reason: 'Vacation', status: 'Pending' as const },
    { employee: 'Sarah Williams', employeeId: 'DRV-004', startDate: '2024-07-29', endDate: '2024-07-29', reason: 'Family Emergency', status: 'Approved' as const },
    { employee: 'Robert Brown', employeeId: 'DRV-005', startDate: '2024-08-20', endDate: '2024-08-22', reason: 'Vacation', status: 'Rejected' as const },
    { employee: 'Emily Davis', employeeId: 'DRV-006', startDate: '2024-09-10', endDate: '2024-09-12', reason: 'Personal', status: 'Pending' as const },
    { employee: 'John Doe', employeeId: 'DRV-001', startDate: '2024-03-01', endDate: '2024-03-05', reason: 'Vacation', status: 'Approved' as const },
];

const augustEmployees = [
    { employeeId: 'DRV-001', name: 'John Doe', basePay: 2500, overtime: 250, bonus: 0, taxes: 550, deductions: 50 },
    { employeeId: 'DRV-002', name: 'Jane Smith', basePay: 2400, overtime: 100, bonus: 150, taxes: 520, deductions: 50 },
    { employeeId: 'DRV-003', name: 'Mike Johnson', basePay: 2600, overtime: 0, bonus: 0, taxes: 580, deductions: 50 },
    { employeeId: 'DRV-004', name: 'Sarah Williams', basePay: 2800, overtime: 0, bonus: 200, taxes: 610, deductions: 50 },
];

const julyEmployees = [
    ...augustEmployees,
    { employeeId: 'DRV-005', name: 'Robert Brown', basePay: 3000, overtime: 50, bonus: 0, taxes: 650, deductions: 60 },
];

const juneEmployees = [
    ...julyEmployees,
     { employeeId: 'DRV-006', name: 'Emily Davis', basePay: 2300, overtime: 300, bonus: 0, taxes: 500, deductions: 50 },
];

const mayEmployees = [
    ...juneEmployees,
     { employeeId: 'DRV-007', name: 'David Wilson', basePay: 3200, overtime: 0, bonus: 500, taxes: 700, deductions: 70 },
];

const mockPayrollRuns = [
    { id: 'PR-2024-08', payPeriodStart: '2024-08-01', payPeriodEnd: '2024-08-15', paymentDate: '2024-08-20', status: 'Approved' as const, employees: augustEmployees },
    { id: 'PR-2024-07', payPeriodStart: '2024-07-15', payPeriodEnd: '2024-07-31', status: 'Paid' as const, paymentDate: '2024-08-01', employees: julyEmployees },
    { id: 'PR-2024-06', payPeriodStart: '2024-06-15', payPeriodEnd: '2024-06-30', status: 'Paid' as const, paymentDate: '2024-07-01', employees: juneEmployees },
    { id: 'PR-2024-05', payPeriodStart: '2024-05-15', payPeriodEnd: '2024-05-31', status: 'Paid' as const, paymentDate: '2024-06-01', employees: mayEmployees },
    { id: 'PR-2024-04', payPeriodStart: '2024-04-15', payPeriodEnd: '2024-04-30', status: 'Paid' as const, paymentDate: '2024-05-01', employees: mayEmployees },
];

const mockExpenses = [
    { id: 'EXP-001', category: 'Fuel' as const, amount: 450.75, date: '2024-07-28', description: 'Pilot Travel Center', paidBy: 'Card' as const, tripId: 'TRIP-001', hasAttachment: true, notes: 'Filled up truck VOL-501.' },
    { id: 'EXP-002', category: 'Maintenance' as const, amount: 1200.00, date: '2024-07-27', description: 'Fleet Maintenance Pros', paidBy: 'EFT' as const, tripId: null, hasAttachment: true, notes: "Annual service." },
    { id: 'EXP-003', category: 'Tolls' as const, amount: 85.50, date: '2024-07-29', description: 'State Highway Authority', paidBy: 'Card' as const, tripId: 'TRIP-001', hasAttachment: false, notes: "" },
    { id: 'EXP-004', category: 'Food & Lodging' as const, amount: 150.25, date: '2024-07-28', description: 'Diner\'s Choice', paidBy: 'Cash' as const, tripId: 'TRIP-002', hasAttachment: true, notes: 'Overnight stay allowance.' },
    { id: 'EXP-005', category: 'Fuel' as const, amount: 512.30, date: '2024-07-30', description: 'Flying J', paidBy: 'Card' as const, tripId: 'TRIP-004', hasAttachment: true, notes: "" },
    { id: 'EXP-006', category: 'Salaries' as const, amount: 25000, date: '2024-07-31', description: 'Company Payroll', paidBy: 'EFT' as const, tripId: null, hasAttachment: false, notes: "July salaries" },
    { id: 'EXP-007', category: 'Salaries' as const, amount: 24500, date: '2024-06-30', description: 'Company Payroll', paidBy: 'EFT' as const, tripId: null, hasAttachment: false, notes: "June salaries" },
];

const mockInvoices = [
    { 
        id: 'INV-001', 
        customer: 'Global Logistics Inc.', 
        customerId: 'CUST-001',
        tripId: 'TRIP-001', 
        dateIssued: '2024-07-15', 
        dueDate: '2024-08-15', 
        status: 'Paid' as const,
        reference: 'TRIP-001',
        taxType: 'exclusive' as const,
        lineItems: [
            { item: 'FRGHT-01', description: 'Freight charges for cross-country shipping', quantity: 1, unitPrice: 12000, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 12000,
        totalTax: 1800,
        total: 13800
    },
    { 
        id: 'INV-002', 
        customer: 'QuickHaul Shippers', 
        customerId: 'CUST-002',
        tripId: 'TRIP-002', 
        dateIssued: '2024-07-20', 
        dueDate: '2024-08-20', 
        status: 'Unpaid' as const,
        reference: 'TRIP-002',
        taxType: 'exclusive' as const,
        lineItems: [
            { item: 'CAS-LOAD', description: 'Casual loading services', quantity: 1, unitPrice: 2260.87, discount: 0, account: '477 - Wages and Salaries', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 2260.87,
        totalTax: 339.13,
        total: 2600
    },
    { 
        id: 'INV-003', 
        customer: 'FarmFresh Produce', 
        customerId: 'CUST-004',
        tripId: 'TRIP-004', 
        dateIssued: '2024-06-25', 
        dueDate: '2024-07-25', 
        status: 'Overdue' as const,
        reference: 'TRIP-004',
        taxType: 'exclusive' as const,
        lineItems: [
             { item: 'PROD-TRP', description: 'Produce transport, chilled', quantity: 1, unitPrice: 4891.30, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 4891.30,
        totalTax: 733.70,
        total: 5625
    },
     { 
        id: 'INV-004', 
        customer: 'SteelWorks Corp', 
        customerId: 'CUST-005',
        tripId: 'TRIP-005', 
        dateIssued: '2024-07-01', 
        dueDate: '2024-08-01', 
        status: 'Paid' as const,
        reference: 'TRIP-005',
        taxType: 'exclusive' as const,
        lineItems: [
             { item: 'STL-BEAM', description: 'Short haul steel beams', quantity: 1, unitPrice: 1114.78, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 1114.78,
        totalTax: 167.22,
        total: 1282
    },
    { 
        id: 'INV-005', 
        customer: 'Coast-to-Coast Movers', 
        customerId: 'CUST-003',
        tripId: 'TRIP-003', 
        dateIssued: '2024-08-01', 
        dueDate: '2024-09-01', 
        status: 'Draft' as const,
        reference: 'TRIP-003',
        taxType: 'exclusive' as const,
         lineItems: [
             { item: 'MOV-CC', description: 'Cross-country moving service', quantity: 1, unitPrice: 14217.39, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 14217.39,
        totalTax: 2132.61,
        total: 16350
    },
    { 
        id: 'INV-006', 
        customer: 'Global Logistics Inc.', 
        customerId: 'CUST-001',
        tripId: 'TRIP-006', 
        dateIssued: '2024-07-25', 
        dueDate: '2024-08-25', 
        status: 'Unpaid' as const,
        reference: 'TRIP-006',
        taxType: 'exclusive' as const,
        lineItems: [
            { item: 'FRGHT-02', description: 'Freight charges for regional shipping', quantity: 1, unitPrice: 3510, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 3510,
        totalTax: 526.50,
        total: 4036.50
    },
];

const mockQuotes = [
    { 
        id: 'QTE-001', 
        customer: 'Global Logistics Inc.', 
        customerId: 'CUST-001',
        dateIssued: '2024-07-20', 
        expiryDate: '2024-08-20', 
        status: 'Sent' as const,
        reference: '',
        taxType: 'exclusive' as const,
        lineItems: [
            { item: 'FRGHT-01', description: 'Freight charges for local delivery', quantity: 1, unitPrice: 3826.09, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 3826.09,
        totalTax: 573.91,
        total: 4400
    },
    { 
        id: 'QTE-002', 
        customer: 'New Prospects LLC', 
        customerId: 'CUST-002',
        dateIssued: '2024-07-22', 
        expiryDate: '2024-08-22', 
        status: 'Draft' as const,
        reference: '',
        taxType: 'exclusive' as const,
        lineItems: [
            { item: 'CONSULT', description: 'Logistics consultation services', quantity: 1, unitPrice: 8000, discount: 0, account: '200 - Sales', taxRate: 'Exempt' },
        ],
        subtotal: 8000,
        totalTax: 0,
        total: 8000 
    },
    { 
        id: 'QTE-003', 
        customer: 'Coast-to-Coast Movers', 
        customerId: 'CUST-003',
        dateIssued: '2024-07-15', 
        expiryDate: '2024-08-15', 
        status: 'Accepted' as const,
        reference: '',
        taxType: 'exclusive' as const,
        lineItems: [
            { item: 'FRGHT-SM', description: 'Small item freight', quantity: 1, unitPrice: 1304.35, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 1304.35,
        totalTax: 195.65,
        total: 1500
    },
    { 
        id: 'QTE-004', 
        customer: 'QuickHaul Shippers', 
        customerId: 'CUST-002',
        dateIssued: '2024-06-25', 
        expiryDate: '2024-07-25', 
        status: 'Expired' as const,
        reference: '',
        taxType: 'exclusive' as const,
        lineItems: [
            { item: 'SHORT-HAUL', description: 'Short-haul delivery', quantity: 1, unitPrice: 2000, discount: 0, account: '200 - Sales', taxRate: 'Tax on Sales (15%)' },
        ],
        subtotal: 2000,
        totalTax: 300,
        total: 2300 
    },
];

const defaultSettings = {
    id: 'global',
    taxRates: [
        { name: 'Tax on Sales (15%)', rate: 15.00 },
        { name: 'Exempt', rate: 0.00 },
    ],
    companyName: 'Logistics Vision Inc.',
    companyAddress: '123 Logistics Lane, Suite 100\nTransport City, TX 75001',
    currency: 'usd',
    taxId: '',
    defaultPaymentTerms: 30,
    invoiceFooter: 'Thank you for your business! Please contact us with any questions.',
};

const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@globallogistics.com',
    company: 'Global Logistics Inc.',
    status: 'Active',
    phone: '555-0101',
    address: '123 Global Way, Los Angeles, CA 90001',
  },
  {
    id: 'CUST-002',
    name: 'Jane Smith',
    email: 'jane.s@quickhaul.com',
    company: 'QuickHaul Shippers',
    status: 'Active',
    phone: '555-0102',
    address: '456 Haul Rd, Chicago, IL 60601',
  },
  {
    id: 'CUST-003',
    name: 'Mike Johnson',
    email: 'mike.j@coasttocoast.com',
    company: 'Coast-to-Coast Movers',
    status: 'Inactive',
    phone: '555-0103',
    address: '789 Mover Ln, Miami, FL 33101',
  },
  {
    id: 'CUST-004',
    name: 'Sarah Williams',
    email: 'sarah@farmfresh.com',
    company: 'FarmFresh Produce',
    status: 'Active',
    phone: '555-0104',
    address: '101 Produce Ave, Fresno, CA 93701',
  },
  {
    id: 'CUST-005',
    name: 'Robert Brown',
    email: 'robert.b@steelworks.com',
    company: 'SteelWorks Corp',
    status: 'Active',
    phone: '555-0105',
    address: '210 Steel St, Pittsburgh, PA 15201',
  },
];

const mockVehicles = [
  { id: 'VEH-101', model: 'Freightliner Cascadia', year: 2022, licensePlate: 'TRK-101', vin: '1A2B3C4D5E6F7G8H9', status: 'Operational', maintenanceDue: '2024-09-15', driverId: 'DRV-001', driverName: 'John Doe' },
  { id: 'VEH-203', model: 'Volvo VNL 860', year: 2021, licensePlate: 'TRK-203', vin: '2B3C4D5E6F7G8H9A1', status: 'In Repair', maintenanceDue: '2024-08-01', driverId: 'DRV-002', driverName: 'Jane Smith' },
  { id: 'VEH-305', model: 'Kenworth T680', year: 2023, licensePlate: 'TRK-305', vin: '3C4D5E6F7G8H9A1B2', status: 'Operational', maintenanceDue: '2025-01-20', driverId: 'DRV-003', driverName: 'Mike Johnson' },
  { id: 'VEH-410', model: 'Peterbilt 579', year: 2020, licensePlate: 'TRK-410', vin: '4D5E6F7G8H9A1B2C3', status: 'Awaiting Inspection', maintenanceDue: '2024-07-30', driverId: 'DRV-006', driverName: 'Emily Davis' },
];

const mockTrips = [
    { id: 'TRIP-001', customer: 'Global Logistics Inc.', customerId: 'CUST-001', origin: 'Los Angeles, CA', destination: 'New York, NY', driver: 'John Doe', driverId: 'DRV-001', status: 'In Transit' as const, pickupTime: '2024-07-28T10:00:00Z', estimatedDelivery: '2024-08-02T18:00:00Z', vehicleId: 'VEH-101', distance: 4500, revenue: 106920, notes: "Urgent delivery for retail client.", truck: 'VOL-501' },
    { id: 'TRIP-002', customer: 'QuickHaul Shippers', customerId: 'CUST-002', origin: 'Chicago, IL', destination: 'Houston, TX', driver: 'Jane Smith', driverId: 'DRV-002', status: 'Delivered' as const, pickupTime: '2024-07-29T11:00:00Z', estimatedDelivery: '2024-07-31T15:00:00Z', vehicleId: 'VEH-203', distance: 1750, revenue: 41580, notes: "", truck: 'FRT-102' },
    { id: 'TRIP-003', customer: 'Coast-to-Coast Movers', customerId: 'CUST-003', origin: 'Miami, FL', destination: 'Seattle, WA', driver: 'Mike Johnson', driverId: 'DRV-003', status: 'Planned' as const, pickupTime: '2024-08-01T09:00:00Z', estimatedDelivery: '2024-08-07T17:00:00Z', vehicleId: 'VEH-305', distance: 5260, revenue: 124977.6, notes: "Handle with care, fragile items.", truck: 'KW-210' },
    { id: 'TRIP-004', customer: 'FarmFresh Produce', customerId: 'CUST-004', origin: 'Fresno, CA', destination: 'Denver, CO', driver: 'Sarah Williams', driverId: 'DRV-004', status: 'In Transit' as const, pickupTime: '2024-08-02T14:00:00Z', estimatedDelivery: '2024-08-04T12:00:00Z', vehicleId: 'VEH-410', distance: 2010, revenue: 47757.6, notes: 'Requires refrigerated trailer.', truck: 'PET-300' },
    { id: 'TRIP-005', customer: 'SteelWorks Corp', customerId: 'CUST-005', origin: 'Pittsburgh, PA', destination: 'Detroit, MI', driver: 'Robert Brown', driverId: 'DRV-001', status: 'Cancelled' as const, pickupTime: '2024-08-03T10:00:00Z', estimatedDelivery: '2024-08-03T20:00:00Z', vehicleId: 'VEH-101', distance: 460, revenue: 10930, notes: 'Customer cancelled, no charge.', truck: 'VOL-502' },
    { id: 'TRIP-006', customer: 'Global Logistics Inc.', customerId: 'CUST-001', origin: 'Dallas, TX', destination: 'Atlanta, GA', driver: 'Emily Davis', driverId: 'DRV-002', status: 'Delivered' as const, pickupTime: '2024-07-25T08:00:00Z', estimatedDelivery: '2024-07-27T16:00:00Z', vehicleId: 'VEH-203', distance: 1255, revenue: 29818.8, notes: '', truck: 'FRT-105' },
    { id: 'TRIP-007', customer: 'QuickHaul Shippers', customerId: 'CUST-002', origin: 'New York, NY', destination: 'Boston, MA', driver: 'John Doe', driverId: 'DRV-001', status: 'Pending' as const, pickupTime: '2024-08-01T18:00:00Z', estimatedDelivery: '2024-08-02T10:00:00Z', vehicleId: 'VEH-305', distance: 346, revenue: 8222.16, notes: 'Awaiting BOL from customer.', truck: 'KW-211' },
];

const mockFuelLogs = [
    { vehicleId: 'VEH-101', driverId: 'DRV-001', date: '2024-07-28', liters: 321, cost: 6099, kmDriven: 901.5 },
    { vehicleId: 'VEH-101', driverId: 'DRV-001', date: '2024-07-31', liters: 315, cost: 5985, kmDriven: 884.5 },
    { vehicleId: 'VEH-203', driverId: 'DRV-002', date: '2024-07-29', liters: 386, cost: 7334, kmDriven: 1024.8 },
    { vehicleId: 'VEH-203', driverId: 'DRV-002', date: '2024-08-02', liters: 383, cost: 7277, kmDriven: 1016.4 },
    { vehicleId: 'VEH-305', driverId: 'DRV-003', date: '2024-07-30', liters: 400, cost: 7600, kmDriven: 960.0 },
    { vehicleId: 'VEH-410', driverId: 'DRV-004', date: '2024-08-01', liters: 330, cost: 6270, kmDriven: 990.0 },
];

const mockCommissionsToSeed = [
    { id: 'COMM-001', broker: 'Brokerage Firm A', tripId: 'TRIP-001', status: 'Paid' as const, payoutDate: '2024-08-01', payoutId: 'PO-2024-08' },
    { id: 'COMM-002', broker: 'Independent Agents', tripId: 'TRIP-002', status: 'Paid' as const, payoutDate: '2024-08-01', payoutId: 'PO-2024-08' },
    { id: 'COMM-003', broker: 'Brokerage Firm A', tripId: 'TRIP-006', status: 'Paid' as const, payoutDate: '2024-07-15', payoutId: 'PO-2024-07' },
    { id: 'COMM-004', broker: 'Brokerage Firm B', tripId: 'TRIP-004', status: 'Pending' as const, payoutDate: '2024-09-01' },
    { id: 'COMM-005', broker: 'Independent Agents', tripId: 'TRIP-007', status: 'Pending' as const, payoutDate: '2024-09-01' },
];

const mockPayoutsToSeed = [
    { id: 'PO-2024-08', payoutDate: '2024-08-01', status: 'Completed' as const, totalAmount: 7425.00, commissionsCount: 2 },
    { id: 'PO-2024-07', payoutDate: '2024-07-15', status: 'Completed' as const, totalAmount: 1490.94, commissionsCount: 1 },
];

async function main() {
  console.log('--- Starting Admin User & Data Seeding Script ---');

  try {
    if (!auth || !db) {
        throw new Error(initializationError || "Firebase Admin SDK is not initialized.");
    }
    console.log('✅ Firebase Admin initialized.');

    // --- Admin User Setup ---
    console.log('\n--- Section 1: Admin User ---');
    const adminEmail = 'admin@matrix.com';
    const adminPassword = 'admin1234';
    let userRecord;
    try {
      console.log(`Checking for existing user: ${adminEmail}...`);
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log(`✅ Admin user already exists with UID: ${userRecord.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log('ℹ️ Admin user not found. Creating a new one...');
        userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: 'Admin User',
        });
        console.log(`✅ Successfully created new admin user with UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    const adminUid = userRecord.uid;
    await auth.setCustomUserClaims(adminUid, { admin: true });
    console.log('✅ Set custom admin claims.');
    const userRef = db.collection('users').doc(adminUid);
    await userRef.set(
      {
        uid: adminUid,
        email: adminEmail,
        role: 'Admin',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log('✅ Wrote user document to Firestore.');


    // --- Data Seeding ---
    const batch = db.batch();
    
    // Customers
    console.log('\n--- Section 2: Customer Data Seeding ---');
    mockCustomers.forEach((customer) => {
        batch.set(db.collection('customers').doc(customer.id), customer);
    });
    console.log(`✅ Queued ${mockCustomers.length} customers for seeding.`);

    // Employees
    console.log('\n--- Section 3: Employee Data Seeding ---');
    mockEmployees.forEach((employee) => {
        const employeeData = { 
          ...employee, 
          status: 'Active' as const,
          photoUrl: `https://i.pravatar.cc/150?u=${employee.id}`,
          totalTrips: Math.floor(Math.random() * 25),
        };
        batch.set(db.collection('employees').doc(employee.id), employeeData);
    });
    console.log(`✅ Queued ${mockEmployees.length} employees for seeding.`);

    // Vehicles
    console.log('\n--- Section 4: Vehicle Data Seeding ---');
    mockVehicles.forEach((vehicle) => {
        batch.set(db.collection('vehicles').doc(vehicle.id), vehicle);
    });
    console.log(`✅ Queued ${mockVehicles.length} vehicles for seeding.`);

    // Expenses
    console.log('\n--- Section 5: Expense Data Seeding ---');
    mockExpenses.forEach((expense) => {
        batch.set(db.collection('expenses').doc(expense.id), expense);
    });
    console.log(`✅ Queued ${mockExpenses.length} expenses for seeding.`);

    // Invoices
    console.log('\n--- Section 6: Invoice Data Seeding ---');
    mockInvoices.forEach((invoice) => {
        batch.set(db.collection('invoices').doc(invoice.id), invoice);
    });
    console.log(`✅ Queued ${mockInvoices.length} invoices for seeding.`);

    // Trips
    console.log('\n--- Section 7: Trip Data Seeding ---');
    mockTrips.forEach((trip) => {
        batch.set(db.collection('trips').doc(trip.id), trip);
    });
    console.log(`✅ Queued ${mockTrips.length} trips for seeding.`);

    // Quotes
    console.log('\n--- Section 8: Quote Data Seeding ---');
    mockQuotes.forEach((quote) => {
        batch.set(db.collection('quotes').doc(quote.id), quote);
    });
    console.log(`✅ Queued ${mockQuotes.length} quotes for seeding.`);

    // Leave Requests
    console.log('\n--- Section 9: Leave Request Data Seeding ---');
    mockLeaveRequests.forEach((req) => {
        const docRef = db.collection('leaveRequests').doc();
        batch.set(docRef, { id: docRef.id, ...req });
    });
    console.log(`✅ Queued ${mockLeaveRequests.length} leave requests for seeding.`);

    // Fuel Logs
    console.log('\n--- Section 10: Fuel Log Data Seeding ---');
    mockFuelLogs.forEach((log) => {
        const docRef = db.collection('fuelLogs').doc();
        batch.set(docRef, { id: docRef.id, ...log });
    });
    console.log(`✅ Queued ${mockFuelLogs.length} fuel logs for seeding.`);

    // Payroll Runs
    console.log('\n--- Section 11: Payroll Run Data Seeding ---');
    mockPayrollRuns.forEach((run) => {
        batch.set(db.collection('payrollRuns').doc(run.id), run);
    });
    console.log(`✅ Queued ${mockPayrollRuns.length} payroll runs for seeding.`);

    // Commissions & Payouts
    console.log('\n--- Section 12: Commissions & Payouts Data Seeding ---');
    mockCommissionsToSeed.forEach((commission) => {
        batch.set(db.collection('commissions').doc(commission.id), commission);
    });
    console.log(`✅ Queued ${mockCommissionsToSeed.length} commissions for seeding.`);

    mockPayoutsToSeed.forEach((payout) => {
        batch.set(db.collection('payouts').doc(payout.id), payout);
    });
    console.log(`✅ Queued ${mockPayoutsToSeed.length} payouts for seeding.`);

    // Settings
    console.log('\n--- Section 13: Settings Data Seeding ---');
    batch.set(db.collection('settings').doc(defaultSettings.id), defaultSettings, { merge: true });
    console.log(`✅ Queued default settings for seeding.`);

    // Commit all changes
    await batch.commit();
    console.log('\n✅ Successfully committed all data to Firestore.');


    console.log('\n--- ✨ Setup Complete! ✨ ---');
    console.log('You can now log in with:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);

  } catch (error) {
    console.error('\n--- 🔴 Script Failed ---');
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  }
}

main();
