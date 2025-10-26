"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// TypeScript interfaces
interface CreateTransactionResponse {
    success: boolean;
    data: {
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
    };
    message: string;
    timestamp: string;
}

// Define form schema with Zod
const transactionFormSchema = z.object({
    transaction_reference: z
        .string()
        .min(5, { message: "Transaction reference must be at least 5 characters." })
        .max(100, { message: "Transaction reference must not exceed 100 characters." }),
    transaction_type: z
        .string()
        .min(1, { message: "Please select a transaction type." }),
    currency_code: z
        .string()
        .min(1, { message: "Please select a currency." })
        .length(3, { message: "Currency code must be 3 characters (e.g., USD, EUR, GBP)." }),
    amount: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, { message: "Amount must be a valid number with up to 2 decimal places." })
        .refine((val) => parseFloat(val) > 0, { message: "Amount must be greater than 0." }),
    external_fee: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, { message: "Fee must be a valid number with up to 2 decimal places." })
        .optional()
        .or(z.literal("")),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters." })
        .max(500, { message: "Description must not exceed 500 characters." }),

    // Payer Information
    payer_account_number: z
        .string()
        .min(1, { message: "Payer account number is required." })
        .max(100, { message: "Account number must not exceed 100 characters." }),
    payer_account_name: z
        .string()
        .min(2, { message: "Payer account name must be at least 2 characters." })
        .max(200, { message: "Account name must not exceed 200 characters." }),
    payer_bank_name: z
        .string()
        .min(2, { message: "Payer bank name must be at least 2 characters." })
        .max(200, { message: "Bank name must not exceed 200 characters." }),

    // Recipient Information
    recipient_account_number: z
        .string()
        .min(1, { message: "Recipient account number is required." })
        .max(100, { message: "Account number must not exceed 100 characters." }),
    recipient_account_name: z
        .string()
        .min(2, { message: "Recipient account name must be at least 2 characters." })
        .max(200, { message: "Account name must not exceed 200 characters." }),
    recipient_bank_name: z
        .string()
        .min(2, { message: "Recipient bank name must be at least 2 characters." })
        .max(200, { message: "Bank name must not exceed 200 characters." }),

    // Optional fields
    image_path: z
        .string()
        .optional()
        .or(z.literal("")),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// Default values
const defaultValues: Partial<TransactionFormValues> = {
    transaction_reference: "",
    transaction_type: "TRANSFER",
    currency_code: "",
    amount: "",
    external_fee: "0.00",
    description: "",
    payer_account_number: "",
    payer_account_name: "",
    payer_bank_name: "",
    recipient_account_number: "",
    recipient_account_name: "",
    recipient_bank_name: "",
    image_path: "",
};

export default function NewTransactionPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionFormSchema),
        defaultValues,
        mode: "onChange",
    });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090/api/v1';

    async function onSubmit(data: TransactionFormValues) {
        setSubmitting(true);

        try {
            // Calculate total amount
            const amount = parseFloat(data.amount);
            const fee = parseFloat(data.external_fee || "0");
            const totalAmount = amount + fee;

            // Prepare transaction data
            const transactionData = {
                transaction_reference: data.transaction_reference,
                transaction_type: data.transaction_type,
                currency_code: data.currency_code,
                amount: amount,
                external_fee: fee,
                total_amount: totalAmount,
                transaction_datetime: new Date().toISOString(),
                description: data.description,
                image_path: data.image_path || "/receipts/default.jpg",
                initiated_by_user_id: 1, // TODO: Get from auth context
                payer_account_number: data.payer_account_number,
                payer_account_name: data.payer_account_name,
                payer_bank_name: data.payer_bank_name,
                recipient_account_number: data.recipient_account_number,
                recipient_account_name: data.recipient_account_name,
                recipient_bank_name: data.recipient_bank_name,
            };

            // Make POST request
            const response = await axios.post<CreateTransactionResponse>(
                `${API_BASE_URL}/transactions`,
                transactionData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Request-ID': crypto.randomUUID(),
                        'X-Correlation-ID': crypto.randomUUID(),
                    },
                }
            );

            if (response.status === 201 && response.data.success) {
                toast.success(response.data.message || "Transaction created successfully!");

                // Redirect to transactions list after 1 second
                setTimeout(() => {
                    router.push('/transactions');
                }, 1000);
            } else {
                throw new Error(response.data.message || 'Failed to create transaction');
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'An unexpected error occurred';

            console.error('Transaction creation error:', err);
            toast.error(`Failed to create transaction: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    }

    // Auto-generate reference number
    const generateReference = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `TXN-${timestamp}-${String(random).padStart(3, '0')}`;
    };

    // Auto-generate UUIDs
    const generateUUID = () => {
        return crypto.randomUUID();
    };

    // Calculate total amount
    const calculateTotal = () => {
        const amount = parseFloat(form.watch("amount") || "0");
        const fee = parseFloat(form.watch("external_fee") || "0");
        return (amount + fee).toFixed(2);
    };

    return (
        <ContentLayout title="New Transaction">
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
                        <BreadcrumbLink asChild>
                            <Link href="/transactions">Transactions</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>New</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Create New Transaction</CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new financial transaction
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Transaction Reference & Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="transaction_reference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction Reference</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input
                                                        placeholder="TXN-2025-001"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => field.onChange(generateReference())}
                                                    disabled={submitting}
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                            <FormDescription>
                                                Unique transaction identifier
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="transaction_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transaction Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={submitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select transaction type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                                                    <SelectItem value="PAYMENT">Payment</SelectItem>
                                                    <SelectItem value="REFUND">Refund</SelectItem>
                                                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                                                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Amount, Fee, Currency */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                    disabled={submitting}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Transaction amount
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="external_fee"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>External Fee</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="5.00"
                                                    {...field}
                                                    disabled={submitting}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Transaction fee
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currency_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={submitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                                    <SelectItem value="THB">THB - Thai Baht</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Total Amount Display */}
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total Amount:</span>
                                    <span className="text-2xl font-bold">
                                        {form.watch("currency_code") || "XXX"} {calculateTotal()}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Payment for services rendered..."
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                                disabled={submitting}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Transaction description or notes
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Payer Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Payer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="payer_account_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1234567890" {...field} disabled={submitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="payer_account_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} disabled={submitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="payer_bank_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Bank of America" {...field} disabled={submitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Recipient Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Recipient Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="recipient_account_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="0987654321" {...field} disabled={submitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="recipient_account_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jane Smith" {...field} disabled={submitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="recipient_bank_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Chase Bank" {...field} disabled={submitting} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Optional Image Path */}
                            <FormField
                                control={form.control}
                                name="image_path"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image Path (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="/uploads/receipt.jpg"
                                                {...field}
                                                disabled={submitting}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Path to transaction receipt or proof
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Form Actions */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {submitting ? "Creating..." : "Create Transaction"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={submitting}
                                >
                                    <Link href="/transactions">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </ContentLayout>
    );
}
