
import Link from "next/link";

const Logo: React.FC = () => {
  return (
    <Link href="/">
     <h2 className="font-bold text-2xl">Unified Healthcare<span className="text-blue-500 text-5xl">.</span></h2>
    </Link>
  );
};

export default Logo;
