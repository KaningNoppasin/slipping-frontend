
import { Badge } from "@/components/ui/badge";

export function TransactionsTable() {
    const transactions = [
        { id: "TRX001", customer: "John Doe", status: "completed", amount: "$250.00", date: "2025-10-25" },
        { id: "TRX002", customer: "Jane Smith", status: "pending", amount: "$150.00", date: "2025-10-24" },
        { id: "TRX003", customer: "Bob Johnson", status: "completed", amount: "$350.00", date: "2025-10-23" },
        { id: "TRX004", customer: "Alice Brown", status: "failed", amount: "$450.00", date: "2025-10-22" },
        { id: "TRX005", customer: "Charlie Wilson", status: "completed", amount: "$550.00", date: "2025-10-21" }
    ];

    return (
        <div className="space-y-4">
            {transactions.map((transaction) => (
                <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm font-medium">{transaction.id}</p>
                            <p className="text-sm text-muted-foreground">{transaction.customer}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge
                            variant={
                                transaction.status === "completed" ? "default" :
                                    transaction.status === "pending" ? "secondary" :
                                        "destructive"
                            }
                        >
                            {transaction.status}
                        </Badge>
                        <p className="text-sm font-medium w-24 text-right">{transaction.amount}</p>
                        <p className="text-sm text-muted-foreground w-24 text-right">{transaction.date}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
