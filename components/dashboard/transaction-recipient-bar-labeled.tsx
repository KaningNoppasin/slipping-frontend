"use client";

import { TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";
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
    recipient_account_name: string;
}

interface TransactionRecipientBarLabeledProps {
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

const shortenName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
};

export function TransactionRecipientBarLabeled({
    transactions
}: TransactionRecipientBarLabeledProps) {
    // Calculate total amount per recipient
    const recipientTotals = transactions.reduce((acc, transaction) => {
        const recipient = transaction.recipient_account_name || "Unknown";

        if (!acc[recipient]) {
            acc[recipient] = {
                name: recipient,
                totalAmount: 0,
                transactionCount: 0,
            };
        }

        acc[recipient].totalAmount += transaction.total_amount;
        acc[recipient].transactionCount += 1;

        return acc;
    }, {} as Record<string, any>);

    // Get top 8 recipients (better for labeled bars)
    const chartData = Object.values(recipientTotals)
        .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
        .slice(0, 8)
        .map((recipient: any) => ({
            recipient: shortenName(recipient.name, 25),
            fullName: recipient.name,
            amount: recipient.totalAmount,
            count: recipient.transactionCount,
        }));

    const chartConfig = {
        amount: {
            label: "Total Amount",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Recipients by Amount</CardTitle>
                <CardDescription>
                    Top 8 recipients ranked by total transaction amount
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            left: 20,
                            right: 80,
                            top: 5,
                            bottom: 5,
                        }}
                    >
                        <XAxis
                            type="number"
                            dataKey="amount"
                            hide
                        />
                        <YAxis
                            dataKey="recipient"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={150}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey="amount"
                            fill="var(--color-amount)"
                            radius={5}
                        >
                            <LabelList
                                dataKey="amount"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Combined total: {formatCurrency(totalAmount)} <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Showing top {chartData.length} recipients
                </div>
            </CardFooter>
        </Card>
    );
}
