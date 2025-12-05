import { Router } from "express";
import { db } from "../../db/connection";
import { paymentAddresses } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { auth, adminOnly } from "../utils";

const router = Router();

// Protect all routes
router.use(auth, adminOnly);

/* ===========================================
   GET ALL PAYMENT ADDRESSES
   =========================================== */
router.get("/", async (_req, res) => {
  try {
    const list = await db
      .select()
      .from(paymentAddresses)
      .orderBy(desc(paymentAddresses.id));

    res.json({ success: true, addresses: list });
  } catch (err) {
    console.error("Failed to load payment addresses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===========================================
   ADD NEW PAYMENT ADDRESS
   =========================================== */
router.post("/", async (req, res) => {
  try {
    const { network, address } = req.body;

    if (!network || !address) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await db.insert(paymentAddresses).values({
      network,
      address,
      is_active: true,
    });

    res.json({ success: true, message: "Deposit address added" });
  } catch (err) {
    console.error("Error adding payment address:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===========================================
   TOGGLE ACTIVE/INACTIVE
   =========================================== */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [addr] = await db
      .select()
      .from(paymentAddresses)
      .where(eq(paymentAddresses.id, id));

    if (!addr) return res.status(404).json({ error: "Not found" });

    await db
      .update(paymentAddresses)
      .set({ is_active: !addr.is_active })
      .where(eq(paymentAddresses.id, id));

    res.json({ success: true });
  } catch (err) {
    console.error("Error toggling payment address:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
