import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  mobile?: boolean;
  onClick?: () => void;
}

export function NavLink({ href, children, mobile, onClick }: NavLinkProps) {
  const router = useRouter();
  const isActive = router.pathname === href;

  const baseStyles = "text-sm font-medium transition-colors";
  const activeStyles = "text-zinc-900 dark:text-zinc-100";
  const inactiveStyles = "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

  const desktopStyles = "";
  const mobileStyles = "block px-2 py-1";

  return (
    <Link
      href={href}
      className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles} ${mobile ? mobileStyles : desktopStyles}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
