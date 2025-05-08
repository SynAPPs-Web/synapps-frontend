"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, Search, X } from "lucide-react"

export function BoardFilter({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [isFilterActive, setIsFilterActive] = useState(false)

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    applyFilters(value, statusFilter, assigneeFilter)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    applyFilters(searchTerm, status, assigneeFilter)
    setIsFilterActive(true)
  }

  const handleAssigneeFilter = (assignee) => {
    setAssigneeFilter(assignee)
    applyFilters(searchTerm, statusFilter, assignee)
    setIsFilterActive(true)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setAssigneeFilter("")
    applyFilters("", "", "")
    setIsFilterActive(false)
  }

  const applyFilters = (search, status, assignee) => {
    onFilterChange({
      searchTerm: search,
      status: status,
      assignee: assignee,
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Görev ara..."
          className="pl-8 bg-gray-800 border-gray-700 text-white"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => {
              setSearchTerm("")
              applyFilters("", statusFilter, assigneeFilter)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isFilterActive ? "default" : "outline"}
            size="sm"
            className={isFilterActive ? "bg-primary" : "bg-gray-800 border-gray-700 text-white"}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtrele
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700">
          <DropdownMenuLabel className="text-white">Görev Filtreleri</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-sm text-gray-400">Durum</DropdownMenuLabel>
            <DropdownMenuItem
              className={`text-gray-200 focus:bg-gray-700 focus:text-white ${statusFilter === "todo" ? "bg-gray-700" : ""}`}
              onClick={() => handleStatusFilter("todo")}
            >
              Yapılacak
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-gray-200 focus:bg-gray-700 focus:text-white ${statusFilter === "in_progress" ? "bg-gray-700" : ""}`}
              onClick={() => handleStatusFilter("in_progress")}
            >
              Devam Ediyor
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-gray-200 focus:bg-gray-700 focus:text-white ${statusFilter === "done" ? "bg-gray-700" : ""}`}
              onClick={() => handleStatusFilter("done")}
            >
              Tamamlandı
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-sm text-gray-400">Atanan</DropdownMenuLabel>
            <DropdownMenuItem
              className={`text-gray-200 focus:bg-gray-700 focus:text-white ${assigneeFilter === "me" ? "bg-gray-700" : ""}`}
              onClick={() => handleAssigneeFilter("me")}
            >
              Bana Atananlar
            </DropdownMenuItem>
            <DropdownMenuItem
              className={`text-gray-200 focus:bg-gray-700 focus:text-white ${assigneeFilter === "unassigned" ? "bg-gray-700" : ""}`}
              onClick={() => handleAssigneeFilter("unassigned")}
            >
              Atanmamış
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem className="text-gray-200 focus:bg-gray-700 focus:text-white" onClick={clearFilters}>
            Filtreleri Temizle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
