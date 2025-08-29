import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteTable } from './quote-table';
import { getQuotes } from '@/services/quote-service';


export default async function QuotesPage() {
    const quotes = await getQuotes();
    
    const allQuotes = quotes;
    const draftQuotes = quotes.filter(q => q.status === 'Draft');
    const sentQuotes = quotes.filter(q => q.status === 'Sent');
    const acceptedQuotes = quotes.filter(q => q.status === 'Accepted');
    const expiredQuotes = quotes.filter(q => q.status === 'Expired');

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
                <h1 className="text-3xl font-bold">Quotes</h1>
                <p className="text-muted-foreground">Create and manage customer quotes.</p>
            </div>
        </div>
        <Button asChild>
            <Link href="/accounting/quotes/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Quote
            </Link>
        </Button>
      </div>

       <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                <Card>
                    <CardHeader><CardTitle>All Quotes</CardTitle><CardDescription>A list of all customer quotes from Firestore.</CardDescription></CardHeader>
                    <CardContent className="p-0"><QuoteTable quotes={allQuotes} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="draft">
                <Card>
                    <CardHeader><CardTitle>Draft Quotes</CardTitle><CardDescription>Quotes that have not been sent yet.</CardDescription></CardHeader>
                    <CardContent className="p-0"><QuoteTable quotes={draftQuotes} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="sent">
                <Card>
                    <CardHeader><CardTitle>Sent Quotes</CardTitle><CardDescription>Quotes that have been sent to customers.</CardDescription></CardHeader>
                    <CardContent className="p-0"><QuoteTable quotes={sentQuotes} /></CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="accepted">
                <Card>
                    <CardHeader><CardTitle>Accepted Quotes</CardTitle><CardDescription>Quotes that have been accepted by customers.</CardDescription></CardHeader>
                    <CardContent className="p-0"><QuoteTable quotes={acceptedQuotes} /></CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="expired">
                <Card>
                    <CardHeader><CardTitle>Expired Quotes</CardTitle><CardDescription>Quotes that are past their expiry date.</CardDescription></CardHeader>
                    <CardContent className="p-0"><QuoteTable quotes={expiredQuotes} /></CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
