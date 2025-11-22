"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, Plus, Edit2 } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import Table from "@/components/Table";
import TableHeader from "@/components/TableHeader";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

type SortField = "email" | "name" | "role" | "createdAt";
type SortDirection = "asc" | "desc";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("email");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
    role: "TECHNICIAN",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (editingId) {
      // Update existing user
      if (!formData.name || (!formData.password && formData.password !== "")) {
        setError("Name is required");
        return;
      }
      if (formData.password && formData.password !== formData.passwordConfirm) {
        setError("Passwords do not match");
        return;
      }

      try {
        const updateData: any = {
          name: formData.name,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await fetch(`/api/admin/users/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to update user");
          return;
        }

        setSuccess("User updated successfully");
        setEditingId(null);
        setFormData({ email: "", name: "", password: "", passwordConfirm: "", role: "TECHNICIAN" });
        setShowForm(false);
        fetchUsers();
      } catch (err) {
        setError("Error updating user");
      }
    } else {
      // Create new user
      if (!formData.email || !formData.password) {
        setError("Email and password are required");
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        setError("Passwords do not match");
        return;
      }

      try {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to create user");
          return;
        }

        setSuccess("User created successfully");
        setFormData({ email: "", name: "", password: "", passwordConfirm: "", role: "TECHNICIAN" });
        setShowForm(false);
        fetchUsers();
      } catch (err) {
        setError("Error creating user");
      }
    }
  };

  const handleEditUser = (user: User) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      passwordConfirm: "",
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Failed to delete user");
        return;
      }

      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setError("Error deleting user");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ email: "", name: "", password: "", passwordConfirm: "", role: "TECHNICIAN" });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "string") {
        comparison = aVal.localeCompare(bVal as string);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [users, sortField, sortDirection]);



  if (loading) {
    return <div className="text-gray-500">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Create/Edit User Form */}
      {!showForm ? (
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ email: "", name: "", password: "", passwordConfirm: "", role: "TECHNICIAN" });
            setShowForm(true);
          }}
          variant="primary"
          className="inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New User
        </Button>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? "Edit User" : "Create New User"}
          </h3>
          <form onSubmit={handleSaveUser} className="space-y-4">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            )}
            {editingId && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Password {editingId && "(leave blank to keep current)"}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password {editingId && "(leave blank to keep current)"}
              </label>
              <Input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, passwordConfirm: e.target.value })
                }
                required={!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TECHNICIAN">Technician</option>
                <option value="ESTIMATOR">Estimator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="success"
              >
                {editingId ? "Update User" : "Create User"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users Table */}
      <Table>
        <Table.Head>
          <Table.Row>
            <TableHeader field="email" label="Email" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="name" label="Name" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="role" label="Role" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="createdAt" label="Created" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {sortedUsers.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.name}</Table.Cell>
              <Table.Cell>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </Table.Cell>
              <Table.Cell className="text-xs text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {sortedUsers.length === 0 && (
        <p className="text-gray-500 text-center py-8">No users found.</p>
      )}
    </div>
  );
}
