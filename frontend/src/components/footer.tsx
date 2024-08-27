import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="mt-auto py-4 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2">
                    <Link href="#" className="hover:underline" prefetch={false}>
                        Terms of Service
                    </Link>
                    {/* ... other footer content ... */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;