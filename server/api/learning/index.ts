import { Router } from "express";

import coursesRouter from "./courses";
import enrollRouter from "./enrollments";
import lessonsRouter from "./lessons";
import assignmentsRouter from "./assignments";
import submissionsRouter from "./submissions";
import progressRouter from "./progress";
import programsRouter from "./programs";



const router = Router();

router.use("/courses", coursesRouter);
router.use("/enroll", enrollRouter);
router.use("/lessons", lessonsRouter);
router.use("/assignments", assignmentsRouter);
router.use("/submissions", submissionsRouter);
router.use("/progress", progressRouter);
router.use("/programs", programsRouter);

export default router;
