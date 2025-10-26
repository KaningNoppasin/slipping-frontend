"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
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
import { Eye, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

// TypeScript interfaces based on your API response
interface Transaction {
    id: number;
    transaction_reference: string;
    transaction_type: string;
    currency_code: string;
    amount: number;
    external_fee: number;
    total_amount: number;
    transaction_datetime: string;
    description: string;
    image_path: string;
    initiated_by_user_id: number;
    payer_account_number: string;
    payer_account_name: string;
    payer_bank_name: string;
    recipient_account_number: string;
    recipient_account_name: string;
    recipient_bank_name: string;
    request_id: string;
    correlation_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface TransactionsResponse {
    success: boolean;
    data: Transaction[];
    message: string;
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
    timestamp: string;
}

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
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState({
        total: 0,
        limit: 7,
        offset: 0,
    });

    // Fetch transactions from API
    const fetchTransactions = async (limit: number = 7, offset: number = 0) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<TransactionsResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090/api/v1'}/transactions`,
                {
                    params: {
                        limit,
                        offset,
                    },
                    headers: {
                        'X-Request-ID': crypto.randomUUID(),
                    },
                }
            );

            if (response.data.success) {
                setTransactions(response.data.data);
                setMeta(response.data.meta);
            } else {
                throw new Error(response.data.message || 'Failed to fetch transactions');
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'An unexpected error occurred';
            
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchTransactions(meta.limit, meta.offset);
    }, []);

    // Pagination handlers
    const handleNextPage = () => {
        const newOffset = meta.offset + meta.limit;
        if (newOffset < meta.total) {
            setMeta(prev => ({ ...prev, offset: newOffset }));
            fetchTransactions(meta.limit, newOffset);
        }
    };

    const handlePreviousPage = () => {
        const newOffset = Math.max(0, meta.offset - meta.limit);
        setMeta(prev => ({ ...prev, offset: newOffset }));
        fetchTransactions(meta.limit, newOffset);
    };

    // Calculate current page info
    const currentPage = Math.floor(meta.offset / meta.limit) + 1;
    const totalPages = Math.ceil(meta.total / meta.limit);
    const showingFrom = meta.offset + 1;
    const showingTo = Math.min(meta.offset + meta.limit, meta.total);

    // Calculate total amount for current page
    const calculateTotalAmount = () => {
        return transactions.reduce((sum, t) => sum + t.total_amount, 0);
    };

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
                        <Button asChild>
                            <Link href="/transactions/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Transaction
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Loading transactions...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={() => fetchTransactions(meta.limit, meta.offset)}>
                                Try Again
                            </Button>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground mb-4">No transactions found</p>
                            <Button asChild>
                                <Link href="/transactions/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Transaction
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
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
                                                        {transaction.transaction_type.toLowerCase()}
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
                                    <p>
                                        Showing {showingFrom} to {showingTo} of {meta.total} transactions 
                                        (Page {currentPage} of {totalPages})
                                    </p>
                                    <p className="mt-1">
                                        Page Total: <span className="font-semibold">
                                            {formatCurrency(calculateTotalAmount(), "USD")}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handlePreviousPage}
                                        disabled={meta.offset === 0 || loading}
                                    >
                                        Previous
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleNextPage}
                                        disabled={meta.offset + meta.limit >= meta.total || loading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </ContentLayout>
    );
}
