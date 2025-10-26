"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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

interface TransactionChartProps {
    data: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    totalTransactions: number;
}

export function TransactionChart({ data, totalTransactions }: TransactionChartProps) {
    // Transform data to match the chart format
    const chartData = data.map((item) => ({
        type: item.type,
        count: item.count,
    }));

    // Create dynamic chart config
    const chartConfig = {
        count: {
            label: "Transactions",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    // Calculate growth percentage (you can make this dynamic)
    const growthPercentage = 12.5; // Mock growth - replace with real calculation

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Transaction count by type</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="type"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                                value.length > 8 ? value.slice(0, 8) + "..." : value
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            radius={8}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by {growthPercentage}% this month{" "}
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing {totalTransactions} total transactions
                </div>
            </CardFooter>
        </Card>
    );
}
