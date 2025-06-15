"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ProductForm } from "@/widgets/product-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  return (
    <ProductForm
      productId={id === "new" ? undefined : id}
      onSuccess={() => router.push("/panel/products")}
      onCancel={() => router.push("/panel/products")}
    />
  )
}