"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Define the form schema with Zod
const formSchema = z.object({
  defendant: z.string().optional(),
  defendantArbitrator: z.string().optional(),
  plaintiff: z.string().optional(),
  plaintiffArbitrator: z.string().optional(),
})

export default function Home() {
  const router = useRouter()

  // Initialize the form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defendant: "",
      defendantArbitrator: "",
      plaintiff: "",
      plaintiffArbitrator: "",
    },
  })

  // Handle form submission
  function onSubmit(values) {
    // Filter out empty values
    const entities = Object.entries(values)
      .filter(([_, value]) => value && value.trim() !== "")
      .map(([key, value]) => ({ type: key, name: value.trim() }))

    if (entities.length > 0) {
      // Encode the array as a JSON string in the URL
      const queryString = encodeURIComponent(JSON.stringify(entities))
      console.log("Query String:", queryString) // Debugging line
      router.push(`/analysis?query=${queryString}`)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">Start COF Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="defendant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Defendant</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter defendant name"
                        className="rounded-lg border-slate-200 focus-visible:ring-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defendantArbitrator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Defendant Arbitrator</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter defendant arbitrator"
                        className="rounded-lg border-slate-200 focus-visible:ring-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plaintiff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plaintiff</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter plaintiff name"
                        className="rounded-lg border-slate-200 focus-visible:ring-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plaintiffArbitrator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plaintiff Arbitrator</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter plaintiff arbitrator"
                        className="rounded-lg border-slate-200 focus-visible:ring-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-6 text-base bg-blue-800 hover:bg-blue-700 transition-colors"
              >
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

