import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join the Community",
    description: "Create an account to connect with other Akita owners.",
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
