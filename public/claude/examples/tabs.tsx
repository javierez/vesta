// Example tabs component
export default function ExampleTabs({ course_id }: { course_id: string }) {
  return (
    <>
      <div className="relative mb-6 flex">
        <div className="text-custom-dark-blue border-custom-dark-blue z-10 flex flex-1 -skew-x-2 transform items-center justify-center rounded-t-xl border-b-4 bg-white px-8 py-4 font-semibold shadow-md">
          <span className="text-md tracking-widest">GENERAR SESIONES</span>
        </div>
        <div className="-ml-2 flex-1 -skew-x-2 transform rounded-t-xl border-b-2 border-gray-300 bg-gray-200 px-8 py-4 shadow transition duration-300 hover:bg-gray-100">
          <a
            href={`/instructorapp/${course_id}/generated-exercises`}
            className="block flex h-full w-full items-center justify-center font-semibold text-gray-400 transition-colors duration-300 hover:text-gray-600"
          >
            <span className="text-md tracking-widest">
              HISTÓRICO DE SESIONES
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
