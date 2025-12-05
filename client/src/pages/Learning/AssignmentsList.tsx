export default function AssignmentsList({ assignments, onSubmitClick }: any) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Assignments</h3>

      {assignments.length === 0 ? (
        <div className="p-4 text-gray-400 bg-[#071029] rounded border border-[#0F172A]">
          No assignments yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {assignments.map((a: any) => (
            <li key={a.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-400">{a.description}</div>

              <div className="text-xs text-gray-500 mt-1">
                Due: {new Date(a.due_date).toLocaleDateString()}
              </div>

              {a.my_submission ? (
                <div className="text-green-400 mt-2 text-sm">
                  Submitted on {new Date(a.my_submission.submitted_at).toLocaleString()}
                </div>
              ) : (
                <button
                  className="mt-2 px-3 py-1 bg-[#0AEFFF] text-black rounded"
                  onClick={() => onSubmitClick(a)}
                >
                  Submit Assignment
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
