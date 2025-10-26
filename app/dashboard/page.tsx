"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
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
    Loader2
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions-list";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { TransactionChart } from "@/components/dashboard/transaction-chart";
import { TransactionPieChart } from "@/components/dashboard/transaction-pie-chart";
import { toast } from "sonner";

// TypeScript interfaces
interface Transaction {
    id: number;
    transaction_reference: string;
    transaction_type: string;
    currency_code: string;
    amount: number;
    external_fee: number;
    total_amount: number;
    transaction_datetime: string;
    description: string;
    image_path: string;
    initiated_by_user_id: number;
    payer_account_number: string;
    payer_account_name: string;
    payer_bank_name: string;
    recipient_account_number: string;
    recipient_account_name: string;
    recipient_bank_name: string;
    request_id: string;
    correlation_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface TransactionsResponse {
    success: boolean;
    data: Transaction[];
    message: string;
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
    timestamp: string;
}

interface Metrics {
    totalTransactions: number;
    totalVolume: number;
    totalFees: number;
    activeTransactions: number;
    avgTransactionValue: number;
    transactionsByType: Record<string, number>;
}

interface ChartData {
    type: string;
    count: number;
    percentage: number;
}

const formatCurrency = (amount: number, currencyCode: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
};

export default function DashboardPage() {
    const sidebar = useStore(useSidebar, (x) => x);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090/api/v1';

    const calculateMetrics = (transactionData: Transaction[]): Metrics => {
        const totalTransactions = transactionData.length;
        const totalVolume = transactionData.reduce((sum, t) => sum + t.total_amount, 0);
        const totalFees = transactionData.reduce((sum, t) => sum + t.external_fee, 0);
        const activeTransactions = transactionData.filter(t => t.is_active).length;

        const avgTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

        const transactionsByType = transactionData.reduce((acc, t) => {
            const type = t.transaction_type.toLowerCase();
            acc[type] = (acc[type] || 0) + 1;
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

    const prepareChartData = (transactionsByType: Record<string, number>, total: number): ChartData[] => {
        return Object.entries(transactionsByType).map(([type, count]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count,
            percentage: parseFloat(((count / total) * 100).toFixed(1)),
        }));
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<TransactionsResponse>(
                `${API_BASE_URL}/transactions`,
                {
                    params: {
                        limit: 10,
                        offset: 0,
                    },
                    headers: {
                        'X-Request-ID': crypto.randomUUID(),
                    },
                }
            );

            if (response.data.success) {
                setTransactions(response.data.data);
                const calculatedMetrics = calculateMetrics(response.data.data);
                setMetrics(calculatedMetrics);

                const preparedChartData = prepareChartData(
                    calculatedMetrics.transactionsByType,
                    calculatedMetrics.totalTransactions
                );
                setChartData(preparedChartData);
            } else {
                throw new Error(response.data.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'An unexpected error occurred';

            setError(errorMessage);
            toast.error(`Failed to load dashboard: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const interval = setInterval(() => {
            fetchDashboardData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (!sidebar) return null;

    if (loading && !metrics) {
        return (
            <ContentLayout title="Dashboard">
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
                </div>
            </ContentLayout>
        );
    }

    if (error && !metrics) {
        return (
            <ContentLayout title="Dashboard">
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <p className="text-destructive mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            </ContentLayout>
        );
    }

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
                    {metrics && (
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
                    )}

                    {/* Charts Row */}
                    {chartData.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Bar Chart */}
                            <TransactionChart
                                data={chartData}
                                totalTransactions={metrics?.totalTransactions ?? 0}
                            />

                            {/* Donut Chart */}
                            <TransactionPieChart
                                data={chartData}
                                totalTransactions={metrics?.totalTransactions ?? 0}
                            />
                        </div>
                    )}

                    {/* Recent Transactions Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                Latest transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transactions.length > 0 ? (
                                <RecentTransactionsList transactions={transactions.slice(0, 5)} />
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    No recent transactions
                                </p>
                            )}
                        </CardContent>
                    </Card>

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
                                <div className="flex items-center gap-4">
                                    {loading && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    <Link href="/transactions">
                                        <button className="text-sm text-primary hover:underline">
                                            View All →
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {transactions.length > 0 ? (
                                <TransactionsTable transactions={transactions} />
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground mb-4">No transactions found</p>
                                    <Link href="/transactions/new">
                                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                                            Create First Transaction
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>
        </ContentLayout>
    );
}
