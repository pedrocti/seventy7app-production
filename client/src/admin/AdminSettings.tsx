// client/src/admin/AdminSettings.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_BASE } from "@/api/http";

export default function AdminSettings() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Referral settings state
  const [referralPercent, setReferralPercent] = useState<number>(10);
  const [referralLoading, setReferralLoading] = useState(true);
  const [referralSaving, setReferralSaving] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/payment-address`, { headers });
      setAddresses(res.data.addresses || []);
    } catch (err: any) {
      console.error("Load addresses error:", err.response || err);
      toast.error(err.response?.data?.error || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const loadReferralSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/referral-settings`, { headers });
      if (res.data.success) {
        setReferralPercent(res.data.percent ?? 10);
      }
    } catch (err: any) {
      console.error("Load referral settings error:", err.response || err);
    } finally {
      setReferralLoading(false);
    }
  };

  const saveReferralPercent = async () => {
    if (referralPercent < 0 || referralPercent > 100) {
      toast.error("Percentage must be between 0 and 100");
      return;
    }
    
    setReferralSaving(true);
    try {
      const res = await axios.patch(`${API_BASE}/admin/referral-settings`, 
        { percent: referralPercent }, 
        { headers }
      );
      if (res.data.success) {
        toast.success("Referral percentage updated!");
      } else {
        toast.error(res.data.error || "Failed to update");
      }
    } catch (err: any) {
      console.error("Save referral error:", err.response || err);
      toast.error(err.response?.data?.error || "Failed to save referral settings");
    } finally {
      setReferralSaving(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    loadReferralSettings();
  }, []);

  const addAddress = async () => {
    if (!network.trim() || !address.trim()) {
      toast.error("Both fields are required");
      return;
    }

    setSaving(true);
    try {
      console.log("Adding address:", { network: network.trim(), address: address.trim() });

      // ← FIXED: endpoint matches backend
      axios.post(`${API_BASE}/admin/payment-address`, {
        network: network.trim(), 
        address: address.trim()
      }, { headers });


      toast.success("Address added successfully!");
      setNetwork("");
      setAddress("");
      loadAddresses();
    } catch (err: any) {
      console.error("Add address error:", err.response || err);
      const msg = err.response?.data?.error || err.message || "Failed to add address";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleAddress = async (id: number) => {
    try {
      await axios.patch(`${API_BASE}/admin/payment-address/${id}/toggle`, {}, { headers });
      loadAddresses();
    } catch (err: any) {
      console.error("Toggle address error:", err.response || err);
      toast.error(err.response?.data?.error || "Failed to toggle");
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Platform Settings</h1>

      {/* Referral Bonus Settings */}
      <div className="bg-[#1E293B] p-6 rounded-xl mb-8 max-w-3xl border border-[#334155]">
        <h2 className="text-xl font-semibold mb-4 text-[#0AEFFF]">Referral Bonus Settings</h2>
        <p className="text-gray-400 text-sm mb-6">
          Set the percentage of first deposit that referrers earn as a bonus when their referred users make their first deposit.
        </p>
        
        {referralLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={referralPercent}
                onChange={(e) => setReferralPercent(Number(e.target.value))}
                className="bg-[#0F172A] border-[#334155] w-24 text-center text-lg font-bold"
                data-testid="input-referral-percent"
              />
              <span className="text-xl font-bold text-gray-400">%</span>
            </div>
            <Button
              onClick={saveReferralPercent}
              disabled={referralSaving}
              className="bg-[#7E22CE] hover:bg-purple-600 text-white font-bold px-6 disabled:opacity-70"
              data-testid="button-save-referral"
            >
              {referralSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
          <p className="text-sm text-gray-400">
            <span className="text-[#0AEFFF] font-semibold">Example:</span> If set to 10%, when a referred user deposits $100, the referrer earns $10 bonus.
          </p>
        </div>
      </div>

      {/* Deposit Address Settings */}
      <div className="bg-[#1E293B] p-6 rounded-xl mb-8 max-w-3xl border border-[#334155]">
        <h2 className="text-xl font-semibold mb-6">Add New Deposit Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            placeholder="Network (e.g. USDT-TRC20)"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="bg-[#0F172A] border-[#334155]"
          />
          <Input
            placeholder="Wallet Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-[#0F172A] border-[#334155] font-mono"
          />
        </div>

        <Button
          onClick={addAddress}
          disabled={saving}
          className="bg-[#0AEFFF] hover:bg-cyan-400 text-black font-bold px-8 disabled:opacity-70"
        >
          {saving ? "Adding..." : "Add Address"}
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500 text-center py-12 text-lg">No deposit addresses yet</p>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="bg-[#1E293B] p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#334155]"
            >
              <div>
                <div className="text-2xl font-bold text-[#0AEFFF]">{a.network}</div>
                <div className="text-sm text-gray-400 font-mono break-all mt-2">{a.address}</div>
              </div>
              <Button
                variant={a.is_active ? "default" : "outline"}
                onClick={() => toggleAddress(a.id)}
                className={a.is_active ? "bg-[#0AEFFF] text-black" : ""}
              >
                {a.is_active ? "Active" : "Inactive"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
