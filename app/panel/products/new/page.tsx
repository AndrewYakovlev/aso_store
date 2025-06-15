"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ProductForm } from "@/widgets/product-form"

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")

  return (
    <ProductForm
      duplicateId={duplicateId}
      onSuccess={() => router.push("/panel/products")}
      onCancel={() => router.push("/panel/products")}
    />
  )
}