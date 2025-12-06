"use client";
import { useState, cloneElement } from "react";

export function Accordion({ value, onValueChange, children }: any) {
    return (
        <div className="space-y-3">
            {children.map((item: any) =>
                cloneElement(item, {
                    isOpen: value === item.props.value,
                    toggle: () =>
                        onValueChange(value === item.props.value ? null : item.props.value),
                })
            )}
        </div>
    );
}

export function AccordionItem({ id, title, children, actions, active, setActive }: any) {
    const isOpen = active === id;

    return (
        <div className=" rounded mb-4 shadow-sm">
            {/* HEADER */}
            <div
                className="flex justify-between items-center px-4 py-3 bg-gray-100 cursor-pointer"
                onClick={() => setActive(isOpen ? null : id)}
            >
                <h3 className="font-medium text-gray-800">{title || "Untitled Entry"}</h3>

                {/* Edit / Delete visible on header */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {actions}
                </div>
            </div>

            {/* CONTENT */}
            {isOpen && (
                <div className="p-4 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
}


export function AccordionTrigger({ isOpen, toggle, children }: any) {
    return (
        <button
            onClick={toggle}
            className="w-full p-4 flex justify-between items-center"
        >
            {children}
            <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                ▼
            </span>
        </button>
    );
}

export function AccordionContent({ isOpen, children }: any) {
    return (
        <div
            className={`transition-all overflow-hidden ${isOpen ? "max-h-[900px] p-4" : "max-h-0 p-0"
                }`}
        >
            {isOpen && children}
        </div>
    );
}
