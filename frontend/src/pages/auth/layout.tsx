export default function AuthLayout(
    {children}: {
        children: React.ReactNode
    }
) {
    return (
        <main className="w-screen h-screen bg-gray-100 flex items-center justify-center py-4">
            <div className="w-full max-w-3xl bg-white text-dark p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    {children}
                </div>
            </div>
        </main>
    )
}