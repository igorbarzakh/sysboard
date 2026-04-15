import { Button, Logo } from "@shared/ui";
import styles from "./RootHeader.module.scss";

interface RootHeaderProps {
  onSignInClick?: () => void;
}

export function RootHeader({ onSignInClick }: RootHeaderProps) {
  return (
    <header className={styles.header}>
      <Logo size="lg" />

      <Button variant="outline" size="lg" onClick={onSignInClick}>
        Sign in
      </Button>
    </header>
  );
}
