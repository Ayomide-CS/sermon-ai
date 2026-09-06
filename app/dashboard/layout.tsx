import Link from "next/link";
export default function DashboardLayout ({children,} : {children: React.ReactNode;}){
    return (
        <div>
            <aside>
                <h2>Dashboard</h2>
                <Link href="/dashboard">Overview</Link>
                <Link href="/dashboard/my-sermons">My Sermons</Link>
                <Link href="/dashboard/saved-notes">Saved Notes</Link>
                <Link href="/dashboard/settings">Settings</Link>
            </aside>
            <main>{children}</main>
        </div>
    );
}