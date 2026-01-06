"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import {
  History,
  RefreshCw,
  Shield,
  FileText,
  Download,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Plus,
  ShieldCheck,
} from "lucide-react"
import type { Organization } from "@/lib/types"

interface VeximAgent {
  id: string
  agent_name: string
  agent_company: string | null
  agent_address: string
  agent_city: string
  agent_state: string
  agent_zip: string
  agent_phone: string
  agent_email: string
  service_description: string | null
}

interface ComplianceData {
  legalReadinessScore: number
  canExportFDA: boolean
  missingFields: string[]
}

interface Certificate {
  id: string
  name: string
  type: string
  uploadedDate: string
  expiryDate?: string
  fileUrl?: string
}

export default function FDACompliancePage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [veximAgent, setVeximAgent] = useState<VeximAgent | null>(null)
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const { toast } = useToast()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

      if (!profile?.organization_id) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy tổ chức",
          variant: "destructive",
        })
        return
      }

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.organization_id)
        .single()

      if (orgError) throw orgError
      setOrganization(org)

      if (org.use_vexim_agent) {
        const agentResponse = await fetch("/api/vexim/agent")
        const agentData = await agentResponse.json()
        setVeximAgent(agentData)
      }

      const complianceResponse = await fetch(`/api/vexim/compliance-readiness?organizationId=${org.id}`)
      const compliance = await complianceResponse.json()
      setComplianceData(compliance)

      // TODO: Replace with actual API call when certificate storage is implemented
      setCertificates([
        {
          id: "1",
          name: "Giấy đăng ký kinh doanh",
          type: "business_registration",
          uploadedDate: "2024-06-15",
          fileUrl: "/mock/business-registration.pdf",
        },
      ])
    } catch (error: any) {
      console.error("[v0] Error loading FDA compliance data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu tuân thủ FDA",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshCompliance = async () => {
    setIsRefreshing(true)
    try {
      await loadData()
      toast({
        title: "Đã làm mới",
        description: "Dữ liệu tuân thủ đã được cập nhật",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể làm mới dữ liệu",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewAuditHistory = () => {
    router.push("/dashboard/settings?tab=audit-logs")
  }

  const handleDownloadVeximCertificate = async () => {
    if (!organization?.fda_registration_number) {
      toast({
        title: "Không khả dụng",
        description: "Bạn cần đăng ký FDA trước khi tải chứng chỉ",
        variant: "destructive",
      })
      return
    }

    try {
      toast({
        title: "Đang tạo chứng chỉ...",
        description: "Vui lòng đợi trong giây lát",
      })

      const response = await fetch("/api/vexim/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id }),
      })

      if (!response.ok) throw new Error("Failed to generate certificate")

      const html = await response.text()
      const newWindow = window.open("", "_blank")
      if (newWindow) {
        newWindow.document.write(html)
        newWindow.document.close()

        toast({
          title: "Chứng chỉ đã sẵn sàng",
          description: "Sử dụng Ctrl+P hoặc Cmd+P để in thành PDF",
        })
      } else {
        throw new Error("Popup bị chặn")
      }
    } catch (error) {
      console.error("[v0] Error generating certificate:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo chứng chỉ. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleUploadCertificate = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf,.jpg,.jpeg,.png"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      toast({
        title: "Đang tải lên...",
        description: `Đang tải ${file.name}`,
      })

      // TODO: Implement actual file upload to storage
      // For now, just mock the upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Tải lên thành công",
        description: "Chứng chỉ đã được lưu",
      })

      // Refresh certificates list
      loadData()
    }
    input.click()
  }

  const handleRenewRegistration = () => {
    if (!organization?.fda_registration_number) {
      toast({
        title: "Không khả dụng",
        description: "Bạn cần đăng ký FDA trước khi gia hạn",
        variant: "destructive",
      })
      return
    }

    router.push("/dashboard/fda-requests?action=renew")
  }

  const handleDownloadBusinessRegistration = async () => {
    try {
      toast({
        title: "Đang tải xuống...",
        description: "Đang tải giấy đăng ký kinh doanh",
      })

      // Simulate download
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Tải xuống thành công",
        description: "Giấy đăng ký đã được tải về",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải tài liệu",
        variant: "destructive",
      })
    }
  }

  const handleViewPOA = () => {
    if (!organization?.poa_signed) {
      toast({
        title: "Chưa có tài liệu",
        description: "Giấy ủy quyền chưa được ký",
        variant: "destructive",
      })
      return
    }

    router.push("/dashboard/fda-requests?view=poa")
  }

  const handleRequestSupport = () => {
    if (!veximAgent) {
      toast({
        title: "Không khả dụng",
        description: "Thông tin đại diện không có sẵn",
        variant: "destructive",
      })
      return
    }

    // Open email client
    window.location.href = `mailto:${veximAgent.agent_email}?subject=FDA Compliance Support Request&body=Xin chào ${veximAgent.agent_name},%0D%0A%0D%0ATôi cần hỗ trợ về tuân thủ FDA.`
  }

  const handleViewServiceContract = () => {
    toast({
      title: "Đang mở hợp đồng...",
      description: "Chuyển đến trang hợp đồng dịch vụ",
    })
    router.push("/dashboard/settings?tab=contracts")
  }

  const handleNavigateToFDARegistration = () => {
    router.push("/dashboard/admin/fda-registrations")
  }

  const getRenewalStatus = () => {
    if (!organization?.fda_renewal_deadline) return null

    const deadline = new Date(organization.fda_renewal_deadline)
    const today = new Date()
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return { status: "expired", days: Math.abs(daysUntil), color: "red" }
    if (daysUntil <= 90) return { status: "urgent", days: daysUntil, color: "amber" }
    return { status: "valid", days: daysUntil, color: "emerald" }
  }

  const renewalStatus = getRenewalStatus()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="size-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Không tìm thấy thông tin tổ chức</p>
      </div>
    )
  }

  const complianceScore = complianceData?.legalReadinessScore || 0

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Trung tâm Tuân thủ FDA</h1>
            <p className="text-gray-400">Quản lý định danh cơ sở và đại diện pháp lý tại Hoa Kỳ.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleViewAuditHistory}>
              <History className="size-4" />
              Lịch sử kiểm toán
            </Button>
            <Button className="gap-2 gradient-emerald" onClick={handleRefreshCompliance} disabled={isRefreshing}>
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Làm mới trang thái
            </Button>
          </div>
        </div>

        {/* FDA Registration CTA if not registered */}
        {!organization?.fda_registration_number && (
          <Card className="p-6 glass-strong border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center">
                  <ShieldCheck className="size-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-1">Bạn chưa đăng ký FDA</h3>
                  <p className="text-sm text-gray-400 max-w-xl">
                    Đăng ký cơ sở với FDA là bắt buộc để xuất khẩu thực phẩm sang Hoa Kỳ. Bắt đầu quy trình đăng ký ngay
                    để tuân thủ pháp luật FDA.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="gap-2 gradient-amber shadow-lg hover:shadow-amber-500/20 font-bold"
                onClick={handleNavigateToFDARegistration}
              >
                <ShieldCheck className="size-5" />
                Đăng ký FDA ngay
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Card */}
            <Card className="p-6 glass-strong border-emerald-500/30">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl gradient-emerald flex items-center justify-center">
                    <Shield className="size-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white mb-1">{organization.name}</h2>
                    <p className="text-sm text-gray-400">Cơ sở sản xuất thực phẩm (Food Facility)</p>
                  </div>
                </div>
                <Badge
                  className={`${
                    organization.fda_registration_status === "active"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  } uppercase font-bold px-3 py-1`}
                >
                  {organization.fda_registration_status || "INACTIVE"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">FDA REG NUMBER</p>
                  <p className="text-lg font-black text-white">
                    {organization.fda_registration_number || "Chưa đăng ký"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">DUNS NUMBER</p>
                  <p className="text-lg font-black text-white">{organization.duns_number || "N/A"}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">THỜI HẠN HỢP ĐỒNG</p>
                  <p className="text-lg font-black text-white">
                    {organization.agent_contract_end_date
                      ? new Date(organization.agent_contract_end_date).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* U.S. Agent Card */}
            {organization.use_vexim_agent && veximAgent && (
              <Card className="p-6 glass-strong border-blue-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="size-6 text-blue-400" />
                  <h3 className="text-xl font-black text-white">
                    Đại diện U.S. Agent ({veximAgent.agent_company || "VEXIM Global"})
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-bold text-white mb-2">
                      {veximAgent.agent_company || "Vexim Global Compliance LLC"}
                    </p>
                    <div className="flex items-start gap-2 text-gray-400 text-sm">
                      <MapPin className="size-4 mt-0.5 shrink-0" />
                      <span>
                        {veximAgent.agent_address}, {veximAgent.agent_city}, {veximAgent.agent_state}{" "}
                        {veximAgent.agent_zip}, USA
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-4 text-blue-400" />
                      <span className="text-white font-medium">{veximAgent.agent_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-blue-400" />
                      <span className="text-white font-medium">{veximAgent.agent_email}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="default" className="flex-1 gradient-blue" onClick={handleRequestSupport}>
                      Gửi yêu cầu hỗ trợ
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={handleViewServiceContract}>
                      Xem hợp đồng dịch vụ
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 glass-strong border-white/10">
              <div className="mb-4">
                <h3 className="text-xl font-black text-white">Hồ sơ & Chứng chỉ</h3>
              </div>

              <div className="space-y-3">
                {/* Power of Attorney */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={handleViewPOA}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                      <FileText className="size-5 text-rose-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Giấy ủy quyền (Power of Attorney)</p>
                      <p className="text-xs text-gray-400">
                        {organization.poa_signed ? "Đã ký số bởi Giám đốc" : "Chưa ký"}
                      </p>
                    </div>
                  </div>
                  {organization.poa_signed ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase font-bold">
                      HỢP LỆ
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-400">
                      Chưa có
                    </Badge>
                  )}
                </div>

                {/* Uploaded Certificates */}
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FileText className="size-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{cert.name}</p>
                        <p className="text-xs text-gray-400">
                          Tải lên: {new Date(cert.uploadedDate).toLocaleDateString("vi-VN")}
                          {cert.expiryDate && ` • Hết hạn: ${new Date(cert.expiryDate).toLocaleDateString("vi-VN")}`}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => window.open(cert.fileUrl, "_blank")}>
                      <Download className="size-4" />
                    </Button>
                  </div>
                ))}

                <div
                  onClick={handleUploadCertificate}
                  className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <Plus className="size-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Thêm chứng chỉ (HACCP, ISO, ATTP...)</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Compliance Score */}
            <Card className="p-6 glass-strong border-white/10">
              <p className="text-sm font-bold text-gray-400 text-center mb-6 uppercase tracking-wider">
                ĐIỂM TUÂN THỦ PHÁP LÝ
              </p>

              <div className="relative size-48 mx-auto mb-6">
                <svg className="transform -rotate-90 size-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - complianceScore / 100)}`}
                    className="text-emerald-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-black text-white">{Math.round(complianceScore)}</p>
                    <p className="text-xl font-bold text-emerald-500">%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Đăng ký FDA</span>
                  {organization.fda_registration_number ? (
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      Hoàn tất <CheckCircle2 className="size-4" />
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                      Chưa đăng ký <XCircle className="size-4" />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Ủy quyền PoA</span>
                  {organization.poa_signed ? (
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      Đã ký <CheckCircle2 className="size-4" />
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                      Chưa ký <XCircle className="size-4" />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Xác thực Agent</span>
                  {organization.use_vexim_agent ? (
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      Verified <CheckCircle2 className="size-4" />
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-gray-400 flex items-center gap-1">N/A</span>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 glass-strong border-white/10">
              <h3 className="text-lg font-black text-white mb-4">Hành động Nhanh</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                  onClick={handleDownloadVeximCertificate}
                >
                  <Download className="size-4 text-emerald-400" />
                  Tải chứng chỉ VEXIM
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 bg-transparent"
                  onClick={handleRenewRegistration}
                >
                  <Calendar className="size-4 text-blue-400" />
                  Gia hạn đăng ký
                </Button>
              </div>
            </Card>

            {/* Renewal Alert */}
            {renewalStatus && renewalStatus.status !== "valid" && (
              <Card className="p-6 glass-strong border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-6 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <p className="font-black text-amber-400 uppercase text-sm mb-2">NHẮC NHỞ GIA HẠN</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Mã đăng ký FDA của bạn sẽ cần được gia hạn vào{" "}
                      <span className="font-bold text-amber-400">
                        {organization.fda_renewal_deadline
                          ? new Date(organization.fda_renewal_deadline).toLocaleDateString("vi-VN", {
                              month: "long",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                      . VEXIM sẽ tự động nhắc bạn trước 30 ngày.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
