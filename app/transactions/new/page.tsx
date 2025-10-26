"use client";

import Link from "next/link";
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

// Define form schema with Zod based on your Transaction schema
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
    
    // System fields
    request_id: z
        .string()
        .min(1, { message: "Request ID is required." })
        .max(100, { message: "Request ID must not exceed 100 characters." }),
    correlation_id: z
        .string()
        .min(1, { message: "Correlation ID is required." })
        .max(100, { message: "Correlation ID must not exceed 100 characters." }),
    
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
    transaction_type: "transfer",
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
    request_id: "",
    correlation_id: "",
    image_path: "",
};

export default function NewTransactionPage() {
    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionFormSchema),
        defaultValues,
        mode: "onChange",
    });

    function onSubmit(data: TransactionFormValues) {
        // Calculate total amount
        const amount = parseFloat(data.amount);
        const fee = parseFloat(data.external_fee || "0");
        const totalAmount = amount + fee;

        const transactionData = {
            ...data,
            amount: amount,
            external_fee: fee,
            total_amount: totalAmount,
            transaction_datetime: new Date().toISOString(),
            initiated_by_user_id: 1, // This should come from your auth context
        };

        console.log("Transaction data:", transactionData);
        toast.success("Transaction created successfully!");
        // Here you would typically send the data to your API
        // Example: await fetch('/api/transactions', { method: 'POST', body: JSON.stringify(transactionData) })
    }

    // Auto-generate reference number
    const generateReference = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `TXN-${timestamp}-${random}`;
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
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select transaction type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="transfer">Transfer</SelectItem>
                                                    <SelectItem value="payment">Payment</SelectItem>
                                                    <SelectItem value="refund">Refund</SelectItem>
                                                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                                                    <SelectItem value="deposit">Deposit</SelectItem>
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
                                                    <Input placeholder="1234567890" {...field} />
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
                                                    <Input placeholder="John Doe" {...field} />
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
                                                    <Input placeholder="Bank of America" {...field} />
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
                                                    <Input placeholder="0987654321" {...field} />
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
                                                    <Input placeholder="Jane Smith" {...field} />
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
                                                    <Input placeholder="Chase Bank" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* System Tracking IDs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="request_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Request ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="REQ-001" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Cross-service reference ID
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="correlation_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correlation ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="CORR-001" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                System correlation identifier
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                <Button type="submit">Create Transaction</Button>
                                <Button type="button" variant="outline" asChild>
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
