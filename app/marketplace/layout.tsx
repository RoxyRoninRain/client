import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Marketplace",
    description: "Buy and sell Akita-related items, gear, and supplies.",
};

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
