import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Transaction {
    id: number;
    transaction_reference: string;
    transaction_type: string;
    amount: number;
    total_amount: number;
    currency_code: string;
    payer_account_name: string;
    recipient_account_name: string;
    transaction_datetime: string;
    is_active: boolean;
}

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
    const formatCurrency = (amount: number, code: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
        }).format(amount);
    };

    const formatDate = (datetime: string) => {
        return new Date(datetime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4">
            {transactions.map((transaction) => (
                <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className="font-mono text-xs text-muted-foreground">
                            #{transaction.id}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{transaction.transaction_reference}</p>
                            <p className="text-xs text-muted-foreground">
                                {transaction.payer_account_name} → {transaction.recipient_account_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">
                            {transaction.transaction_type}
                        </Badge>
                        <div className="text-right min-w-[100px]">
                            <p className="text-sm font-medium">
                                {formatCurrency(transaction.total_amount, transaction.currency_code)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(transaction.transaction_datetime)}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
