"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Settings, User } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  if (pathname !== "/" && pathname !== "/settings") return null

  const links = [
    {
      href: "/",
      label: "Boards",
      icon: LayoutDashboard,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-[#1c1c1c] border-r border-[#2a2a2a] shadow-lg pt-14">
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 px-4 mt-8">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-[#313543] text-white"
                : "text-zinc-400 hover:bg-[#2a2d3a] hover:text-white"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer / Profil */}
      <div className="px-4 py-6 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors">
          <User size={18} />
          <span>Profilim</span>
        </div>
      </div>
    </aside>
  )
}
