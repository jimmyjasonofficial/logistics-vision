
'use client';

import { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, CheckCircle, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestMatchesAction } from './actions';
import type { ReconciliationOutput } from '@/ai/flows/reconciliation-flow';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';

// --- Types ---

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
};

type ReconciliationClientPageProps = {
  initialSystemTransactions: Transaction[];
};

// --- Sub-Components ---

type TransactionTableProps = {
  title: string;
  transactions: Transaction[];
  selectedIds: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
  className?: string;
};

function TransactionTable({ title, transactions, selectedIds, onSelectionChange, className }: TransactionTableProps) {
  const handleSelectAll = (checked: boolean) => {
    transactions.forEach(tx => onSelectionChange(tx.id, checked));
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox onCheckedChange={(checked) => handleSelectAll(!!checked)} />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No transactions.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} data-state={selectedIds.includes(transaction.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={(checked) => onSelectionChange(transaction.id, !!checked)}
                      aria-label={`Select transaction ${transaction.id}`}
                    />
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={cn('text-right font-mono', transaction.type === 'credit' ? 'text-green-500' : 'text-destructive')}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export function ReconciliationClientPage({ initialSystemTransactions }: ReconciliationClientPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [bankTransactions, setBankTransactions] = useState<Transaction[]>([]);
  const [systemTransactions, setSystemTransactions] = useState<Transaction[]>(initialSystemTransactions);
  const [reconciled, setReconciled] = useState<{ bank: Transaction[]; system: Transaction[] }[]>([]);

  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [selectedSystemIds, setSelectedSystemIds] = useState<string[]>([]);
  
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ReconciliationOutput['suggestions']>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAiSuggestions([]);
    setAiError(null);

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
            toast({
                variant: 'destructive',
                title: 'CSV Parsing Error',
                description: results.errors[0].message,
            });
            return;
        }
        
        const firstRow = results.data[0];
        if (!firstRow || !firstRow.Date || !firstRow.Description || !firstRow.Amount) {
             toast({
                variant: 'destructive',
                title: 'Invalid CSV Format',
                description: "CSV must contain 'Date', 'Description', and 'Amount' columns.",
            });
            return;
        }

        const parsedTransactions: Transaction[] = results.data.map((row: any, index: number) => {
            const amount = parseFloat(row.Amount);
            return {
                id: `BANK-${Date.now()}-${index}`,
                date: new Date(row.Date).toISOString().split('T')[0],
                description: row.Description,
                amount: Math.abs(amount),
                type: amount >= 0 ? 'credit' : 'debit',
            };
        }).filter(tx => tx.description && !isNaN(tx.amount));
        
        setBankTransactions(parsedTransactions);
        toast({
            title: 'Statement Uploaded',
            description: `${parsedTransactions.length} transactions were successfully parsed.`,
        });
      },
      error: (error) => {
           toast({
              variant: 'destructive',
              title: 'File Read Error',
              description: error.message,
          });
      }
    });
  };
  
  const handleSelectionChange = (list: 'bank' | 'system', id: string, isSelected: boolean) => {
    const setter = list === 'bank' ? setSelectedBankIds : setSelectedSystemIds;
    setter(prev => isSelected ? [...prev, id] : prev.filter(pId => pId !== id));
  };
  
  const handleAiMatch = async () => {
    setIsAiMatching(true);
    setAiSuggestions([]);
    setAiError(null);
    
    // Convert system transaction types for the AI
    const systemTxsForAI = systemTransactions.map(tx => ({...tx, type: tx.type === 'credit' ? 'debit' : 'credit'}));

    const result = await suggestMatchesAction({
        bankTransactions: bankTransactions,
        systemTransactions: systemTxsForAI,
    });
    
    if ('error' in result) {
      setAiError(result.error);
    } else {
      setAiSuggestions(result.suggestions);
    }
    
    setIsAiMatching(false);
  };
  
  const handleApplySuggestion = (suggestion: ReconciliationOutput['suggestions'][0]) => {
    setSelectedBankIds(prev => [...new Set([...prev, ...suggestion.bankTransactionIds])]);
    setSelectedSystemIds(prev => [...new Set([...prev, ...suggestion.systemTransactionIds])]);
    setAiSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const selectedTotals = useMemo(() => {
    const calculateTotal = (transactions: Transaction[], ids: string[]) => 
      transactions.filter(tx => ids.includes(tx.id))
        .reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
    
    const bankTotal = calculateTotal(bankTransactions, selectedBankIds);
    const systemTotal = calculateTotal(systemTransactions, selectedSystemIds);
    
    return { bankTotal, systemTotal, difference: bankTotal + systemTotal };
  }, [bankTransactions, systemTransactions, selectedBankIds, selectedSystemIds]);

  const canReconcile = selectedBankIds.length > 0 && selectedSystemIds.length > 0 && Math.abs(selectedTotals.difference) < 0.01;

  const handleReconcile = () => {
    const matchedBankTxs = bankTransactions.filter(tx => selectedBankIds.includes(tx.id));
    const matchedSystemTxs = systemTransactions.filter(tx => selectedSystemIds.includes(tx.id));
    
    setReconciled(prev => [...prev, { bank: matchedBankTxs, system: matchedSystemTxs }]);
    
    setBankTransactions(prev => prev.filter(tx => !selectedBankIds.includes(tx.id)));
    setSystemTransactions(prev => prev.filter(tx => !selectedSystemIds.includes(tx.id)));

    setSelectedBankIds([]);
    setSelectedSystemIds([]);
  };

  const { bankBalance, systemBalance } = useMemo(() => {
      const bankBal = bankTransactions.reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
      const systemBal = systemTransactions.reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
      return { bankBalance: bankBal, systemBalance: systemBal };
  }, [bankTransactions, systemTransactions]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Summary</CardTitle>
          <CardDescription>Statement period ending August 1, 2024</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground">Unreconciled Bank Balance</p><p className="text-2xl font-bold">${bankBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p></div>
            <div className="p-4 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground">Unreconciled System Balance</p><p className="text-2xl font-bold">${systemBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p></div>
            <div className={cn('p-4 rounded-lg', Math.abs(bankBalance + systemBalance) > 0.01 ? 'bg-destructive/20' : 'bg-green-500/20')}><p className="text-sm text-muted-foreground">Difference</p><p className="text-2xl font-bold">${(bankBalance + systemBalance).toLocaleString('en-US', {minimumFractionDigits: 2})}</p></div>
        </CardContent>
      </Card>
      
      {bankTransactions.length === 0 ? (
        <Card className="text-center">
            <CardHeader><CardTitle>Get Started</CardTitle></CardHeader>
            <CardContent>
              <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
                  <p className="text-muted-foreground">Click the button to upload your bank statement and begin reconciling.</p>
                   <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".csv" />
                  <Button onClick={handleFileUploadClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Statement
                  </Button>
              </div>
            </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Match Transactions</CardTitle>
              <CardDescription>Select transactions from both sides that match. Amounts must balance to reconcile.</CardDescription>
            </div>
            <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
                <Button variant="outline" onClick={handleAiMatch} disabled={isAiMatching || bankTransactions.length === 0 || systemTransactions.length === 0}>
                    {isAiMatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isAiMatching ? 'Analyzing...' : 'Find Matches with AI'}
                </Button>
                <div className="flex items-center gap-4 p-2 rounded-lg bg-muted/50">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Selected Difference</p>
                      <p className={cn('font-bold text-lg', Math.abs(selectedTotals.difference) > 0.01 ? 'text-destructive' : 'text-green-500')}>
                        ${selectedTotals.difference.toFixed(2)}
                      </p>
                    </div>
                    <Button onClick={handleReconcile} disabled={!canReconcile}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Reconcile
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <TransactionTable
              title="Bank Statement Transactions"
              transactions={bankTransactions}
              selectedIds={selectedBankIds}
              onSelectionChange={(id, isSelected) => handleSelectionChange('bank', id, isSelected)}
            />
            <TransactionTable
              title="System Transactions"
              transactions={systemTransactions}
              selectedIds={selectedSystemIds}
              onSelectionChange={(id, isSelected) => handleSelectionChange('system', id, isSelected)}
            />
          </CardContent>
        </Card>
      )}

      {aiError && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>AI Matching Failed</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
        </Alert>
      )}
      
      {aiSuggestions.length > 0 && (
         <Card>
            <CardHeader><CardTitle>AI Suggestions</CardTitle><CardDescription>Review and apply these potential matches found by our AI.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions.map((suggestion, index) => {
                 const bankItems = suggestion.bankTransactionIds.map(id => bankTransactions.find(tx => tx.id === id)).filter(Boolean) as Transaction[];
                 const systemItems = suggestion.systemTransactionIds.map(id => systemTransactions.find(tx => tx.id === id)).filter(Boolean) as Transaction[];
                return (
                    <div key={index} className="border p-4 rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start">
                           <div>
                             <p className="font-semibold text-primary">Suggested Match</p>
                             <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                           </div>
                           <Button size="sm" onClick={() => handleApplySuggestion(suggestion)}>Apply Match</Button>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium mb-1">Bank Item(s)</p>
                                <ul className="space-y-1">
                                    {bankItems.map(item => (
                                        <li key={item.id} className="flex justify-between"><span>{item.description}</span> <span className="font-mono">${item.amount.toFixed(2)}</span></li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <p className="font-medium mb-1">System Item(s)</p>
                                 <ul className="space-y-1">
                                    {systemItems.map(item => (
                                        <li key={item.id} className="flex justify-between"><span>{item.description}</span> <span className="font-mono">${item.amount.toFixed(2)}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )
              })}
            </CardContent>
          </Card>
      )}

      {reconciled.length > 0 && (
         <Card>
            <CardHeader><CardTitle>Reconciled Items</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank Transactions</TableHead>
                    <TableHead>Matched System Transactions</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciled.map((pair, index) => (
                    <TableRow key={index}>
                      <TableCell>
                         <ul className="space-y-1">
                          {pair.bank.map(tx => <li key={tx.id}>{tx.description}<br/><span className="text-xs text-muted-foreground">{tx.date}</span></li>)}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <ul className="space-y-1">
                          {pair.system.map(tx => <li key={tx.id}>{tx.description}<br/><span className="text-xs text-muted-foreground">{tx.date}</span></li>)}
                        </ul>
                      </TableCell>
                      <TableCell className="text-right font-mono">${pair.bank.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}
    </div>
  );
}

    