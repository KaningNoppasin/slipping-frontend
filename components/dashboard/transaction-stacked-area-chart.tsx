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

interface TransactionStackedAreaChartProps {
    data: ChartData[];
    totalTransactions: number;
}

export function TransactionStackedAreaChart({
    data,
    totalTransactions
}: TransactionStackedAreaChartProps) {
    // Create a single data point with all transaction types
    const chartData = [
        data.reduce((acc, item) => {
            acc[item.type.toLowerCase()] = item.count;
            return acc;
        }, { name: "Transactions" } as Record<string, string | number>)
    ];

    // Generate chart config
    const chartConfig: ChartConfig = data.reduce((config, item, index) => {
        const key = item.type.toLowerCase();
        config[key] = {
            label: item.type,
            color: `var(--chart-${index + 1})`,
        };
        return config;
    }, {} as ChartConfig);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
                <CardDescription>
                    All transaction types overview
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
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        {data.map((item, index) => (
                            <Area
                                key={item.type}
                                dataKey={item.type.toLowerCase()}
                                type="natural"
                                fill={`var(--chart-${index + 1})`}
                                fillOpacity={0.4}
                                stroke={`var(--chart-${index + 1})`}
                                stackId="a"
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
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
