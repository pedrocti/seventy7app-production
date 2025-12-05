import { Router } from "express";
import adminCoursesRouter from "./adminCourses";
import adminLessonsRouter from "./adminLessons";
import adminAssignmentsRouter from "./adminAssignments";
import adminEnrollmentsRouter from "./adminEnrollments";
import adminSubmissionsRouter from "./adminSubmissions";
import programsRouter from "./programs";
import progressRouter from "./progress"; // optional, if admin can view progress

const router = Router();

router.use("/courses", adminCoursesRouter);
router.use("/lessons", adminLessonsRouter);
router.use("/assignments", adminAssignmentsRouter);
router.use("/enrollments", adminEnrollmentsRouter);
router.use("/submissions", adminSubmissionsRouter);
router.use("/programs", programsRouter);
router.use("/progress", progressRouter);

export default router;
