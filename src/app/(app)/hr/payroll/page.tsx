
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, Plus } from 'lucide-react';
import { getPayrollRuns } from '@/services/payroll-service';
import { PayrollClientPage } from './payroll-client';

export default async function PayrollHistoryPage() {
    const payrollRuns = await getPayrollRuns();

    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Payroll</h1>
                        <p className="text-muted-foreground">Process and manage employee payroll.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/hr/payroll/calculator">
                            <Calculator className="mr-2 h-4 w-4" />
                            Payroll Calculator
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/hr/payroll/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Pay Run
                        </Link>
                    </Button>
                </div>
            </div>
            
            <PayrollClientPage initialPayrollRuns={payrollRuns} />
        </div>
    );
}
