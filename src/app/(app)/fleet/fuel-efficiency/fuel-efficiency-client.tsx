
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Vehicle } from '@/services/vehicle-service';
import type { Employee } from '@/services/employee-service';
import type { FuelLog } from '@/services/fuel-service';
import { GaugeCircle, Truck, Users, Award, Frown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type FuelEfficiencyClientPageProps = {
  vehicles: Vehicle[];
  drivers: Employee[];
  fuelLogs: FuelLog[];
};

type EfficiencyData = {
  id: string;
  name: string;
  totalKm: number;
  totalLiters: number;
  totalCost: number;
  avgKmL: number;
  costPerKm: number;
  photoUrl?: string;
};

const EfficiencyStatCard = ({ title, icon, data }: { title: string, icon: React.ReactNode, data: EfficiencyData | null }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {data ? (
                <>
                    <div className="text-lg font-bold truncate">{data.name}</div>
                    <p className="text-xs text-muted-foreground font-mono">
                        {data.avgKmL.toFixed(2)} KM/L / N${data.costPerKm.toFixed(2)} per km
                    </p>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">Not enough data.</p>
            )}
        </CardContent>
    </Card>
);

export function FuelEfficiencyClientPage({ vehicles, drivers, fuelLogs }: FuelEfficiencyClientPageProps) {

  const {
    fleetAvgKmL,
    fleetAvgCpk,
    vehicleEfficiency,
    driverEfficiency,
    mostEfficientVehicle,
    leastEfficientVehicle,
    mostEfficientDriver,
    leastEfficientDriver
  } = useMemo(() => {
    if (fuelLogs.length === 0) {
      return {
        fleetAvgKmL: 0,
        fleetAvgCpk: 0,
        vehicleEfficiency: [],
        driverEfficiency: [],
        mostEfficientVehicle: null,
        leastEfficientVehicle: null,
        mostEfficientDriver: null,
        leastEfficientDriver: null,
      };
    }

    const totalKm = fuelLogs.reduce((sum, log) => sum + log.kmDriven, 0);
    const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);

    const fleetAvgKmL = totalLiters > 0 ? totalKm / totalLiters : 0;
    const fleetAvgCpk = totalKm > 0 ? totalCost / totalKm : 0;

    const aggregateData = (idKey: 'vehicleId' | 'driverId', sourceData: {id: string, name: string, photoUrl?: string}[]) => {
      const dataMap = new Map<string, { totalKm: number; totalLiters: number, totalCost: number }>();
      fuelLogs.forEach(log => {
        const id = log[idKey];
        if (!id) return;
        const current = dataMap.get(id) || { totalKm: 0, totalLiters: 0, totalCost: 0 };
        current.totalKm += log.kmDriven;
        current.totalLiters += log.liters;
        current.totalCost += log.cost;
        dataMap.set(id, current);
      });

      return Array.from(dataMap.entries()).map(([id, data]) => {
        const sourceItem = sourceData.find(item => item.id === id);
        const avgKmL = data.totalLiters > 0 ? data.totalKm / data.totalLiters : 0;
        const costPerKm = data.totalKm > 0 ? data.totalCost / data.totalKm : 0;
        return {
          id,
          name: sourceItem?.name || `Unknown (${id})`,
          photoUrl: sourceItem?.photoUrl,
          totalKm: data.totalKm,
          totalLiters: data.totalLiters,
          totalCost: data.totalCost,
          avgKmL,
          costPerKm
        };
      }).sort((a, b) => b.avgKmL - a.avgKmL); // sort by KM/L desc
    };

    const vehicleEff = aggregateData('vehicleId', vehicles.map(v => ({ id: v.id, name: `${v.year} ${v.model} (${v.licensePlate})` })));
    const driverEff = aggregateData('driverId', drivers);

    return {
      fleetAvgKmL,
      fleetAvgCpk: fleetAvgCpk,
      vehicleEfficiency: vehicleEff,
      driverEfficiency: driverEff,
      mostEfficientVehicle: vehicleEff.length > 0 ? vehicleEff[0] : null,
      leastEfficientVehicle: vehicleEff.length > 1 ? vehicleEff[vehicleEff.length - 1] : null,
      mostEfficientDriver: driverEff.length > 0 ? driverEff[0] : null,
      leastEfficientDriver: driverEff.length > 1 ? driverEff[driverEff.length - 1] : null
    };
  }, [vehicles, drivers, fuelLogs]);
  
  const getKmlBadgeVariant = (kml: number, avg: number) => {
    if (kml > avg * 1.05) return 'secondary'; // More than 5% better
    if (kml < avg * 0.95) return 'destructive'; // More than 5% worse
    return 'outline';
  };

  const getCpkBadgeVariant = (cpk: number, avg: number) => {
    if (cpk < avg * 0.95) return 'secondary'; // More than 5% better (lower cost)
    if (cpk > avg * 1.05) return 'destructive'; // More than 5% worse (higher cost)
    return 'outline';
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GaugeCircle className="h-6 w-6 text-primary" />Fleet Average</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-8">
            <div>
                <p className="text-4xl font-bold">{fleetAvgKmL.toFixed(2)} KM/L</p>
                <p className="text-muted-foreground">Average Kilometers Per Liter</p>
            </div>
            <Separator orientation="vertical" className="h-16" />
             <div>
                <p className="text-4xl font-bold">N${fleetAvgCpk.toFixed(2)}</p>
                <p className="text-muted-foreground">Average Cost Per Kilometer</p>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EfficiencyStatCard title="Most Efficient Vehicle" icon={<Award className="h-4 w-4 text-muted-foreground"/>} data={mostEfficientVehicle} />
        <EfficiencyStatCard title="Least Efficient Vehicle" icon={<Frown className="h-4 w-4 text-muted-foreground"/>} data={leastEfficientVehicle} />
        <EfficiencyStatCard title="Most Efficient Driver" icon={<Award className="h-4 w-4 text-muted-foreground"/>} data={mostEfficientDriver} />
        <EfficiencyStatCard title="Least Efficient Driver" icon={<Frown className="h-4 w-4 text-muted-foreground"/>} data={leastEfficientDriver} />
      </div>

      <Tabs defaultValue="vehicles">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehicles"><Truck className="mr-2 h-4 w-4"/>By Vehicle</TabsTrigger>
            <TabsTrigger value="drivers"><Users className="mr-2 h-4 w-4"/>By Driver</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicles">
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Efficiency</CardTitle>
                    <CardDescription>Breakdown of fuel efficiency for each vehicle in the fleet.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead className="text-right">Average KM/L</TableHead>
                                <TableHead className="text-right">Cost/KM</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicleEfficiency.map((v, index) => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">#{index + 1}</TableCell>
                                    <TableCell>
                                      <Link href={`/fleet/vehicles/${v.id}`} className="font-medium text-primary hover:underline">{v.name}</Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getKmlBadgeVariant(v.avgKmL, fleetAvgKmL)} className="font-mono">{v.avgKmL.toFixed(2)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getCpkBadgeVariant(v.costPerKm, fleetAvgCpk)} className="font-mono">N${v.costPerKm.toFixed(2)}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="drivers">
            <Card>
                <CardHeader>
                    <CardTitle>Driver Efficiency</CardTitle>
                    <CardDescription>Breakdown of fuel efficiency for each driver.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead className="text-right">Average KM/L</TableHead>
                                <TableHead className="text-right">Cost/KM</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {driverEfficiency.map((d, index) => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">#{index + 1}</TableCell>
                                    <TableCell>
                                        <Link href={`/fleet/drivers/${d.id}`} className="font-medium text-primary hover:underline flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={d.photoUrl} alt={d.name} />
                                                <AvatarFallback>{d.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {d.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getKmlBadgeVariant(d.avgKmL, fleetAvgKmL)} className="font-mono">{d.avgKmL.toFixed(2)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getCpkBadgeVariant(d.costPerKm, fleetAvgCpk)} className="font-mono">N${d.costPerKm.toFixed(2)}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
