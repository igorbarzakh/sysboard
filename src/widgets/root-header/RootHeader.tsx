import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";

interface RootHeaderProps {
  onSignInClick?: () => void;
}

export function RootHeader({ onSignInClick }: RootHeaderProps) {
  return (
    <header className="absolute top-2 left-0 right-0 h-14  flex items-center justify-between px-8 shrink-0">
      <Logo size="lg" />

      <Button variant="outline" size="lg" onClick={onSignInClick}>
        Sign in
      </Button>
    </header>
  );
}
