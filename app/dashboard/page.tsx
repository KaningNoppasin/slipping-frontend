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
    Users,
    CreditCard,
    Activity
} from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentSalesList } from "@/components/dashboard/recent-sales-list";
import { TransactionsTable } from "@/components/dashboard/transactions-table";

export default function DashboardPage() {
    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;
    const { settings, setSettings } = sidebar;
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
                    {/* Stats Cards Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Revenue"
                            value="$45,231.89"
                            change="+20.1%"
                            trend="up"
                            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                        />
                        <StatsCard
                            title="Active Users"
                            value="2,350"
                            change="+180.1%"
                            trend="up"
                            icon={<Users className="h-4 w-4 text-muted-foreground" />}
                        />
                        <StatsCard
                            title="Sales"
                            value="+12,234"
                            change="+19%"
                            trend="up"
                            icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
                        />
                        <StatsCard
                            title="Active Now"
                            value="573"
                            change="-5%"
                            trend="down"
                            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                        />
                    </div>

                    {/* Charts and Recent Activity */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Overview Chart Card */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>
                                    Revenue overview for the last 6 months
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    Chart placeholder - Install recharts for actual charts
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Sales Card */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Sales</CardTitle>
                                <CardDescription>
                                    You made 265 sales this month
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentSalesList />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                A list of your recent transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TransactionsTable />
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>
        </ContentLayout>
    );
}