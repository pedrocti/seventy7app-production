export default function LessonsList({ lessons }: any) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Lessons</h3>

      {lessons.length === 0 ? (
        <div className="p-4 text-gray-400 bg-[#071029] rounded border border-[#0F172A]">
          No lessons available.
        </div>
      ) : (
        <ul className="space-y-2">
          {lessons.map((l: any) => (
            <li key={l.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
              <div className="font-semibold">{l.title}</div>

              {l.content && (
                <div className="text-sm text-gray-400 mt-1">{l.content}</div>
              )}

              {l.material_link && (
                <a
                  href={l.material_link}
                  target="_blank"
                  className="text-blue-400 underline block mt-1"
                >
                  Video / Resource
                </a>
              )}

              {l.pdf_url && (
                <a
                  href={l.pdf_url}
                  target="_blank"
                  className="text-blue-400 underline block mt-1"
                >
                  PDF
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
