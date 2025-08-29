'use client';

import { useState } from 'react';
import { MaintenanceForm } from './maintenance-form';
import type { MaintenanceOutput } from '@/ai/flows/maintenance-recommendation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Terminal, Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AiMaintenancePage() {
  const [result, setResult] = useState<MaintenanceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResult = (data: MaintenanceOutput | { error: string } | null) => {
    if (!data) {
        setResult(null);
        setError(null);
        return;
    }
    if ('error' in data) {
      setError(data.error);
      setResult(null);
    } else {
      setResult(data);
      setError(null);
    }
  };

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case 'Immediate':
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default';
      case 'Low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">AI Maintenance Advisor</h1>
          <p className="text-muted-foreground">
            Get AI-powered maintenance recommendations for your vehicles.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <MaintenanceForm onResult={handleResult} setLoading={setLoading} loading={loading} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <Wrench className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing your vehicle...</p>
                </div>
              </div>
            )}
            {error && !loading && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && !loading && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Overall Urgency:</h3>
                  <Badge variant={getUrgencyVariant(result.urgency) as 'destructive' | 'default' | 'secondary' | 'outline'} className="text-base">
                    {result.urgency}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-card-foreground/5">
                      <h4 className="font-semibold text-primary">{rec.title}</h4>
                      <p className="text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!result && !error && !loading && (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                        <Wrench className="h-12 w-12 mx-auto mb-2" />
                        <p>Your recommendations will appear here.</p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
