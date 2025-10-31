"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface Transaction {
    id: number;
    transaction_type: string;
    total_amount: number;
    transaction_datetime: string;
}

interface TransactionTypeAreaChartProps {
    transactions: Transaction[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short",
    }).format(value);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
};

export function TransactionTypeAreaChart({
    transactions
}: TransactionTypeAreaChartProps) {
    // Get unique transaction types
    const transactionTypes = Array.from(
        new Set(transactions.map(t => t.transaction_type.toLowerCase()))
    );

    // Group transactions by date and type
    const groupedData = transactions.reduce((acc, transaction) => {
        const dateKey = formatDate(transaction.transaction_datetime);
        const type = transaction.transaction_type.toLowerCase();

        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, fullDate: transaction.transaction_datetime };
            transactionTypes.forEach(t => {
                acc[dateKey][t] = 0;
            });
        }

        acc[dateKey][type] += transaction.total_amount;
        return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    const chartData = Object.values(groupedData).sort((a, b) =>
        new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );

    // Generate chart config dynamically
    const chartConfig: ChartConfig = transactionTypes.reduce((config, type, index) => {
        config[type] = {
            label: type.charAt(0).toUpperCase() + type.slice(1),
            color: `hsl(var(--chart-${index + 1}))`,
        };
        return config;
    }, {} as ChartConfig);

    const totalAmount = transactions.reduce((sum, t) => sum + t.total_amount, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Amounts by Type</CardTitle>
                <CardDescription>
                    Comparing transaction amounts across different types over time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <defs>
                            {transactionTypes.map((type, index) => (
                                <linearGradient key={type} id={`fill${type}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={`hsl(var(--chart-${index + 1}))`}
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={`hsl(var(--chart-${index + 1}))`}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dot"
                                    formatter={(value) => formatCurrency(Number(value))}
                                />
                            }
                        />
                        <Legend />
                        {transactionTypes.map((type, index) => (
                            <Area
                                key={type}
                                dataKey={type}
                                type="natural"
                                fill={`url(#fill${type})`}
                                fillOpacity={0.4}
                                stroke={`hsl(var(--chart-${index + 1}))`}
                                strokeWidth={2}
                                stackId="1"
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Total volume: {formatCurrency(totalAmount)} <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Across {transactionTypes.length} transaction types
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
