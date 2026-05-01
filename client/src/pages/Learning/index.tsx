// client/src/pages/Learning/index.tsx
import { Route, Switch } from "wouter";
import ProgramsList from "./ProgramsList";
import ProgramView from "./ProgramView";
import CoursesList from "./Courses"; // assuming CoursesList is an alias or old name for Courses
import CourseView from "./CourseView";
import LessonsList from "./LessonsList";
import AssignmentsList from "./AssignmentsList";
import SubmitModal from "./SubmitModal";
import Progress from "./Progress";

export default function LearningRouter() {
  return (
    <Switch>
      {/* Programs */}
      <Route path="/learning" component={ProgramsList} />

      {/* Program view */}
      <Route path="/learning/program/:programId">
        {(params: any) => {
          if (!params?.programId) return null;
          return (
            <ProgramView
              id={Number(params.programId)}
              onBack={() => window.history.back()}
              onViewCourses={() => {
                console.log("View courses requested for program", params.programId);
              }}
            />
          );
        }}
      </Route>

      {/* Program view (plural for backward compatibility) */}
      <Route path="/learning/programs/:programId">
        {(params: any) => {
          if (!params?.programId) return null;
          return (
            <ProgramView
              id={Number(params.programId)}
              onBack={() => window.history.back()}
              onViewCourses={() => {
                console.log("View courses requested for program (plural)", params.programId);
              }}
            />
          );
        }}
      </Route>

      {/* Courses */}
      <Route path="/learning/program/:programId/courses">
        {(params: any) => {
          if (!params?.programId) return null;
          return (
            <CoursesList
              programId={Number(params.programId)}
              onBack={() => window.history.back()}
            />
          );
        }}
      </Route>

      {/* Backwards compatibility (plural) */}
      <Route path="/learning/programs/:programId/courses">
        {(params: any) => {
          if (!params?.programId) return null;
          return (
            <CoursesList
              programId={Number(params.programId)}
              onBack={() => window.history.back()}
            />
          );
        }}
      </Route>

      {/* Course View */}
      <Route path="/learning/course/:courseId">
        {(params: any) => {
          if (!params?.courseId) return null;
          return <CourseView courseId={Number(params.courseId)} />;
        }}
      </Route>

      {/* Lessons */}
      <Route path="/learning/course/:courseId/lessons">
        {(params: any) => {
          if (!params?.courseId) return null;
          return <LessonsList courseId={Number(params.courseId)} />;
        }}
      </Route>

      {/* Assignments */}
      <Route path="/learning/lesson/:lessonId/assignments">
        {(params: any) => {
          if (!params?.lessonId) return null;
          return <AssignmentsList lessonId={Number(params.lessonId)} />;
        }}
      </Route>

      {/* Submit Work */}
      <Route path="/learning/lesson/:lessonId/submit">
        {(params: any) => {
          if (!params?.lessonId) return null;
          return <SubmitModal lessonId={Number(params.lessonId)} />;
        }}
      </Route>

      {/* Progress */}
      <Route path="/learning/course/:courseId/progress">
        {(params: any) => {
          if (!params?.courseId) return null;
          return <Progress courseId={Number(params.courseId)} />;
        }}
      </Route>

      {/* Catch-all - fallback to programs list */}
      <Route path="/learning/:rest*">
        <ProgramsList />
      </Route>
    </Switch>
  );
}
