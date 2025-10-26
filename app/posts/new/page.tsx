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

// Define form schema with Zod
const postFormSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters." })
        .max(100, { message: "Title must not exceed 100 characters." }),
    slug: z
        .string()
        .min(3, { message: "Slug must be at least 3 characters." })
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
            message: "Slug must be lowercase letters, numbers, and hyphens only.",
        }),
    excerpt: z
        .string()
        .min(20, { message: "Excerpt must be at least 20 characters." })
        .max(200, { message: "Excerpt must not exceed 200 characters." }),
    content: z
        .string()
        .min(100, { message: "Content must be at least 100 characters." }),
    // Fixed: Use .min(1) instead of required_error for string fields
    category: z
        .string()
        .min(1, { message: "Please select a category." }),
    status: z
        .string()
        .min(1, { message: "Please select a status." }),
    author: z
        .string()
        .min(2, { message: "Author name must be at least 2 characters." }),
    tags: z
        .string()
        .optional(),
    featuredImage: z
        .string()
        .url({ message: "Please enter a valid URL." })
        .optional()
        .or(z.literal("")),
});


type PostFormValues = z.infer<typeof postFormSchema>;

// Default values
const defaultValues: Partial<PostFormValues> = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    tags: "",
    featuredImage: "",
};

export default function NewPostPage() {
    const form = useForm<PostFormValues>({
        resolver: zodResolver(postFormSchema),
        defaultValues,
        mode: "onChange",
    });

    function onSubmit(data: PostFormValues) {
        console.log("Form data:", data);
        toast.success("Post created successfully!");
        // Here you would typically send the data to your API
        // Example: await fetch('/api/posts', { method: 'POST', body: JSON.stringify(data) })
    }

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    return (
        <ContentLayout title="New Post">
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
                            <Link href="/posts">Posts</Link>
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
                    <CardTitle>Create New Post</CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new blog post
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Title Field */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter post title"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    // Auto-generate slug from title
                                                    form.setValue("slug", generateSlug(e.target.value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The main title of your blog post
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Slug Field */}
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="post-slug" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            URL-friendly version of the title (auto-generated)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category Field */}
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="technology">Technology</SelectItem>
                                                    <SelectItem value="design">Design</SelectItem>
                                                    <SelectItem value="programming">Programming</SelectItem>
                                                    <SelectItem value="tutorial">Tutorial</SelectItem>
                                                    <SelectItem value="backend">Backend</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Status Field */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select post status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Excerpt Field */}
                            <FormField
                                control={form.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Excerpt</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief description of the post"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            A short summary that appears in post listings
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Content Field */}
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write your post content here..."
                                                className="resize-none min-h-[300px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The main content of your blog post
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Author Field */}
                                <FormField
                                    control={form.control}
                                    name="author"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Author</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Author name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tags Field */}
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="react, nextjs, typescript"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Comma-separated tags
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Featured Image Field */}
                            <FormField
                                control={form.control}
                                name="featuredImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Featured Image URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional: URL to the featured image
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Form Actions */}
                            <div className="flex gap-4">
                                <Button type="submit">Create Post</Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/posts">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </ContentLayout>
    );
}
