"use client";

import { TrendingUp, Users } from "lucide-react";
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
    total_amount: number;
    transaction_datetime: string;
    recipient_account_name: string;
}

interface TransactionRecipientOverlayChartProps {
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

const generateColor = (index: number) => {
    const colors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ];
    return colors[index % colors.length];
};

export function TransactionRecipientOverlayChart({
    transactions
}: TransactionRecipientOverlayChartProps) {
    // Get top 3 recipients by total amount (fewer for overlay chart)
    const recipientTotals = transactions.reduce((acc, transaction) => {
        const recipient = transaction.recipient_account_name || "Unknown";
        acc[recipient] = (acc[recipient] || 0) + transaction.total_amount;
        return acc;
    }, {} as Record<string, number>);

    const topRecipients = Object.entries(recipientTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

    // Group transactions by date and recipient
    const groupedData = transactions.reduce((acc, transaction) => {
        const dateKey = formatDate(transaction.transaction_datetime);
        const recipient = transaction.recipient_account_name || "Unknown";

        if (!topRecipients.includes(recipient)) return acc;

        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: dateKey,
                fullDate: transaction.transaction_datetime
            };
            topRecipients.forEach(r => {
                acc[dateKey][r] = 0;
            });
        }

        acc[dateKey][recipient] += transaction.total_amount;
        return acc;
    }, {} as Record<string, any>);

    const chartData = Object.values(groupedData).sort((a, b) =>
        new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );

    const chartConfig: ChartConfig = topRecipients.reduce((config, recipient, index) => {
        config[recipient] = {
            label: recipient,
            color: generateColor(index),
        };
        return config;
    }, {} as ChartConfig);

    const totalAmount = transactions
        .filter(t => topRecipients.includes(t.recipient_account_name || "Unknown"))
        .reduce((sum, t) => sum + t.total_amount, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Recipients Comparison</CardTitle>
                <CardDescription>
                    Comparing transaction amounts for top 3 recipients
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
                            {topRecipients.map((recipient, index) => (
                                <linearGradient
                                    key={recipient}
                                    id={`fillRecipient${index}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={generateColor(index)}
                                        stopOpacity={0.6}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={generateColor(index)}
                                        stopOpacity={0.05}
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
                                    formatter={(value, name) => [
                                        formatCurrency(Number(value)),
                                        name
                                    ]}
                                />
                            }
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                        />
                        {topRecipients.map((recipient, index) => (
                            <Area
                                key={recipient}
                                dataKey={recipient}
                                type="natural"
                                fill={`url(#fillRecipient${index})`}
                                fillOpacity={0.3}
                                stroke={generateColor(index)}
                                strokeWidth={2}
                            // No stackId - creates overlay effect
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Total: {formatCurrency(totalAmount)} <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Top {topRecipients.length} recipients shown
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
