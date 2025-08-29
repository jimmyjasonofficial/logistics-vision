
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Briefcase,
  FileArchive,
  FilePlus,
  FileText,
  LayoutDashboard,
  PenSquare,
  Plus,
  Receipt,
  Search,
  Shield,
  Truck,
  UserCheck,
  Users,
  Wrench,
  DollarSign,
  ClipboardList,
  Compass,
  User as UserIcon,
  Search as SearchIcon,
  Route,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getInvoices } from '@/services/invoice-service';
import { getPendingLeaveCountAction } from './hr/leave/actions';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { searchAction, type SearchResult } from './search/actions';


function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const router = useRouter();
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<SearchResult[] | null>(null);
    const [loading, setLoading] = React.useState(false);

    const runSearch = React.useCallback(async (q: string) => {
        if (!q) {
            setResults(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        const searchResults = await searchAction(q);
        setResults(searchResults);
        setLoading(false);
    }, []);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            runSearch(query);
        }, 200);

        return () => {
            clearTimeout(handler);
        };
    }, [query, runSearch]);

    const handleSelect = (url: string) => {
        router.push(url);
        onOpenChange(false);
    };

    const getIcon = (type: SearchResult['type']) => {
        switch(type) {
        case 'Page': return <Compass className="mr-2 h-4 w-4" />;
        case 'Customer': return <UserIcon className="mr-2 h-4 w-4" />;
        case 'Trip': return <Truck className="mr-2 h-4 w-4" />;
        case 'Invoice': return <FileText className="mr-2 h-4 w-4" />;
        case 'Expense': return <Receipt className="mr-2 h-4 w-4" />;
        default: return <SearchIcon className="mr-2 h-4 w-4" />;
        }
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput 
                placeholder="Type a command or search..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {loading && <div className="p-4 text-sm text-center text-muted-foreground">Searching...</div>}
                
                {!loading && !results && query && <CommandEmpty>No results found.</CommandEmpty>}

                {results && (
                    <CommandGroup heading="Results">
                        {results.map((result) => (
                            <CommandItem key={`${result.type}-${result.id}`} onSelect={() => handleSelect(result.url)} value={result.title}>
                                {getIcon(result.type)}
                                <span dangerouslySetInnerHTML={{ __html: result.title }}/>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    )
}


// Helper component for collapsible sidebar items
const CollapsibleSidebarItem = ({
  icon,
  title,
  items,
  pathname,
}: {
  icon: React.ReactNode;
  title: string;
  items: { href: string; title: string; badge?: React.ReactNode }[];
  pathname: string;
}) => {
  const isActive = items.some((item) => pathname.startsWith(item.href));

  return (
    <Collapsible defaultOpen={isActive}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton tooltip={title}>
          {icon}
          {title}
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <SidebarMenuSub>
          {items.map((item) => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarMenuSubButton
                asChild
                isActive={pathname.startsWith(item.href)}
              >
                <Link href={item.href}>
                  <span className="truncate">{item.title}</span>
                  {item.badge}
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const singular = (word: string) => {
    if (word === 'payroll') return 'Payroll';
    if (word === 'employees') return 'Employee';
    if (word.endsWith('s')) {
        return word.slice(0, -1);
    }
    return word;
};


const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/trips/planner')) return 'AI Route Planner';
  if (pathname.startsWith('/trips')) return 'Trip Management';
  if (pathname.startsWith('/customers')) return 'Customers';
  if (pathname.startsWith('/documents')) return 'Documents';
  if (pathname.startsWith('/customer-portal')) return 'Customer Portal';
  if (pathname.startsWith('/ai-maintenance')) return 'AI Maintenance Advisor';
  if (pathname.startsWith('/fleet/fuel-efficiency')) return 'Fuel Efficiency';
  if (pathname.startsWith('/fleet/drivers/scorecard')) return 'Driver Scorecard';
  if (pathname.startsWith('/hr/payroll/calculator')) return 'Payroll Calculator';
  if (pathname.startsWith('/search')) return 'Search Results';
  
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const lastSegment = segments[segments.length - 1];
    if (lastSegment === 'new') {
        const noun = singular(segments[segments.length-2]);
        return `Create New ${capitalize(noun)}`;
    }
    if (lastSegment === 'pnl') return 'Profit & Loss';
    if (segments.length > 2 && segments[segments.length-2] === 'edit') {
        const noun = singular(segments[segments.length-3]);
        if(noun === 'payroll' || noun === 'driver') return `Edit ${capitalize(singular(segments[segments.length-4]))}`;
        return `Edit ${capitalize(noun)}`;
    }
    return lastSegment.split('-').map(capitalize).join(' ');
  }
  
  return 'Dashboard'; // Fallback
};


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [showCommandMenu, setShowCommandMenu] = useState(false);


  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowCommandMenu((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])


  useEffect(() => {
    async function fetchCounts() {
      try {
        const invoices = await getInvoices();
        const count = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length;
        setUnpaidInvoicesCount(count);

        const leaveCount = await getPendingLeaveCountAction();
        setPendingLeaveCount(leaveCount);

      } catch (error) {
        console.error("Failed to fetch counts for layout:", error);
      }
    }
    fetchCounts();
  }, [pathname]); // Refetch on path change to keep it fresh

  const isActive = (path: string) => {
    // Avoids matching all routes when path is '/'
    if (path === '/') return pathname === '/';
    // Exact match or a sub-path
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarRail />
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/dashboard')}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <CollapsibleSidebarItem
                icon={<Truck />}
                title="Trip Management"
                pathname={pathname}
                items={[
                  { href: '/trips', title: 'All Trips' },
                  { href: '/trips/planner', title: 'AI Route Planner' },
                ]}
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <CollapsibleSidebarItem
                icon={<Briefcase />}
                title="Fleet Management"
                pathname={pathname}
                items={[
                  { href: '/fleet/vehicles', title: 'Vehicles' },
                  { href: '/fleet/drivers', title: 'Drivers' },
                  { href: '/fleet/drivers/scorecard', title: 'Driver Scorecard' },
                  { href: '/fleet/fuel-efficiency', title: 'Fuel Efficiency' },
                ]}
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/customers')}
                tooltip="Customers"
              >
                <Link href="/customers">
                  <Users />
                  Customers
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <CollapsibleSidebarItem
                icon={<FileText />}
                title="Accounting"
                pathname={pathname}
                items={[
                  { 
                    href: '/accounting/invoices', 
                    title: 'Invoices',
                    badge: unpaidInvoicesCount > 0 && <Badge variant="secondary" className="ml-auto h-5">{unpaidInvoicesCount}</Badge>
                  },
                  { href: '/accounting/quotes', title: 'Quotes' },
                  { href: '/accounting/expenses', title: 'Expenses' },
                  { href: '/accounting/pnl', title: 'Profit & Loss'},
                  {
                    href: '/accounting/reconciliation',
                    title: 'Bank Reconciliation',
                  },
                ]}
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <CollapsibleSidebarItem
                icon={<DollarSign />}
                title="Brokerage"
                pathname={pathname}
                items={[
                  { href: '/brokerage/commissions', title: 'Commissions' },
                  { href: '/brokerage/payouts', title: 'Payouts' },
                ]}
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <CollapsibleSidebarItem
                icon={<ClipboardList />}
                title="HR &amp; Payroll"
                pathname={pathname}
                items={[
                  { href: '/hr/employees', title: 'Employees' },
                  { 
                    href: '/hr/leave', 
                    title: 'Leave Management',
                    badge: pendingLeaveCount > 0 && <Badge variant="secondary" className="ml-auto h-5">{pendingLeaveCount}</Badge>
                  },
                  { href: '/hr/payroll', title: 'Payroll' },
                ]}
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/documents')}
                tooltip="Documents"
              >
                <Link href="/documents">
                  <FileArchive />
                  Documents
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/customer-portal')}
                tooltip="Customer Portal"
              >
                <Link href="/customer-portal">
                  <UserCheck />
                  Customer Portal
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/ai-maintenance')}
                tooltip="AI Maintenance"
              >
                <Link href="/ai-maintenance">
                  <Wrench />
                  AI Maintenance
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <CollapsibleSidebarItem
                icon={<Shield />}
                title="Admin"
                pathname={pathname}
                items={[
                  { href: '/admin/settings', title: 'Settings' },
                  { href: '/admin/roles', title: 'Roles & Permissions' },
                ]}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {/* UserNav is now in the header */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className='flex items-center gap-4'>
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-bold tracking-tight hidden md:block">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    className="h-8 w-full justify-start px-3 text-sm text-muted-foreground md:w-[200px] lg:w-[300px]"
                    onClick={() => setShowCommandMenu(true)}
                >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search...</span>
                    <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add New</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/trips/new">
                                <Truck className="mr-2 h-4 w-4" />
                                <span>New Trip</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                             <Link href="/accounting/invoices/new">
                                <FileText className="mr-2 h-4 w-4" />
                                <span>New Invoice</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                             <Link href="/accounting/expenses/new">
                                <Receipt className="mr-2 h-4 w-4" />
                                <span>New Expense</span>
                             </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/accounting/quotes/new">
                                <FilePlus className="mr-2 h-4 w-4" />
                                <span>New Quote</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                            <Bell className="h-4 w-4" />
                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Invoice #1234 has been paid.
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Trip #5678 has been completed.
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
                            View all
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <UserNav />
            </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
          <CommandMenu open={showCommandMenu} onOpenChange={setShowCommandMenu} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
