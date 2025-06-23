"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Settings, Edit, Trash2 } from "lucide-react"
import type { Category } from "@/lib/types"
import { dataStore } from "@/lib/data-store"

interface CategoryManagerProps {
  categories: Category[]
  onCategoriesChange: () => void
}

export function CategoryManager({ categories, onCategoriesChange }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    color: "#8884d8",
    type: "expense" as "expense" | "income",
  })

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
    "#ff0000",
    "#0088fe",
    "#00c49f",
    "#ffbb28",
    "#ff8042",
    "#8dd1e1",
    "#d084d0",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCategory) {
      await dataStore.updateCategory(editingCategory.id, formData)
    } else {
      await dataStore.addCategory(formData)
    }

    setFormData({ name: "", color: "#8884d8", type: "expense" })
    setEditingCategory(null)
    onCategoriesChange()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      type: category.type,
    })
  }

  const handleDelete = async (id: string) => {
      await dataStore.deleteCategory(id)
      onCategoriesChange()
  }

  const resetForm = () => {
    setFormData({ name: "", color: "#8884d8", type: "expense" })
    setEditingCategory(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Add, edit, or delete expense and income categories</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "expense" | "income") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? "border-gray-900" : "border-gray-300"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingCategory ? "Update" : "Add"} Category</Button>
                {editingCategory && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Categories</h3>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant={category.type === "expense" ? "destructive" : "default"}>{category.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: category.color }} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
