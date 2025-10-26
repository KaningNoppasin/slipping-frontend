"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

export function StatsCard({
    title,
    value,
    change,
    trend,
    icon
}: {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                        {change}
                    </span>
                    <span>from last month</span>
                </p>
            </CardContent>
        </Card>
    );
}