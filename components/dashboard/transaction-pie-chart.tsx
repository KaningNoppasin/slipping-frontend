"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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

interface TransactionPieChartProps {
    data: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    totalTransactions: number;
}

export function TransactionPieChart({ data, totalTransactions }: TransactionPieChartProps) {
    // Transform data to match the chart format
    const chartData = data.map((item, index) => ({
        type: item.type.toLowerCase(),
        count: item.count,
        fill: `var(--color-${item.type.toLowerCase()})`,
    }));

    // Create dynamic chart config based on transaction types
    const chartConfig = data.reduce((config, item) => {
        const key = item.type.toLowerCase();
        config[key] = {
            label: item.type,
            color: `var(--chart-${(data.indexOf(item) % 5) + 1})`,
        };
        return config;
    }, {
        count: {
            label: "Transactions",
        },
    } as ChartConfig);

    // Calculate growth percentage (you can make this dynamic based on historical data)
    const growthPercentage = 12.5; // Mock growth - replace with real calculation

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Transaction Distribution</CardTitle>
                <CardDescription>Current Period Overview</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="type"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={0}
                            activeShape={({
                                outerRadius = 0,
                                ...props
                            }: PieSectorDataItem) => (
                                <Sector {...props} outerRadius={outerRadius + 10} />
                            )}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
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
