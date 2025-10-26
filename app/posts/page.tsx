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
import { Eye, Pencil, Trash2, Plus } from "lucide-react";

// Mock data for posts
const posts = [
    {
        id: 1,
        title: "Getting Started with Next.js 15",
        author: "John Doe",
        category: "Technology",
        status: "published",
        views: 1234,
        date: "2025-10-20",
    },
    {
        id: 2,
        title: "Building Modern UI with Shadcn",
        author: "Jane Smith",
        category: "Design",
        status: "published",
        views: 892,
        date: "2025-10-18",
    },
    {
        id: 3,
        title: "TypeScript Best Practices",
        author: "Bob Johnson",
        category: "Programming",
        status: "draft",
        views: 456,
        date: "2025-10-15",
    },
    {
        id: 4,
        title: "Dark Mode Implementation Guide",
        author: "Alice Brown",
        category: "Tutorial",
        status: "published",
        views: 2341,
        date: "2025-10-12",
    },
    {
        id: 5,
        title: "Understanding React Server Components",
        author: "Charlie Wilson",
        category: "Technology",
        status: "draft",
        views: 678,
        date: "2025-10-10",
    },
    {
        id: 6,
        title: "Mastering Tailwind CSS",
        author: "Emma Davis",
        category: "Design",
        status: "published",
        views: 1567,
        date: "2025-10-08",
    },
    {
        id: 7,
        title: "API Design Patterns",
        author: "Michael Chen",
        category: "Backend",
        status: "archived",
        views: 234,
        date: "2025-10-05",
    },
    {
        id: 8,
        title: "State Management in 2025",
        author: "Sarah Miller",
        category: "Programming",
        status: "published",
        views: 1890,
        date: "2025-10-01",
    },
];

export default function PostsPage() {
    return (
        <ContentLayout title="All Posts">
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
                        <BreadcrumbPage>Posts</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Posts</CardTitle>
                            <CardDescription>
                                Manage your blog posts and articles
                            </CardDescription>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Post
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Views</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">
                                            {post.id}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {post.title}
                                        </TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{post.category}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    post.status === "published"
                                                        ? "default"
                                                        : post.status === "draft"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                            >
                                                {post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {post.views.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(post.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
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

                    {/* Pagination Info */}
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {posts.length} of {posts.length} posts
                        </p>
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