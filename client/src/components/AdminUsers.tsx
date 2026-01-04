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
  const [selected, setSelected] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balanceDelta, setBalanceDelta] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const res = await apiRequest("/admin/users");
    if (res.success) setUsers(res.users);
    else setError(res.error || "Failed to load users");
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openUser = async (id: number) => {
    console.log("Opening user", id);

    const res = await apiRequest(`/admin/users/${id}`);
    console.log("User response:", res);

    if (res.success) {
      setSelected(res.user);
    } else {
      alert(res.error || "Failed to open user");
    }
  };


  const saveUser = async () => {
    if (!selected) return;
    setSaving(true);

    await apiRequest(`/admin/users/${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        username: selected.username,
        email: selected.email,
        role: selected.role,
      }),
    });


    await fetchUsers();
    setSaving(false);
  };

  const adjustBalance = async () => {
    if (!selected || !balanceDelta) return;

    await apiRequest(`/admin/users/${selected.id}/balance`, {
      method: "PATCH",
      body: JSON.stringify({
        amount: Number(balanceDelta),
      }),
    });


    setBalanceDelta("");
    await fetchUsers();
    const refreshed = await apiRequest(`/admin/users/${selected.id}`);
    if (refreshed.success) setSelected(refreshed.user);
  };

  const deleteUser = async () => {
    if (!selected) return;
    if (!confirm("Delete this user permanently?")) return;

    const res = await apiRequest(`/admin/users/${selected.id}`, {
      method: "DELETE",
    });

    if (res.success) {
      setSelected(null);
      await fetchUsers();
    } else {
      alert(res.error);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex gap-6">
      {/* USERS TABLE */}
      <div className="flex-1">
        <h2 className="text-lg font-bold mb-3">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-700">
            <thead className="bg-[#0F172A]">
              <tr>
                <th className="p-2 border-b">Username</th>
                <th className="p-2 border-b">Email</th>
                <th className="p-2 border-b">Role</th>
                <th className="p-2 border-b">Balance</th>
                <th className="p-2 border-b">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => openUser(u.id)}
                  className="cursor-pointer hover:bg-[#0AEFFF]/10"
                >
                  <td className="p-2 border-b">{u.username}</td>
                  <td className="p-2 border-b">{u.email}</td>
                  <td className="p-2 border-b">{u.role}</td>
                  <td className="p-2 border-b">${u.balance}</td>
                  <td className="p-2 border-b">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER EDIT PANEL */}
      {selected && (
        <div className="w-[360px] border border-gray-700 rounded p-4 bg-[#020617]">
          <h3 className="font-bold mb-3">User Details</h3>

          <label className="block text-sm mb-1">Username</label>
          <input
            className="w-full mb-2 p-1 bg-black border"
            value={selected.username}
            onChange={(e) =>
              setSelected({ ...selected, username: e.target.value })
            }
          />

          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full mb-2 p-1 bg-black border"
            value={selected.email}
            onChange={(e) =>
              setSelected({ ...selected, email: e.target.value })
            }
          />

          <label className="block text-sm mb-1">Role</label>
          <select
            className="w-full mb-3 p-1 bg-black border"
            value={selected.role}
            onChange={(e) =>
              setSelected({ ...selected, role: e.target.value })
            }
          >
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={saveUser}
            disabled={saving}
            className="w-full mb-3 bg-blue-600 py-1 rounded"
          >
            Save Changes
          </button>

          <hr className="my-3 border-gray-700" />

          <label className="block text-sm mb-1">
            Add / Deduct Balance
          </label>
          <input
            type="number"
            className="w-full mb-2 p-1 bg-black border"
            placeholder="+100 or -50"
            value={balanceDelta}
            onChange={(e) => setBalanceDelta(e.target.value)}
          />

          <button
            onClick={adjustBalance}
            className="w-full bg-emerald-600 py-1 rounded mb-3"
          >
            Apply Balance
          </button>

          <button
            onClick={deleteUser}
            className="w-full bg-red-600 py-1 rounded"
          >
            Delete User
          </button>
        </div>
      )}
    </div>
  );
}
