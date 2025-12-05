// client/src/components/AdminUsers.tsx
import { useEffect, useState } from "react";
import { apiRequest } from "@/api/http";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: number;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      const res = await apiRequest("/admin/users");
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      } else {
        setError(res.error || "Failed to load users");
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-[#0F172A]">
            <tr>
              <th className="p-2 border-b border-gray-700">Username</th>
              <th className="p-2 border-b border-gray-700">Email</th>
              <th className="p-2 border-b border-gray-700">Role</th>
              <th className="p-2 border-b border-gray-700">Balance</th>
              <th className="p-2 border-b border-gray-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#0AEFFF]/10">
                <td className="p-2 border-b border-gray-700">{u.username}</td>
                <td className="p-2 border-b border-gray-700">{u.email}</td>
                <td className="p-2 border-b border-gray-700">{u.role}</td>
                <td className="p-2 border-b border-gray-700">${u.balance}</td>
                <td className="p-2 border-b border-gray-700">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
