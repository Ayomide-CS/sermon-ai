export default function DashboardLayout ({children,} : {children: React.ReactNode;}){
    return (
        <div>
            <aside>
                <h2>Dashboard</h2>
                <p>Overview</p>
                <p>My Sermons</p>
                <p>Saved Notes</p>
                <p>Settings</p>
            </aside>
            <main>{children}</main>
        </div>
    );
}