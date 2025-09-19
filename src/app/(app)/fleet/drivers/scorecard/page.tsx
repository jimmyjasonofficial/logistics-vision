
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Medal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

import { getDrivers } from '@/services/employee-service';
import { getTrips } from '@/services/trip-service';
import { getFuelLogs } from '@/services/fuel-service';
import type { Employee } from '@/services/employee-service';

type DriverStats = {
    id: string;
    name: string;
    photoUrl: string;
    totalRevenue: number;
    avgKmL: number;
    revenueScore: number;
    efficiencyScore: number;
    finalScore: number;
};

export default async function DriverScorecardPage() {
    const [drivers, trips, fuelLogs] = await Promise.all([
        getDrivers(),
        getTrips(),
        getFuelLogs(),
    ]);

    const driverStats = drivers.map(driver => {
        const driverTrips = trips.filter(trip => trip.driverId === driver.id && trip.status === 'Delivered');
        const driverFuelLogs = fuelLogs.filter(log => log.driverId === driver.id);

        const totalRevenue = driverTrips.reduce((sum, trip) => sum + trip.revenue, 0);
        
        const totalKmDriven = driverFuelLogs.reduce((sum, log) => sum + log.kmDriven, 0);
        const totalLiters = driverFuelLogs.reduce((sum, log) => sum + log.liters, 0);
        const avgKmL = totalLiters > 0 ? totalKmDriven / totalLiters : 0;

        return { id: driver.id, name: driver.name, photoUrl: driver.photoUrl, totalRevenue, avgKmL };
    });

    const maxRevenue = Math.max(...driverStats.map(d => d.totalRevenue), 1);
    const maxKmL = Math.max(...driverStats.map(d => d.avgKmL), 1);

    const rankedDrivers: DriverStats[] = driverStats.map(driver => {
        const revenueScore = (driver.totalRevenue / maxRevenue);
        const efficiencyScore = (driver.avgKmL / maxKmL);
        const finalScore = (revenueScore * 0.5 + efficiencyScore * 0.5) * 100;

        return { ...driver, revenueScore, efficiencyScore, finalScore };
    }).sort((a,b) => b.finalScore - a.finalScore);


    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/fleet/drivers">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Driver Scorecard</h1>
                    <p className="text-muted-foreground">Performance ranking based on revenue and fuel efficiency.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Driver Rankings</CardTitle>
                    <CardDescription>
                        Drivers are ranked based on a weighted score: 50% from total revenue generated and 50% from fuel efficiency (KM/L).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Total Revenue</TableHead>
                                <TableHead>Avg. Fuel Efficiency</TableHead>
                                <TableHead className="w-[200px]">Overall Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rankedDrivers.map((driver, index) => (
                                <TableRow key={driver.id}>
                                    <TableCell className="font-bold text-2xl text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            {index < 3 && <Medal className={`h-6 w-6 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-700'}`} />}
                                            {index + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/fleet/drivers/${driver.id}`} className="flex items-center gap-3 font-medium text-primary hover:underline">
                                            <Avatar>
                                                <AvatarImage src={driver.photoUrl} alt={driver.name} />
                                                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {driver.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-mono">N${driver.totalRevenue.toLocaleString()}</TableCell>
                                    <TableCell className="font-mono">{driver.avgKmL.toFixed(2)} KM/L</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={driver.finalScore} className="h-2" />
                                            <span className="font-mono text-sm">{driver.finalScore.toFixed(1)}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
