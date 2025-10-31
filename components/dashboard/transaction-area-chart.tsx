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

interface ChartData {
    type: string;
    count: number;
    percentage: number;
}

interface TransactionAreaChartProps {
    data: ChartData[];
    totalTransactions: number;
}

export function TransactionAreaChart({ data, totalTransactions }: TransactionAreaChartProps) {
    // Transform data for area chart
    const chartData = data.map((item) => ({
        transactionType: item.type,
        count: item.count,
        percentage: item.percentage,
    }));

    // Generate dynamic chart config based on transaction types
    const chartConfig: ChartConfig = data.reduce((config, item, index) => {
        const key = item.type.toLowerCase();
        config[key] = {
            label: item.type,
            color: `var(--chart-${index + 1})`,
        };
        return config;
    }, {} as ChartConfig);

    // Calculate growth percentage (you can customize this based on your data)
    const growthPercentage = "+12.5%";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Volume by Type</CardTitle>
                <CardDescription>
                    Showing transaction distribution across all types
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
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="transactionType"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 8)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.toString()}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <defs>
                            {data.map((item, index) => (
                                <linearGradient
                                    key={item.type}
                                    id={`fill${item.type}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={`var(--chart-${index + 1})`}
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={`var(--chart-${index + 1})`}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        <Area
                            dataKey="count"
                            type="natural"
                            fill="url(#fillDeposit)"
                            fillOpacity={0.4}
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Transaction volume trending up by {growthPercentage} <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Total: {totalTransactions} transactions
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
