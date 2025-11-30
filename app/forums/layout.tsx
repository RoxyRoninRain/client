import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forums",
    description: "Discuss health, training, and general Akita topics with the community.",
};

export default function ForumsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
