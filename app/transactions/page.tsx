"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { UploadPaymentDialog } from "@/components/transaction/upload-payment-dialog";
import { Upload } from "lucide-react";



// TypeScript interfaces
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

interface UpdateTransactionResponse {
    success: boolean;
    data: Transaction;
    message: string;
    timestamp: string;
}

interface DeleteTransactionResponse {
    success: boolean;
    message: string;
    timestamp: string;
}

// Update Transaction Schema
const updateTransactionSchema = z.object({
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Amount must be a valid number with up to 2 decimal places." }),
    external_fee: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Fee must be a valid number with up to 2 decimal places." }),
    total_amount: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "Total must be a valid number with up to 2 decimal places." }),
});

type UpdateTransactionValues = z.infer<typeof updateTransactionSchema>;

// Helper functions
const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
};

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

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [updating, setUpdating] = useState(false);

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    // Add these state variables after your existing state declarations
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const fetchTransactionDetails = async (id: number) => {
        setLoadingDetails(true);
        try {
            const response = await axios.get<{
                success: boolean;
                data: Transaction;
                message: string;
                timestamp: string;
            }>(
                `${API_BASE_URL}/transactions/${id}`,
                {
                    headers: { 'X-Request-ID': crypto.randomUUID() },
                }
            );

            if (response.data.success) {
                setViewingTransaction(response.data.data);
                setViewDialogOpen(true);
            } else {
                throw new Error(response.data.message || 'Failed to fetch transaction details');
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'An unexpected error occurred';

            toast.error(`Failed to load details: ${errorMessage}`);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Add this handler function
    const handleView = (transaction: Transaction) => {
        fetchTransactionDetails(transaction.id);
    };

    // Form for editing
    const form = useForm<UpdateTransactionValues>({
        resolver: zodResolver(updateTransactionSchema),
        defaultValues: {
            description: "",
            amount: "",
            external_fee: "",
            total_amount: "",
        },
    });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090/api/v1';

    // Fetch transactions from API
    const fetchTransactions = async (limit: number = 7, offset: number = 0) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<TransactionsResponse>(
                `${API_BASE_URL}/transactions`,
                {
                    params: { limit, offset },
                    headers: { 'X-Request-ID': crypto.randomUUID() },
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

    // Update transaction
    const updateTransaction = async (id: number, data: UpdateTransactionValues) => {
        setUpdating(true);

        try {
            const response = await axios.put<UpdateTransactionResponse>(
                `${API_BASE_URL}/transactions/${id}`,
                {
                    description: data.description,
                    amount: parseFloat(data.amount),
                    external_fee: parseFloat(data.external_fee),
                    total_amount: parseFloat(data.total_amount),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Request-ID': crypto.randomUUID(),
                    },
                }
            );

            if (response.data.success) {
                toast.success('Transaction updated successfully!');

                setTransactions(prev =>
                    prev.map(t => t.id === id ? response.data.data : t)
                );

                setEditDialogOpen(false);
                setSelectedTransaction(null);
                form.reset();
            } else {
                throw new Error(response.data.message || 'Failed to update transaction');
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'An unexpected error occurred';

            toast.error(`Update failed: ${errorMessage}`);
        } finally {
            setUpdating(false);
        }
    };

    // Delete transaction
    const deleteTransaction = async (id: number) => {
        setDeleting(true);

        try {
            const response = await axios.delete<DeleteTransactionResponse>(
                `${API_BASE_URL}/transactions/${id}`,
                {
                    headers: {
                        'X-Request-ID': crypto.randomUUID(),
                    },
                }
            );

            if (response.data.success) {
                toast.success('Transaction deleted successfully!');

                // Remove the transaction from local state
                setTransactions(prev => prev.filter(t => t.id !== id));

                // Update meta total count
                setMeta(prev => ({ ...prev, total: prev.total - 1 }));

                setDeleteDialogOpen(false);
                setTransactionToDelete(null);
            } else {
                throw new Error(response.data.message || 'Failed to delete transaction');
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'An unexpected error occurred';

            toast.error(`Delete failed: ${errorMessage}`);
        } finally {
            setDeleting(false);
        }
    };

    // Open edit dialog
    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        form.reset({
            description: transaction.description,
            amount: transaction.amount.toString(),
            external_fee: transaction.external_fee.toString(),
            total_amount: transaction.total_amount.toString(),
        });
        setEditDialogOpen(true);
    };

    // Open delete dialog
    const handleDelete = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setDeleteDialogOpen(true);
    };

    // Confirm delete
    const confirmDelete = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
        }
    };

    // Handle form submission
    const onSubmit = async (data: UpdateTransactionValues) => {
        if (selectedTransaction) {
            await updateTransaction(selectedTransaction.id, data);
        }
    };

    // Auto-calculate total
    const calculateTotal = () => {
        const amount = parseFloat(form.watch("amount") || "0");
        const fee = parseFloat(form.watch("external_fee") || "0");
        const total = (amount + fee).toFixed(2);
        form.setValue("total_amount", total);
    };

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

    const currentPage = Math.floor(meta.offset / meta.limit) + 1;
    const totalPages = Math.ceil(meta.total / meta.limit);
    const showingFrom = meta.offset + 1;
    const showingTo = Math.min(meta.offset + meta.limit, meta.total);

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
                        <div className="flex gap-2">
                            <UploadPaymentDialog>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Payment
                                </Button>
                            </UploadPaymentDialog>
                            <Button asChild>
                                <Link href="/transactions/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Transaction
                                </Link>
                            </Button>
                        </div>
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
                                                <TableCell className="font-medium">{transaction.id}</TableCell>
                                                <TableCell className="font-mono text-xs">{transaction.transaction_reference}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {transaction.transaction_type.toLowerCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{transaction.payer_account_name}</span>
                                                        <span className="text-xs text-muted-foreground">{transaction.payer_bank_name}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{transaction.payer_account_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{transaction.recipient_account_name}</span>
                                                        <span className="text-xs text-muted-foreground">{transaction.recipient_bank_name}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{transaction.recipient_account_number}</span>
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
                                                <TableCell className="text-sm">{formatDateTime(transaction.transaction_datetime)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.is_active ? "default" : "secondary"}>
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
                                                            onClick={() => handleView(transaction)}
                                                            disabled={loadingDetails}
                                                        >
                                                            {loadingDetails ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title="Edit"
                                                            onClick={() => handleEdit(transaction)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive"
                                                            title="Delete"
                                                            onClick={() => handleDelete(transaction)}
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
                                    <p>Showing {showingFrom} to {showingTo} of {meta.total} transactions (Page {currentPage} of {totalPages})</p>
                                    <p className="mt-1">
                                        Page Total: <span className="font-semibold">{formatCurrency(calculateTotalAmount(), "USD")}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={meta.offset === 0 || loading}>
                                        Previous
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={meta.offset + meta.limit >= meta.total || loading}>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Transaction Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                            Update transaction details. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {selectedTransaction && (
                                <div className="space-y-2 p-3 bg-muted rounded-md">
                                    <p className="text-sm font-medium">Transaction: {selectedTransaction.transaction_reference}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedTransaction.payer_account_name} → {selectedTransaction.recipient_account_name}
                                    </p>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Payment description"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="1000.00"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        calculateTotal();
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="external_fee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fee</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="5.00"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        calculateTotal();
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="total_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="1005.00"
                                                {...field}
                                                disabled
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Auto-calculated from amount + fee
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditDialogOpen(false);
                                        form.reset();
                                    }}
                                    disabled={updating}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updating}>
                                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction
                            {transactionToDelete && (
                                <span className="font-medium block mt-2">
                                    "{transactionToDelete.transaction_reference}"
                                </span>
                            )}
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {transactionToDelete && (
                        <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                            <p><strong>Amount:</strong> {formatCurrency(transactionToDelete.total_amount, transactionToDelete.currency_code)}</p>
                            <p><strong>From:</strong> {transactionToDelete.payer_account_name}</p>
                            <p><strong>To:</strong> {transactionToDelete.recipient_account_name}</p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground text-amber-50 hover:bg-destructive/90"
                        >
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Transaction
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* View Transaction Details Sheet */}
            <Sheet open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Transaction Details</SheetTitle>
                        <SheetDescription>
                            Complete information about this transaction
                        </SheetDescription>
                    </SheetHeader>

                    {viewingTransaction && (
                        <div className="grid flex-1 auto-rows-min gap-6 py-6 px-3">
                            {/* Transaction Reference and Status */}
                            <div className="grid gap-3">
                                <Label htmlFor="transaction-ref">Transaction Reference</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="transaction-ref"
                                        value={viewingTransaction.transaction_reference}
                                        readOnly
                                        className="font-mono"
                                    />
                                    <Badge variant={viewingTransaction.is_active ? "default" : "secondary"}>
                                        {viewingTransaction.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="grid gap-3">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={viewingTransaction.description}
                                    readOnly
                                    rows={3}
                                />
                            </div>

                            <Separator />

                            {/* Transaction Type and Currency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="transaction-type">Type</Label>
                                    <Input
                                        id="transaction-type"
                                        value={viewingTransaction.transaction_type}
                                        readOnly
                                        className="capitalize"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        value={viewingTransaction.currency_code}
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Amount Breakdown */}
                            <div className="grid gap-3">
                                <Label>Amount Breakdown</Label>
                                <div className="space-y-2 bg-muted p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Amount</span>
                                        <span className="font-medium">
                                            {formatCurrency(viewingTransaction.amount, viewingTransaction.currency_code)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">External Fee</span>
                                        <span className="font-medium">
                                            {formatCurrency(viewingTransaction.external_fee, viewingTransaction.currency_code)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold">Total Amount</span>
                                        <span className="font-bold text-lg">
                                            {formatCurrency(viewingTransaction.total_amount, viewingTransaction.currency_code)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Payer Information */}
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold">Payer Information</Label>

                                <div className="grid gap-3">
                                    <Label htmlFor="payer-name">Account Name</Label>
                                    <Input
                                        id="payer-name"
                                        value={viewingTransaction.payer_account_name}
                                        readOnly
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="payer-account">Account Number</Label>
                                    <Input
                                        id="payer-account"
                                        value={viewingTransaction.payer_account_number}
                                        readOnly
                                        className="font-mono"
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="payer-bank">Bank Name</Label>
                                    <Input
                                        id="payer-bank"
                                        value={viewingTransaction.payer_bank_name}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Recipient Information */}
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold">Recipient Information</Label>

                                <div className="grid gap-3">
                                    <Label htmlFor="recipient-name">Account Name</Label>
                                    <Input
                                        id="recipient-name"
                                        value={viewingTransaction.recipient_account_name}
                                        readOnly
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="recipient-account">Account Number</Label>
                                    <Input
                                        id="recipient-account"
                                        value={viewingTransaction.recipient_account_number}
                                        readOnly
                                        className="font-mono"
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="recipient-bank">Bank Name</Label>
                                    <Input
                                        id="recipient-bank"
                                        value={viewingTransaction.recipient_bank_name}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* System Information */}
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold">System Information</Label>

                                <div className="grid gap-3">
                                    <Label htmlFor="request-id">Request ID</Label>
                                    <Input
                                        id="request-id"
                                        value={viewingTransaction.request_id}
                                        readOnly
                                        className="font-mono text-xs"
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="correlation-id">Correlation ID</Label>
                                    <Input
                                        id="correlation-id"
                                        value={viewingTransaction.correlation_id}
                                        readOnly
                                        className="font-mono text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="transaction-date">Transaction Date</Label>
                                        <Input
                                            id="transaction-date"
                                            value={formatDateTime(viewingTransaction.transaction_datetime)}
                                            readOnly
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="initiated-by">Initiated By</Label>
                                        <Input
                                            id="initiated-by"
                                            value={`User #${viewingTransaction.initiated_by_user_id}`}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Audit Trail */}
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold">Audit Trail</Label>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="created-at">Created At</Label>
                                        <Input
                                            id="created-at"
                                            value={formatDateTime(viewingTransaction.created_at)}
                                            readOnly
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="updated-at">Last Updated</Label>
                                        <Input
                                            id="updated-at"
                                            value={formatDateTime(viewingTransaction.updated_at)}
                                            readOnly
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {viewingTransaction.image_path && (
                                <>
                                    <Separator />
                                    <div className="grid gap-3">
                                        <Label htmlFor="image-path">Receipt Image</Label>
                                        <Input
                                            id="image-path"
                                            value={viewingTransaction.image_path}
                                            readOnly
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setViewDialogOpen(false);
                                        handleEdit(viewingTransaction);
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setViewDialogOpen(false);
                                        handleDelete(viewingTransaction);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>


        </ContentLayout>
    );
}
