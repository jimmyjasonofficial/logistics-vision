
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchAction, type SearchResult } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search as SearchIcon, FileText, Truck, User, Receipt, Compass } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      const searchResults = await searchAction(query);
      setResults(searchResults);
      setLoading(false);
    }
    performSearch();
  }, [query]);

  const getIcon = (type: SearchResult['type']) => {
    switch(type) {
      case 'Page': return <Compass className="h-5 w-5 text-muted-foreground" />;
      case 'Customer': return <User className="h-5 w-5 text-muted-foreground" />;
      case 'Trip': return <Truck className="h-5 w-5 text-muted-foreground" />;
      case 'Invoice': return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'Expense': return <Receipt className="h-5 w-5 text-muted-foreground" />;
      default: return <SearchIcon className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <div className="flex-1 space-y-8">
      <h1 className="text-3xl font-bold">Search Results</h1>
      {query && <p className="text-muted-foreground">Showing results for: <span className="font-semibold text-foreground">"{query}"</span></p>}
      
      <Card>
        <CardHeader>
          <CardTitle>Found {results?.length ?? 0} items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          {!loading && results && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>No results found for your query.</p>
                </div>
              ) : (
                results.map((result) => (
                  <Link href={result.url} key={`${result.type}-${result.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-start gap-4">
                      <div className="mt-1">{getIcon(result.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-primary" dangerouslySetInnerHTML={{ __html: result.title }} />
                          <Badge variant="outline">{result.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: result.description }} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Using Suspense for useSearchParams is the recommended approach
export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    )
}
