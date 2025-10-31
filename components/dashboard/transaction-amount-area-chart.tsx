"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
    transaction_reference: string;
    transaction_type: string;
    currency_code: string;
    amount: number;
    external_fee: number;
    total_amount: number;
    transaction_datetime: string;
    description: string;
    payer_account_name: string;
    recipient_account_name: string;
    recipient_account_number: string;
    recipient_bank_name: string;
}

interface TransactionAmountAreaChartProps {
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

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

// Custom Tooltip Component
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
                        Date & Time
                    </span>
                    <span className="font-bold text-foreground">
                        {data.datetime}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Amount
                    </span>
                    <span className="font-bold text-foreground">
                        {formatFullCurrency(data.amount)}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Recipient
                    </span>
                    <span className="font-bold text-foreground">
                        {data.recipient || "N/A"}
                    </span>
                </div>
                {data.recipientBank && (
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Bank
                        </span>
                        <span className="font-medium text-muted-foreground text-sm">
                            {data.recipientBank}
                        </span>
                    </div>
                )}
                {data.recipientAccount && (
                    <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Account
                        </span>
                        <span className="font-medium text-muted-foreground text-sm">
                            {data.recipientAccount}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export function TransactionAmountAreaChart({
    transactions
}: TransactionAmountAreaChartProps) {
    // Sort transactions by datetime and prepare chart data with recipient info
    const chartData = transactions
        .sort((a, b) =>
            new Date(a.transaction_datetime).getTime() -
            new Date(b.transaction_datetime).getTime()
        )
        .map((transaction, index) => ({
            datetime: formatDate(transaction.transaction_datetime),
            amount: transaction.total_amount,
            type: transaction.transaction_type,
            reference: transaction.transaction_reference,
            recipient: transaction.recipient_account_name || "Unknown",
            recipientAccount: transaction.recipient_account_number,
            recipientBank: transaction.recipient_bank_name,
            fullDate: transaction.transaction_datetime,
            index: index + 1,
        }));

    // Calculate total and average
    const totalAmount = transactions.reduce((sum, t) => sum + t.total_amount, 0);
    const averageAmount = totalAmount / transactions.length;
    const maxAmount = Math.max(...transactions.map(t => t.total_amount));

    const chartConfig = {
        amount: {
            label: "Transaction Amount",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Amounts Over Time</CardTitle>
                <CardDescription>
                    Showing total amount for each transaction chronologically
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
                            <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-amount)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-amount)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            opacity={0.3}
                        />
                        <XAxis
                            dataKey="datetime"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.split(",")[0]}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <ChartTooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={<CustomTooltip />}
                        />
                        <Area
                            dataKey="amount"
                            type="natural"
                            fill="url(#fillAmount)"
                            fillOpacity={0.4}
                            stroke="var(--color-amount)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Average transaction: {formatCurrency(averageAmount)}{" "}
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Total volume: {formatCurrency(totalAmount)} across{" "}
                            {transactions.length} transactions
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
