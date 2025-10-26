
"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function RecentSalesList() {
    const sales = [
        {
            name: "Olivia Martin",
            email: "olivia.martin@email.com",
            amount: "+$1,999.00",
            avatar: "OM"
        },
        {
            name: "Jackson Lee",
            email: "jackson.lee@email.com",
            amount: "+$39.00",
            avatar: "JL"
        },
        {
            name: "Isabella Nguyen",
            email: "isabella.nguyen@email.com",
            amount: "+$299.00",
            avatar: "IN"
        },
        {
            name: "William Kim",
            email: "will@email.com",
            amount: "+$99.00",
            avatar: "WK"
        },
        {
            name: "Sofia Davis",
            email: "sofia.davis@email.com",
            amount: "+$39.00",
            avatar: "SD"
        }
    ];

    return (
        <div className="space-y-8">
            {sales.map((sale, index) => (
                <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{sale.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.name}</p>
                        <p className="text-sm text-muted-foreground">{sale.email}</p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                </div>
            ))}
        </div>
    );
}