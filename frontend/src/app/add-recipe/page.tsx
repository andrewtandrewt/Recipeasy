import Image from "next/image";

export default function AddRecipe() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Image
        className="dark:invert mb-6"
        src="/vercel.svg"
        alt="Vercel logomark"
        width={40}
        height={40}
      />
      <h1 className="text-2xl font-bold mb-4">Add a New Recipe</h1>
      <p className="text-gray-600 dark:text-gray-300">This is the Add Recipe page. Build your form here!</p>
    </div>
  );
}
