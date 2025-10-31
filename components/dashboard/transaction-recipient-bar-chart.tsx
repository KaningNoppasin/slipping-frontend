"use client";

import { TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
    recipient_account_number: string;
    recipient_bank_name: string;
}

interface TransactionRecipientBarChartProps {
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

const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

// Shorten recipient name for display
const shortenName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
};

export function TransactionRecipientBarChart({
    transactions
}: TransactionRecipientBarChartProps) {
    // Calculate total amount per recipient
    const recipientTotals = transactions.reduce((acc, transaction) => {
        const recipient = transaction.recipient_account_name || "Unknown";
        const recipientBank = transaction.recipient_bank_name || "";
        const recipientAccount = transaction.recipient_account_number || "";

        if (!acc[recipient]) {
            acc[recipient] = {
                name: recipient,
                totalAmount: 0,
                transactionCount: 0,
                bank: recipientBank,
                account: recipientAccount,
            };
        }

        acc[recipient].totalAmount += transaction.total_amount;
        acc[recipient].transactionCount += 1;

        return acc;
    }, {} as Record<string, any>);

    // Get top 10 recipients by total amount and format for chart
    const chartData = Object.values(recipientTotals)
        .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
        .slice(0, 10)
        .map((recipient: any) => ({
            recipient: shortenName(recipient.name, 25),
            fullName: recipient.name,
            amount: recipient.totalAmount,
            count: recipient.transactionCount,
            bank: recipient.bank,
            account: recipient.account,
        }));

    const chartConfig = {
        amount: {
            label: "Total Amount",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);
    const totalTransactions = chartData.reduce((sum, item) => sum + item.count, 0);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) {
            return null;
        }

        const data = payload[0].payload;

        return (
            <div className="rounded-lg border bg-background p-3 shadow-lg">
                <div className="grid gap-2">
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Recipient
                        </span>
                        <span className="font-bold text-foreground">
                            {data.fullName}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Total Amount
                        </span>
                        <span className="font-bold text-foreground">
                            {formatFullCurrency(data.amount)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Transactions
                        </span>
                        <span className="font-medium text-muted-foreground">
                            {data.count} transaction{data.count !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {data.bank && (
                        <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Bank
                            </span>
                            <span className="font-medium text-muted-foreground text-sm">
                                {data.bank}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Recipients by Transaction Amount</CardTitle>
                <CardDescription>
                    Showing top 10 recipients ranked by total transaction amount
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
                            right: 20,
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
                            content={<CustomTooltip />}
                        />
                        <Bar
                            dataKey="amount"
                            fill="var(--color-amount)"
                            radius={5}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Total to top 10: {formatCurrency(totalAmount)} <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {chartData.length} recipients • {totalTransactions} transactions
                </div>
            </CardFooter>
        </Card>
    );
}
