import Image from "next/image";

interface DogProfileProps {
    name: string;
    breed: string;
    is_verified: boolean;
    owner_email: string;
    registration_number: string;
    imageUrl: string;
}

export default function DogProfile({ name, breed, is_verified, owner_email, registration_number, imageUrl }: DogProfileProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover rounded-full md:rounded-xl"
                />
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{name}</h1>
                    {is_verified && (
                        <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full font-semibold">Verified Owner</span>
                    )}
                </div>

                <p className="text-gray-500 mb-4">{breed} • Reg: {registration_number}</p>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg inline-block">
                    <p className="text-sm text-gray-500">Owner Contact</p>
                    <p className="font-medium text-teal-600">{owner_email}</p>
                </div>
            </div>
        </div>
    );
}
