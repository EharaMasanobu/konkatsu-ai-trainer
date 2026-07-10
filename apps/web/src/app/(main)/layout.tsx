import { Providers } from "@/app/providers";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <Providers>{children}</Providers>;
}
