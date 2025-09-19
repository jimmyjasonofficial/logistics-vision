
'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';


import { createDocumentWithCustomId } from '../services/firestore-service';

export type Employee = {
  id: string;
  name: string | 'Unknown';
  email: string | 'unknown@example.com';
  phone: string | 'N/A';
  license?: string;
  license_file?: string;
  licenseExpiry?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  profile_image: string | undefined;
  totalTrips: number | 0;
  role: 'Driver' | 'Senior Driver' | 'Admin' | 'Operations' | 'Finance' | 'Assistance' | 'Dispatcher' | 'Mechanic' | 'Accountant' | 'HR Manager' | 'User';
  baseSalary?: number;
  leaveAllowance?: number | 20;
};

export type EmployeeData = Omit<Employee, 'id'>;

export async function createEmployee(employeeData: EmployeeData): Promise<Employee> {
  const db = ensureDbConnected();
  // const collectionRef = db.collection('employees');
  // const docRef = collectionRef.doc();
  // const newEmployee: Employee = {
  //     id: docRef.id,
  //     totalTrips: 0,
  //     profile_image: employeeData?.profile_image,
  //     name: employeeData.name || 'Unknown',
  //     email: employeeData.email || 'unknown@example.com',
  //     phone: employeeData.phone || 'N/A',
  //     status: employeeData.status || 'Active',
  //     leaveAllowance: employeeData.leaveAllowance || 20,
  //     ...employeeData,
  //     role: employeeData.role || 'User',
  // };
  // await docRef.set(newEmployee);

  const newEmployee = await createDocumentWithCustomId<EmployeeData>('employees', 'EMP', employeeData);

  return newEmployee;
}

export async function updateEmployee(id: string, employeeData: Partial<Omit<EmployeeData, 'id' | 'photoUrl'>>): Promise<void> {
  const db = ensureDbConnected();
  const docRef = db.collection('employees').doc(id);
  await docRef.update(employeeData);
}

type GetEmployeesOptions = {
    role?: string;
}

export async function getEmployees(options: GetEmployeesOptions = {}): Promise<Employee[]> {
  try {
    const db = ensureDbConnected();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('employees');
    
    if (options.role) {
        query = query.where('role', '==', options.role);
    }
    
    const employeesSnapshot = await query.get();

    if (employeesSnapshot.empty) {
      return [];
    }
    const employees = employeesSnapshot.docs.map(doc => doc.data() as Employee);
    employees.sort((a,b) => a.name.localeCompare(b.name));
    return employees;
  } catch (error: any) {
    console.warn(`Could not connect to Firestore to get employees. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getDrivers(): Promise<Employee[]> {
    const employees = await getEmployees();
    return employees.filter(e => e.role && e.role.toLowerCase().includes('driver'));
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  try {
    const db = ensureDbConnected();
    const docRef = db.collection('employees').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    return docSnap.data() as Employee;
  } catch (error) {
     console.warn(`Could not connect to Firestore to get employee ${id}. Returning null. Error: ${error.message}`);
     return null;
  }
}
