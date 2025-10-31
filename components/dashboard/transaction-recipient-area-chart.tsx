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
    transaction_type: string;
    total_amount: number;
    transaction_datetime: string;
    recipient_account_name: string;
    recipient_account_number: string;
    recipient_bank_name: string;
}

interface TransactionRecipientAreaChartProps {
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

// Generate consistent colors for recipients
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

export function TransactionRecipientAreaChart({
    transactions
}: TransactionRecipientAreaChartProps) {
    // Get unique recipients (top 5 by total amount)
    const recipientTotals = transactions.reduce((acc, transaction) => {
        const recipient = transaction.recipient_account_name || "Unknown";
        acc[recipient] = (acc[recipient] || 0) + transaction.total_amount;
        return acc;
    }, {} as Record<string, number>);

    const topRecipients = Object.entries(recipientTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

    // Group transactions by date and recipient
    const groupedData = transactions.reduce((acc, transaction) => {
        const dateKey = formatDate(transaction.transaction_datetime);
        const recipient = transaction.recipient_account_name || "Unknown";

        // Only include top 5 recipients
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

    // Convert to array and sort by date
    const chartData = Object.values(groupedData).sort((a, b) =>
        new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );

    // Generate chart config dynamically for recipients
    const chartConfig: ChartConfig = topRecipients.reduce((config, recipient, index) => {
        const key = recipient;
        config[key] = {
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
                <CardTitle>Transaction Amounts by Recipient</CardTitle>
                <CardDescription>
                    Showing transaction amounts for top 5 recipients over time
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
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={generateColor(index)}
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
                            angle={-45}
                            textAnchor="end"
                            height={80}
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
                                fillOpacity={0.4}
                                stroke={generateColor(index)}
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
                            Total to top 5 recipients: {formatCurrency(totalAmount)} <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Showing {topRecipients.length} recipients
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
