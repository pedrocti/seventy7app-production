// server/api/admin/learning/index.ts
import { Router } from "express";
import adminCoursesRouter from "./adminCourses";
import adminLessonsRouter from "./adminLessons";
import adminAssignmentsRouter from "./adminAssignments";
import adminEnrollmentsRouter from "./adminEnrollments";
import adminSubmissionsRouter from "./adminSubmissions";
import programsRouter from "./programs"; 
import progressRouter from "./progress"; 

const router = Router();

/* ===== Health Check ===== */
router.get("/__test", (_req, res) => {
  res.json({ ok: true, message: "Admin learning router is active" });
});

/* ===== Admin Learning Sub-Routes ===== */
router.use("/courses", adminCoursesRouter);
router.use("/lessons", adminLessonsRouter);
router.use("/assignments", adminAssignmentsRouter);
router.use("/enrollments", adminEnrollmentsRouter);
router.use("/submissions", adminSubmissionsRouter);
router.use("/programs", programsRouter);
router.use("/progress", progressRouter);

export default router;
