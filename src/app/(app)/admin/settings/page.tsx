
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImageIcon, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getSettingsAction, updateSettingsAction } from './actions';
import type { TaxRate, AppSettings } from '@/services/settings-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [taxId, setTaxId] = useState('');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(30);
  const [invoiceFooter, setInvoiceFooter] = useState('');
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);

  useEffect(() => {
    async function loadSettings() {
      setInitialLoading(true);
      const settings = await getSettingsAction();
      setCompanyName(settings.companyName || '');
      setCompanyAddress(settings.companyAddress || '');
      setCurrency(settings.currency || 'usd');
      setTaxId(settings.taxId || '');
      setDefaultPaymentTerms(settings.defaultPaymentTerms || 30);
      setInvoiceFooter(settings.invoiceFooter || '');
      setTaxRates(settings.taxRates || []);
      setInitialLoading(false);
    }
    loadSettings();
  }, []);


  const handleTaxRateChange = (index: number, field: keyof TaxRate, value: string | number) => {
    const newTaxRates = [...taxRates];
    const rate = newTaxRates[index];
    if (field === 'name' && typeof value === 'string') {
        rate.name = value;
    } else if (field === 'rate' && typeof value === 'number') {
        rate.rate = isNaN(value) ? 0 : value;
    }
    setTaxRates(newTaxRates);
  };

  const addTaxRate = () => {
    setTaxRates([...taxRates, { name: '', rate: 0 }]);
  };

  const removeTaxRate = (index: number) => {
    setTaxRates(taxRates.filter((_, i) => i !== index));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormLoading(true);
    
    const settingsData: Partial<Omit<AppSettings, 'id'>> = {
        companyName,
        companyAddress,
        currency,
        taxId,
        defaultPaymentTerms,
        invoiceFooter,
        taxRates,
    };

    const result = await updateSettingsAction(settingsData);
    
    if (result.success) {
        toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
        });
    } else {
        toast({
            variant: 'destructive',
            title: "Save Failed",
            description: result.error || "An unknown error occurred.",
        });
    }
    setFormLoading(false);
  }

  if (initialLoading) {
    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>
             <Skeleton className="h-10 w-full max-w-lg" />
             <Skeleton className="h-96 w-full" />
        </div>
    );
  }


  return (
    <div className="flex-1 space-y-8">
       <div className="flex items-center gap-4">
        <Link href="/admin">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold">Application Settings</h1>
            <p className="text-muted-foreground">Manage comprehensive settings for your application.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
         <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="operational">Operational</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Update your company's public details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={formLoading} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="company-address">Company Address</Label>
                      <Textarea id="company-address" placeholder="123 Logistics Lane, Suite 100&#x0A;Transport City, TX 75001" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} disabled={formLoading} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>Customize the look of your application and documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <Input id="logo-upload" type="file" className="max-w-xs" disabled={formLoading}/>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload a PNG or JPG. Recommended size: 400x400px.</p>
                </CardContent>
              </Card>
            </TabsContent>

             <TabsContent value="financial" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Currency & Taxes</CardTitle>
                        <CardDescription>Configure default financial settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={currency} onValueChange={setCurrency} disabled={formLoading}>
                            <SelectTrigger id="currency" className="max-w-sm">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usd">USD - United States Dollar</SelectItem>
                              <SelectItem value="eur">EUR - Euro</SelectItem>
                              <SelectItem value="gbp">GBP - British Pound</SelectItem>
                              <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="tax-id">Tax ID / VAT Number</Label>
                            <Input id="tax-id" placeholder="Enter your Tax ID" className="max-w-sm" value={taxId} onChange={(e) => setTaxId(e.target.value)} disabled={formLoading}/>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Invoice Settings</CardTitle>
                        <CardDescription>Set defaults for new invoices.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="payment-terms">Default Payment Terms (Days)</Label>
                            <Input id="payment-terms" type="number" value={defaultPaymentTerms} onChange={(e) => setDefaultPaymentTerms(Number(e.target.value))} className="max-w-xs" disabled={formLoading}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="invoice-footer">Invoice Footer Text</Label>
                            <Textarea id="invoice-footer" placeholder="Thank you for your business! Please contact us with any questions." value={invoiceFooter} onChange={(e) => setInvoiceFooter(e.target.value)} disabled={formLoading}/>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Tax Rates</CardTitle>
                        <CardDescription>Define the tax rates used in your invoices and quotes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-1">
                            <div className="col-span-6">Tax Name</div>
                            <div className="col-span-4">Rate (%)</div>
                            <div className="col-span-2 sr-only">Actions</div>
                        </div>
                         {taxRates.map((tax, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-6">
                                    <Input
                                    value={tax.name}
                                    onChange={(e) => handleTaxRateChange(index, 'name', e.target.value)}
                                    placeholder="e.g., Sales Tax"
                                    disabled={formLoading}
                                    />
                                </div>
                                <div className="col-span-4">
                                    <Input
                                    type="number"
                                    value={tax.rate}
                                    onChange={(e) => handleTaxRateChange(index, 'rate', parseFloat(e.target.value))}
                                    placeholder="e.g., 8.25"
                                    step="0.01"
                                    disabled={formLoading}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTaxRate(index)}
                                    aria-label="Remove tax rate"
                                    disabled={formLoading}
                                    >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addTaxRate} className="mt-2" disabled={formLoading}>
                           <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Rate
                        </Button>
                    </CardContent>
                 </Card>
            </TabsContent>

             <TabsContent value="operational" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Units & Formats</CardTitle>
                        <CardDescription>Set default units of measurement and display formats.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="grid gap-2">
                          <Label htmlFor="distance-unit">Distance Unit</Label>
                          <Select defaultValue="miles" disabled={formLoading}>
                            <SelectTrigger id="distance-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="miles">Miles</SelectItem>
                              <SelectItem value="kilometers">Kilometers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date-format">Date Format</Label>
                            <Select defaultValue="mm-dd-yyyy" disabled={formLoading}>
                                <SelectTrigger id="date-format">
                                <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                                <SelectItem value="month-d-y">Month D, YYYY</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select defaultValue="est" disabled={formLoading}>
                                <SelectTrigger id="timezone">
                                <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                                <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                                <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                                <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Manage which automated emails are sent from the system.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="notify-invoice" defaultChecked disabled={formLoading}/>
                            <Label htmlFor="notify-invoice">Notify customer automatically when a new invoice is created.</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="notify-overdue" disabled={formLoading}/>
                            <Label htmlFor="notify-overdue">Send automatic reminders for overdue invoices.</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="notify-trip-complete" defaultChecked disabled={formLoading}/>
                            <Label htmlFor="notify-trip-complete">Notify admin users upon trip completion.</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="daily-summary" disabled={formLoading}/>
                            <Label htmlFor="daily-summary">Send a daily operational summary email to admins.</Label>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

             <TabsContent value="advanced" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>API Integrations</CardTitle>
                        <CardDescription>Manage API keys for third-party services.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="google-maps-api">Google Maps API Key</Label>
                            <Input id="google-maps-api" type="password" placeholder="Enter API Key" disabled={formLoading}/>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Maintenance Mode</CardTitle>
                        <CardDescription>Temporarily disable access to the application for non-admin users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="maintenance-mode" disabled={formLoading}/>
                            <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
         </Tabs>
         <div className="flex justify-end mt-8">
            <Button type="submit" disabled={formLoading || initialLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save All Settings
            </Button>
         </div>
      </form>
    </div>
  );
}
