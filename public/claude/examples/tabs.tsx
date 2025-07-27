// Example tabs component
export default function ExampleTabs({ course_id }: { course_id: string }) {
  return (
    <>
      <div className="flex mb-6 relative">
        <div className="flex-1 px-8 py-4 bg-white text-custom-dark-blue font-semibold rounded-t-xl shadow-md z-10 border-b-4 border-custom-dark-blue transform -skew-x-2 flex items-center justify-center">
          <span className="text-md tracking-widest">GENERAR SESIONES</span>
        </div>
        <div className="flex-1 px-8 py-4 bg-gray-200 rounded-t-xl shadow transition duration-300 transform -skew-x-2 hover:bg-gray-100 -ml-2 border-b-2 border-gray-300">
          <a href={`/instructorapp/${course_id}/generated-exercises`} className="block w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 font-semibold transition-colors duration-300">
            <span className="text-md tracking-widest">HISTÓRICO DE SESIONES</span>
          </a>
        </div>
      </div>
    </>
  );
}