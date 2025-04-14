import React from "react";

export default function OffCanvas(
    {children, id}: { children: React.ReactNode, id: string }
) {
    return (
        <>
            <div className="offcanvas offcanvas-end w-full w-lg-1/3" data-bs-scroll="true" data-bs-backdrop="true"
                 id={id} aria-labelledby="offcanvasCreateLabel" aria-modal="true"
                 role="dialog">
                {children}
            </div>
        </>
    )
}