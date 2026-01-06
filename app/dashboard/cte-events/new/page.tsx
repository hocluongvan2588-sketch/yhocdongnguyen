"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { KDEForm } from "@/components/fsma/kde-form"
import { CTEFlowDiagram } from "@/components/fsma/cte-flow-diagram"
import type { CTEType, OrganizationType } from "@/lib/types"
import { useLanguage } from "@/hooks/use-language"
import { createBrowserClient } from "@/lib/supabase/client"

export default function NewCTEEventPage() {
  const [selectedEventType, setSelectedEventType] = useState<CTEType | null>(null)
  const [organizationType, setOrganizationType] = useState<OrganizationType | null>(null)
  const [organizationName, setOrganizationName] = useState<string>("")
  const [completedCTEs, setCompletedCTEs] = useState<CTEType[]>([])
  const [isLoadingOrg, setIsLoadingOrg] = useState(true)

  const { t, locale } = useLanguage()
  const supabase = createBrowserClient()

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoadingOrg(false)
          return
        }

        // Get user's organization
        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

        if (profile?.organization_id) {
          // Get organization details
          const { data: org } = await supabase
            .from("organizations")
            .select("name, organization_type")
            .eq("id", profile.organization_id)
            .single()

          if (org) {
            setOrganizationName(org.name)
            setOrganizationType(org.organization_type as OrganizationType)
          }

          // Get completed CTE events
          const { data: cteEvents } = await supabase
            .from("cte_events")
            .select("event_type")
            .eq("organization_id", profile.organization_id)
            .order("created_at", { ascending: false })

          if (cteEvents && cteEvents.length > 0) {
            // Get unique event types
            const uniqueTypes = Array.from(new Set(cteEvents.map((e) => e.event_type as CTEType)))
            setCompletedCTEs(uniqueTypes)
          }
        }
      } catch (error) {
        console.error("[v0] Error loading organization data:", error)
      } finally {
        setIsLoadingOrg(false)
      }
    }

    loadOrganizationData()
  }, [])

  const handleCTECompleted = (eventType: CTEType) => {
    if (!completedCTEs.includes(eventType)) {
      setCompletedCTEs((prev) => [...prev, eventType])
    }
  }

  const eventTypes: { value: CTEType; label: string; description: string }[] = [
    { value: "harvesting", label: t("cte.harvesting"), description: t("newCteEvent.harvestingDesc") },
    { value: "cooling", label: t("cte.cooling"), description: t("newCteEvent.coolingDesc") },
    { value: "initial_packing", label: t("cte.initialPacking"), description: t("newCteEvent.initialPackingDesc") },
    {
      value: "first_receiver",
      label: t("cte.firstReceiver"),
      description: t("newCteEvent.firstReceiverDesc"),
    },
    { value: "shipping", label: t("cte.shipping"), description: t("newCteEvent.shippingDesc") },
    { value: "receiving", label: t("cte.receiving"), description: t("newCteEvent.receivingDesc") },
    {
      value: "transformation",
      label: t("cte.transformation"),
      description: t("newCteEvent.transformationDesc"),
    },
  ]

  // Ép kiểu KDEForm để chấp nhận onSuccess prop nếu định nghĩa gốc bị thiếu
  const KDEFormSafe = KDEForm as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/cte-events">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("newCteEvent.title")}</h1>
          <p className="text-muted-foreground">{t("newCteEvent.description")}</p>
        </div>
      </div>

      {!isLoadingOrg && organizationType && (
        <CTEFlowDiagram
          organizationType={organizationType}
          organizationName={organizationName}
          completedStages={completedCTEs}
          currentStage={selectedEventType}
        />
      )}

      {/* Event Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("newCteEvent.selectType")}</CardTitle>
          <CardDescription>{t("newCteEvent.selectTypeDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="eventType">{t("cte.eventType")}</Label>
            <Select
              value={selectedEventType || undefined}
              onValueChange={(value) => setSelectedEventType(value as CTEType)}
            >
              <SelectTrigger id="eventType">
                <SelectValue placeholder={t("newCteEvent.selectEventType")} />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KDE Form */}
      {selectedEventType && (
        <KDEFormSafe
          eventType={selectedEventType}
          locale={locale}
          onSuccess={() => handleCTECompleted(selectedEventType)}
        />
      )}
    </div>
  )
}