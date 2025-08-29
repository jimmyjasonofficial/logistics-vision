
import { getTripById } from '@/services/trip-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Truck, MapPin, Flag, Clock } from 'lucide-react';
import { Logo } from '@/components/logo';

const getStatusInfo = (status: string): { text: string; progress: number } => {
    switch (status) {
        case 'Planned':
            return { text: "Your shipment is planned and awaiting dispatch.", progress: 10 };
        case 'In Transit':
            return { text: "Your shipment is on its way.", progress: 50 };
        case 'Delivered':
            return { text: "Your shipment has been successfully delivered.", progress: 100 };
        case 'Cancelled':
            return { text: "This shipment has been cancelled.", progress: 0 };
        default:
            return { text: "The status of your shipment is pending.", progress: 0 };
    }
};

export default async function TrackingPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const trip = await getTripById(id);

    if (!trip) {
        notFound();
    }
    
    const statusInfo = getStatusInfo(trip.status);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 sm:p-8">
            <div className="absolute top-8 left-8">
                <Logo />
            </div>
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Track Your Shipment</CardTitle>
                    <CardDescription>Tracking ID: {trip.id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg">{statusInfo.text}</h3>
                        <div className="relative pt-2">
                             <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary">
                                <div style={{ width: `${statusInfo.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Origin</p>
                                <p className="font-medium">{trip.origin}</p>
                            </div>
                        </div>
                         <div className="flex items-center justify-center text-center">
                           <Truck className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="flex items-center gap-3 sm:justify-end sm:text-right">
                             <div className="sm:text-right">
                                <p className="text-muted-foreground">Destination</p>
                                <p className="font-medium">{trip.destination}</p>
                            </div>
                             <Flag className="h-6 w-6 text-muted-foreground" />
                        </div>
                    </div>
                    <Separator className="my-6" />
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Estimated Delivery: <span className="font-medium text-foreground">{new Date(trip.estimatedDelivery).toLocaleString()}</span></span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
