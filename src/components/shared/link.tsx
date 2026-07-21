export function Link({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className="cursor-pointer hover:underline decoration-2 decoration-green-600 underline-offset-2" {...props}>
      {children}
    </a>
  );
}
