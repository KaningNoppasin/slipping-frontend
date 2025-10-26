import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
    id: number;
    transaction_reference: string;
    transaction_type: string;
    amount: number;
    currency_code: string;
    payer_account_name: string;
    recipient_account_name: string;
    transaction_datetime: string;
}

export function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
    const formatCurrency = (amount: number, code: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
        }).format(amount);
    };

    return (
        <div className="space-y-4">
            {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {transaction.payer_account_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                → {transaction.recipient_account_name}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">
                            {formatCurrency(transaction.amount, transaction.currency_code)}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize mt-1">
                            {transaction.transaction_type}
                        </Badge>
                    </div>
                </div>
            ))}
        </div>
    );
}
