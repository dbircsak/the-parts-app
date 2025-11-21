"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, Plus, Edit2, ChevronUp, ChevronDown } from "lucide-react";

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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  const ColumnHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={() => handleSort(field)}
    >
      {label}
      <SortIcon field={field} />
    </th>
  );

  if (loading) {
    return <div className="text-gray-500">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Create/Edit User Form */}
      {!showForm ? (
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ email: "", name: "", password: "", passwordConfirm: "", role: "TECHNICIAN" });
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create New User
        </button>
      ) : (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? "Edit User" : "Create New User"}
          </h3>
          <form onSubmit={handleSaveUser} className="space-y-4">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            {editingId && (
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Password {editingId && "(leave blank to keep current)"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password {editingId && "(leave blank to keep current)"}
              </label>
              <input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, passwordConfirm: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TECHNICIAN">Technician</option>
                <option value="ESTIMATOR">Estimator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {editingId ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <ColumnHeader field="email" label="Email" />
              <ColumnHeader field="name" label="Name" />
              <ColumnHeader field="role" label="Role" />
              <ColumnHeader field="createdAt" label="Created" />
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedUsers.length === 0 && (
        <p className="text-gray-500 text-center py-8">No users found.</p>
      )}
    </div>
  );
}
