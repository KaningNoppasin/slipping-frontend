import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Pencil, Trash2, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Mock data for transactions based on your schema
const transactions = [
    {
        id: 1,
        transaction_reference: "TXN-2025-001",
        transaction_type: "transfer",
        currency_code: "USD",
        amount: 1250.00,
        external_fee: 5.00,
        total_amount: 1255.00,
        transaction_datetime: "2025-10-26T10:30:00",
        description: "Payment for services",
        payer_account_number: "1234567890",
        payer_account_name: "John Doe",
        payer_bank_name: "Bank of America",
        recipient_account_number: "0987654321",
        recipient_account_name: "Jane Smith",
        recipient_bank_name: "Chase Bank",
        request_id: "REQ-001",
        correlation_id: "CORR-001",
        is_active: true,
        created_at: "2025-10-26T10:30:00",
    },
    {
        id: 2,
        transaction_reference: "TXN-2025-002",
        transaction_type: "transfer",
        currency_code: "USD",
        amount: 850.50,
        external_fee: 3.50,
        total_amount: 854.00,
        transaction_datetime: "2025-10-25T15:45:00",
        description: "Invoice payment #INV-2025-102",
        payer_account_number: "2345678901",
        payer_account_name: "Alice Brown",
        payer_bank_name: "Wells Fargo",
        recipient_account_number: "8765432109",
        recipient_account_name: "Bob Wilson",
        recipient_bank_name: "Citibank",
        request_id: "REQ-002",
        correlation_id: "CORR-002",
        is_active: true,
        created_at: "2025-10-25T15:45:00",
    },
    {
        id: 3,
        transaction_reference: "TXN-2025-003",
        transaction_type: "transfer",
        currency_code: "EUR",
        amount: 2100.00,
        external_fee: 10.00,
        total_amount: 2110.00,
        transaction_datetime: "2025-10-24T09:15:00",
        description: "Monthly subscription payment",
        payer_account_number: "3456789012",
        payer_account_name: "Charlie Davis",
        payer_bank_name: "Deutsche Bank",
        recipient_account_number: "7654321098",
        recipient_account_name: "Tech Solutions Ltd",
        recipient_bank_name: "HSBC",
        request_id: "REQ-003",
        correlation_id: "CORR-003",
        is_active: true,
        created_at: "2025-10-24T09:15:00",
    },
    {
        id: 4,
        transaction_reference: "TXN-2025-004",
        transaction_type: "transfer",
        currency_code: "GBP",
        amount: 450.75,
        external_fee: 2.25,
        total_amount: 453.00,
        transaction_datetime: "2025-10-23T14:20:00",
        description: "Refund for order #ORD-1234",
        payer_account_number: "4567890123",
        payer_account_name: "Emma Johnson",
        payer_bank_name: "Barclays",
        recipient_account_number: "6543210987",
        recipient_account_name: "Michael Chen",
        recipient_bank_name: "Lloyds Bank",
        request_id: "REQ-004",
        correlation_id: "CORR-004",
        is_active: true,
        created_at: "2025-10-23T14:20:00",
    },
    {
        id: 5,
        transaction_reference: "TXN-2025-005",
        transaction_type: "transfer",
        currency_code: "USD",
        amount: 3200.00,
        external_fee: 15.00,
        total_amount: 3215.00,
        transaction_datetime: "2025-10-22T11:00:00",
        description: "Quarterly payment",
        payer_account_number: "5678901234",
        payer_account_name: "Sarah Miller",
        payer_bank_name: "US Bank",
        recipient_account_number: "5432109876",
        recipient_account_name: "David Lee",
        recipient_bank_name: "PNC Bank",
        request_id: "REQ-005",
        correlation_id: "CORR-005",
        is_active: true,
        created_at: "2025-10-22T11:00:00",
    },
];

// Helper function to format currency
const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
};

// Helper function to format datetime
const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TransactionsPage() {
    return (
        <ContentLayout title="All Transactions">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Transactions</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>
                                View and manage all financial transactions
                            </CardDescription>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Transaction
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead className="min-w-[140px]">Reference</TableHead>
                                    <TableHead className="min-w-[120px]">Type</TableHead>
                                    <TableHead className="min-w-[200px]">Payer</TableHead>
                                    <TableHead className="min-w-[200px]">Recipient</TableHead>
                                    <TableHead className="text-right min-w-[120px]">Amount</TableHead>
                                    <TableHead className="text-right min-w-[100px]">Fee</TableHead>
                                    <TableHead className="text-right min-w-[120px]">Total</TableHead>
                                    <TableHead className="min-w-[180px]">Date & Time</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="text-right min-w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">
                                            {transaction.id}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {transaction.transaction_reference}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {transaction.transaction_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">
                                                    {transaction.payer_account_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {transaction.payer_bank_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {transaction.payer_account_number}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">
                                                    {transaction.recipient_account_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {transaction.recipient_bank_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {transaction.recipient_account_number}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(transaction.amount, transaction.currency_code)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatCurrency(transaction.external_fee, transaction.currency_code)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(transaction.total_amount, transaction.currency_code)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDateTime(transaction.transaction_datetime)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={transaction.is_active ? "default" : "secondary"}
                                            >
                                                {transaction.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Summary and Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            <p>Showing {transactions.length} of {transactions.length} transactions</p>
                            <p className="mt-1">
                                Total Amount: <span className="font-semibold">
                                    {formatCurrency(
                                        transactions.reduce((sum, t) => sum + t.total_amount, 0),
                                        "USD"
                                    )}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ContentLayout>
    );
}
