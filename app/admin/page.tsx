"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, Pencil, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const router = useRouter();
    const supabase = createClient();

    // Data States
    const [categories, setCategories] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({ users: 0, topics: 0, posts: 0 });

    // Category Form State
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [categoryForm, setCategoryForm] = useState({ title: "", description: "", icon: "MessageSquare", slug: "" });

    useEffect(() => {
        checkAdmin();
    }, []);

    async function checkAdmin() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            router.push("/");
            return;
        }

        setIsAdmin(true);
        loadData();
    }

    async function loadData() {
        setLoading(true);
        await Promise.all([
            fetchCategories(),
            fetchUsers(),
            fetchStats()
        ]);
        setLoading(false);
    }

    async function fetchCategories() {
        const { data } = await supabase
            .from('forum_categories')
            .select('*')
            .order('sort_order', { ascending: true });
        setCategories(data || []);
    }

    async function fetchUsers() {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50); // Pagination could be added later
        setUsers(data || []);
    }

    async function fetchStats() {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: topicCount } = await supabase.from('forum_topics').select('*', { count: 'exact', head: true });
        const { count: postCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true });
        setStats({ users: userCount || 0, topics: topicCount || 0, posts: postCount || 0 });
    }

    // --- Category Management ---

    async function handleSaveCategory() {
        if (!categoryForm.title || !categoryForm.slug) return;

        const payload = {
            title: categoryForm.title,
            description: categoryForm.description,
            icon: categoryForm.icon,
            slug: categoryForm.slug,
        };

        let error;
        if (editingCategory) {
            const { error: updateError } = await supabase
                .from('forum_categories')
                .update(payload)
                .eq('id', editingCategory.id);
            error = updateError;
        } else {
            // Get max sort order
            const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order)) : 0;
            const { error: insertError } = await supabase
                .from('forum_categories')
                .insert({ ...payload, sort_order: maxOrder + 1 });
            error = insertError;
        }

        if (error) {
            alert("Error saving category: " + error.message);
        } else {
            setIsCategoryDialogOpen(false);
            setEditingCategory(null);
            setCategoryForm({ title: "", description: "", icon: "MessageSquare", slug: "" });
            fetchCategories();
        }
    }

    async function handleDeleteCategory(id: string) {
        if (!confirm("Are you sure? This will delete all topics in this category!")) return;
        const { error } = await supabase.from('forum_categories').delete().eq('id', id);
        if (error) alert("Error deleting: " + error.message);
        else fetchCategories();
    }

    async function handleMoveCategory(id: string, direction: 'up' | 'down') {
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const otherIndex = direction === 'up' ? index - 1 : index + 1;
        const current = categories[index];
        const other = categories[otherIndex];

        // Swap sort orders
        await supabase.from('forum_categories').update({ sort_order: other.sort_order }).eq('id', current.id);
        await supabase.from('forum_categories').update({ sort_order: current.sort_order }).eq('id', other.id);

        fetchCategories();
    }

    // --- User Management ---

    async function handleUpdateRole(userId: string, newRole: string) {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert("Error updating role: " + error.message);
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-6xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="forums">Forums</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.users}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Topics</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.topics}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Posts</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.posts}</div></CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="forums" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Forum Categories</h2>
                            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => {
                                        setEditingCategory(null);
                                        setCategoryForm({ title: "", description: "", icon: "MessageSquare", slug: "" });
                                    }}><Plus size={16} className="mr-2" /> Add Category</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input value={categoryForm.title} onChange={e => setCategoryForm({ ...categoryForm, title: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Slug (URL)</Label>
                                            <Input value={categoryForm.slug} onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Icon (Lucide Name)</Label>
                                            <Input value={categoryForm.icon} onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSaveCategory}>Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((cat, idx) => (
                                            <TableRow key={cat.id}>
                                                <TableCell className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => handleMoveCategory(cat.id, 'up')}><ArrowUp size={12} /></Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === categories.length - 1} onClick={() => handleMoveCategory(cat.id, 'down')}><ArrowDown size={12} /></Button>
                                                </TableCell>
                                                <TableCell className="font-medium">{cat.title}</TableCell>
                                                <TableCell>{cat.slug}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingCategory(cat);
                                                        setCategoryForm({ title: cat.title, description: cat.description, icon: cat.icon, slug: cat.slug });
                                                        setIsCategoryDialogOpen(true);
                                                    }}><Pencil size={16} /></Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteCategory(cat.id)}><Trash2 size={16} /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.real_name || user.kennel_name || "Unknown"}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Select defaultValue={user.role} onValueChange={(val) => handleUpdateRole(user.id, val)}>
                                                        <SelectTrigger className="w-[140px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="moderator">Moderator</SelectItem>
                                                            <SelectItem value="spokesperson">Spokesperson</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
