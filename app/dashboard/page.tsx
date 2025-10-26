"use client";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    Activity,
    Users
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions-list";
import { TransactionsTable } from "@/components/dashboard/transactions-table";

// Mock transaction data based on your schema
const mockTransactions = [
    {
        id: 1,
        transaction_reference: "TXN-2025-001",
        transaction_type: "transfer",
        currency_code: "USD",
        amount: 1250.00,
        external_fee: 5.00,
        total_amount: 1255.00,
        transaction_datetime: "2025-10-26T10:30:00",
        payer_account_name: "John Doe",
        recipient_account_name: "Jane Smith",
        is_active: true,
    },
    {
        id: 2,
        transaction_reference: "TXN-2025-002",
        transaction_type: "transfer",
        currency_code: "USD",
        amount: 850.50,
        external_fee: 3.50,
        total_amount: 854.00,
        transaction_datetime: "2025-10-25T15:45:00",
        payer_account_name: "Alice Brown",
        recipient_account_name: "Bob Wilson",
        is_active: true,
    },
    {
        id: 3,
        transaction_reference: "TXN-2025-003",
        transaction_type: "payment",
        currency_code: "EUR",
        amount: 2100.00,
        external_fee: 10.00,
        total_amount: 2110.00,
        transaction_datetime: "2025-10-24T09:15:00",
        payer_account_name: "Charlie Davis",
        recipient_account_name: "Tech Solutions Ltd",
        is_active: true,
    },
    {
        id: 4,
        transaction_reference: "TXN-2025-004",
        transaction_type: "refund",
        currency_code: "GBP",
        amount: 450.75,
        external_fee: 2.25,
        total_amount: 453.00,
        transaction_datetime: "2025-10-23T14:20:00",
        payer_account_name: "Emma Johnson",
        recipient_account_name: "Michael Chen",
        is_active: true,
    },
];

// Calculate transaction metrics
const calculateMetrics = () => {
    const totalTransactions = mockTransactions.length;
    const totalVolume = mockTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    const totalFees = mockTransactions.reduce((sum, t) => sum + t.external_fee, 0);
    const activeTransactions = mockTransactions.filter(t => t.is_active).length;

    // Calculate average transaction value
    const avgTransactionValue = totalVolume / totalTransactions;

    // Group by transaction type
    const transactionsByType = mockTransactions.reduce((acc, t) => {
        acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalTransactions,
        totalVolume,
        totalFees,
        activeTransactions,
        avgTransactionValue,
        transactionsByType,
    };
};

// Helper function to format currency
const formatCurrency = (amount: number, currencyCode: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
};

export default function DashboardPage() {
    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;

    const metrics = calculateMetrics();

    return (
        <ContentLayout title="Dashboard">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <TooltipProvider>
                <div className="space-y-4 pt-3">
                    {/* Transaction Stats Cards Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Transaction Volume"
                            value={formatCurrency(metrics.totalVolume)}
                            change="+20.1%"
                            trend="up"
                            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                        />
                        <StatsCard
                            title="Total Transactions"
                            value={metrics.totalTransactions.toString()}
                            change="+12.5%"
                            trend="up"
                            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                        />
                        <StatsCard
                            title="Average Transaction"
                            value={formatCurrency(metrics.avgTransactionValue)}
                            change="+8.2%"
                            trend="up"
                            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                        />
                        <StatsCard
                            title="Total Fees Collected"
                            value={formatCurrency(metrics.totalFees)}
                            change="+5.4%"
                            trend="up"
                            icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
                        />
                    </div>

                    {/* Transaction Analysis and Recent Activity */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Transaction Type Distribution */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Transaction Distribution</CardTitle>
                                <CardDescription>
                                    Breakdown by transaction type
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(metrics.transactionsByType).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <span className="text-sm font-medium capitalize">{type}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground">
                                                    {count} transactions
                                                </span>
                                                <span className="text-sm font-semibold">
                                                    {((count / metrics.totalTransactions) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 text-sm text-muted-foreground">
                                        <p>Chart visualization coming soon - Install recharts for charts</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Transactions Summary */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Latest {mockTransactions.length} transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentTransactionsList transactions={mockTransactions.slice(0, 5)} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transactions Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>All Transactions</CardTitle>
                                    <CardDescription>
                                        Complete list of recent transactions
                                    </CardDescription>
                                </div>
                                <Link href="/transactions">
                                    <button className="text-sm text-primary hover:underline">
                                        View All →
                                    </button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TransactionsTable transactions={mockTransactions} />
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>
        </ContentLayout>
    );
}
