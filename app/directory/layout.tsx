import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Directory",
    description: "Find verified Akita owners, breeders, and kennels near you.",
};

export default function DirectoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
